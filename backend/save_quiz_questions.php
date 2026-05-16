<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Must be logged in as an instructor
if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$item_id = (int)($data['item_id'] ?? 0);
$questions = $data['questions'] ?? [];

if ($item_id === 0 || empty($questions)) {
    echo json_encode(['success' => false, 'message' => 'Missing quiz data.']);
    exit;
}

// Verify ownership of the item
$instructor_id = $_SESSION['user_id'];
$check = $conn->prepare("SELECT id FROM items WHERE id = ? AND instructor_id = ?");
$check->bind_param("ii", $item_id, $instructor_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Item not found or unauthorized.']);
    exit;
}

$conn->begin_transaction();

try {
    // Clear old questions
    $del = $conn->prepare("DELETE FROM quiz_questions WHERE item_id = ?");
    $del->bind_param("i", $item_id);
    $del->execute();

    // Insert new questions
    $stmt = $conn->prepare("INSERT INTO quiz_questions (item_id, question, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($questions as $q) {
        $stmt->bind_param("issssss", 
            $item_id, 
            $q['question'], 
            $q['option_a'], 
            $q['option_b'], 
            $q['option_c'], 
            $q['option_d'], 
            $q['correct_option']
        );
        $stmt->execute();
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Questions saved successfully.']);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>

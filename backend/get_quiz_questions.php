<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Login required']);
    exit;
}

$item_id = (int)($_GET['item_id'] ?? 0);

if ($item_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid ID']);
    exit;
}

// Fetch questions (but DON'T include the correct_option for students)
$is_instructor = ($_SESSION['role'] === 'instructor');

if ($is_instructor) {
    $stmt = $conn->prepare("SELECT * FROM quiz_questions WHERE item_id = ?");
} else {
    $stmt = $conn->prepare("SELECT id, item_id, question, option_a, option_b, option_c, option_d FROM quiz_questions WHERE item_id = ?");
}

$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();
$questions = [];

while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}

echo json_encode(['success' => true, 'questions' => $questions]);
$conn->close();
?>

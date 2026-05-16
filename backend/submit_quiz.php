<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only students can submit quizzes.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$item_id = (int)($data['item_id'] ?? 0);
$answers = $data['answers'] ?? []; // Array of [question_id => selected_option]

if ($item_id === 0 || empty($answers)) {
    echo json_encode(['success' => false, 'message' => 'Incomplete submission.']);
    exit;
}

$student_id = $_SESSION['user_id'];

// 1. Fetch correct answers
$stmt = $conn->prepare("SELECT id, correct_option FROM quiz_questions WHERE item_id = ?");
$stmt->bind_param("i", $item_id);
$stmt->execute();
$result = $stmt->get_result();

$grading = [];
while ($row = $result->fetch_assoc()) {
    $grading[$row['id']] = $row['correct_option'];
}

$total_possible = count($grading);
if ($total_possible === 0) {
    echo json_encode(['success' => false, 'message' => 'Quiz has no questions.']);
    exit;
}

// 2. Automate Marking
$score = 0;
foreach ($answers as $q_id => $selection) {
    if (isset($grading[$q_id]) && $grading[$q_id] === $selection) {
        $score++;
    }
}

// 3. Save result
try {
    $save = $conn->prepare("INSERT INTO quiz_results (item_id, student_id, score, total_possible) VALUES (?, ?, ?, ?) 
                           ON DUPLICATE KEY UPDATE score = VALUES(score), total_possible = VALUES(total_possible), submitted_at = CURRENT_TIMESTAMP");
    $save->bind_param("iiii", $item_id, $student_id, $score, $total_possible);
    $save->execute();

    echo json_encode([
        'success' => true, 
        'message' => 'Quiz submitted and marked automatically!',
        'score' => $score,
        'total' => $total_possible,
        'percentage' => round(($score / $total_possible) * 100, 1) . '%'
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>

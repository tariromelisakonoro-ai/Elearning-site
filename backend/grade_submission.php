<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'instructor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Instructors only.']);
    exit;
}

$submission_id = isset($_POST['submission_id']) ? (int)$_POST['submission_id'] : 0;
$grade         = isset($_POST['grade']) ? $_POST['grade'] : '';
$feedback      = isset($_POST['feedback']) ? $_POST['feedback'] : '';

if ($submission_id === 0 || empty($grade)) {
    echo json_encode(['success' => false, 'message' => 'Submission ID and Grade are required.']);
    exit;
}

$stmt = $conn->prepare("UPDATE submissions SET grade = ?, feedback = ?, status = 'graded' WHERE id = ?");
$stmt->bind_param("ssi", $grade, $feedback, $submission_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Graded successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>

<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'administrator') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$data          = json_decode(file_get_contents('php://input'), true);
$instructor_id = (int)($data['instructor_id'] ?? 0);

if (!$instructor_id) {
    echo json_encode(['success' => false, 'message' => 'Invalid instructor.']);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET approved = 1 WHERE id = ? AND role = 'instructor'");
$stmt->bind_param("i", $instructor_id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'Instructor approved.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Could not approve instructor.']);
}

$stmt->close();
$conn->close();
?>

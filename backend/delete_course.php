<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Must be logged in as an approved instructor
if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$data      = json_decode(file_get_contents('php://input'), true);
$course_id = intval($data['id'] ?? 0);

if (!$course_id) {
    echo json_encode(['success' => false, 'message' => 'Course ID is required.']);
    exit;
}

$instructor_id = $_SESSION['user_id'];

// Ensure the course belongs to this instructor
$stmt = $conn->prepare("DELETE FROM courses WHERE id = ? AND instructor_id = ?");
$stmt->bind_param("ii", $course_id, $instructor_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Course deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Course not found or unauthorized.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}

$stmt->close();
$conn->close();
?>

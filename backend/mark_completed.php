<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$course_id = $data['course_id'] ?? 0;

if (!$course_id) {
    echo json_encode(['success' => false, 'message' => 'Invalid course ID']);
    exit;
}

$student_id = $_SESSION['user_id'];

// Check if enrolled and approved
$sql = "SELECT id, status FROM course_enrollments WHERE course_id = ? AND student_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $course_id, $student_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Not enrolled in this course.']);
    $stmt->close();
    exit;
}

$enrollment = $result->fetch_assoc();
if ($enrollment['status'] !== 'approved') {
    echo json_encode(['success' => false, 'message' => 'Enrollment not approved yet.']);
    $stmt->close();
    exit;
}
$stmt->close();

// Update completed_at
$sql_update = "UPDATE course_enrollments SET completed_at = CURRENT_TIMESTAMP WHERE course_id = ? AND student_id = ?";
$stmt_update = $conn->prepare($sql_update);
$stmt_update->bind_param("ii", $course_id, $student_id);

if ($stmt_update->execute()) {
    echo json_encode(['success' => true, 'message' => 'Course marked as completed!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

$stmt_update->close();
$conn->close();
?>

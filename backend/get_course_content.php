<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

$course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;

if (!$course_id) {
    echo json_encode(['success' => false, 'message' => 'Course ID is required.']);
    exit;
}

// Fetch course details first (optional but good for context)
$course_stmt = $conn->prepare("SELECT title, description, subject FROM courses WHERE id = ?");
$course_stmt->bind_param("i", $course_id);
$course_stmt->execute();
$course = $course_stmt->get_result()->fetch_assoc();

if (!$course) {
    echo json_encode(['success' => false, 'message' => 'Course not found.']);
    exit;
}

// Fetch all items for this course
$items_stmt = $conn->prepare("SELECT * FROM items WHERE course_id = ? ORDER BY created_at ASC");
$items_stmt->bind_param("i", $course_id);
$items_stmt->execute();
$result = $items_stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

$completed_at = null;
if (!empty($_SESSION['user_id']) && $_SESSION['role'] === 'student') {
    $student_id = $_SESSION['user_id'];
    $stmt_enroll = $conn->prepare("SELECT completed_at FROM course_enrollments WHERE course_id = ? AND student_id = ?");
    $stmt_enroll->bind_param("ii", $course_id, $student_id);
    $stmt_enroll->execute();
    $enroll_res = $stmt_enroll->get_result()->fetch_assoc();
    if ($enroll_res) {
        $completed_at = $enroll_res['completed_at'];
    }
    $stmt_enroll->close();
}

$course['id'] = $course_id;

echo json_encode([
    'success' => true,
    'course' => $course,
    'items' => $items,
    'completed_at' => $completed_at
]);

$items_stmt->close();
$course_stmt->close();
$conn->close();
?>

<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

// Catch all fatal DB errors and return JSON instead of crashing
set_exception_handler(function($e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
});

require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($_SESSION['user_id']) && empty($_POST['user_id']) && empty($data['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$course_id  = isset($data['course_id']) ? (int)$data['course_id'] : (isset($_POST['course_id']) ? (int)$_POST['course_id'] : 0);
$student_id = !empty($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : (!empty($data['user_id']) ? (int)$data['user_id'] : (int)$_POST['user_id']);

if (!$course_id) {
    echo json_encode(['success' => false, 'message' => 'Course ID is required.']);
    exit;
}

// Verify course exists
$courseCheck = $conn->prepare("SELECT id FROM courses WHERE id = ?");
$courseCheck->bind_param("i", $course_id);
$courseCheck->execute();
$courseCheck->store_result();
if ($courseCheck->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Course not found.']);
    $courseCheck->close();
    exit;
}
$courseCheck->close();

// Check if already enrolled or requested
$stmt = $conn->prepare("SELECT status FROM course_enrollments WHERE student_id = ? AND course_id = ?");
$stmt->bind_param("ii", $student_id, $course_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $statusMsg = ucfirst($row['status']);
    echo json_encode(['success' => false, 'message' => "You already have an enrollment for this course. Status: $statusMsg"]);
    $stmt->close();
    exit;
}
$stmt->close();

// Insert enrollment
$stmt = $conn->prepare("INSERT INTO course_enrollments (student_id, course_id, status) VALUES (?, ?, 'pending')");
$stmt->bind_param("ii", $student_id, $course_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Enrollment request submitted! Waiting for approval.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>

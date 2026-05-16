<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id']) || ($_SESSION['role'] !== 'administrator' && $_SESSION['role'] !== 'instructor')) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$is_admin = ($_SESSION['role'] === 'administrator');

$data = json_decode(file_get_contents('php://input'), true);
$enrollment_id = $data['enrollment_id'] ?? 0;
$action = strtolower($data['action'] ?? ''); // 'approve' or 'reject'

if (!$enrollment_id || !in_array($action, ['approve', 'reject'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid parameters.']);
    exit;
}

$newStatus = ($action === 'approve') ? 'approved' : 'rejected';

if ($is_admin) {
    $stmt = $conn->prepare("UPDATE course_enrollments SET status = ? WHERE id = ? AND status = 'pending'");
    if (!$stmt) { echo json_encode(['success' => false, 'message' => 'Prepare error: ' . $conn->error]); exit; }
    $stmt->bind_param("si", $newStatus, $enrollment_id);
} else {
    // Instructor can only update if they own the course
    $stmt = $conn->prepare("
        UPDATE course_enrollments 
        SET status = ? 
        WHERE id = ? AND status = 'pending' 
        AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?)
    ");
    if (!$stmt) { echo json_encode(['success' => false, 'message' => 'Prepare error: ' . $conn->error]); exit; }
    $stmt->bind_param("sii", $newStatus, $enrollment_id, $user_id);
}

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => "Enrollment successfully $newStatus."]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Enrollment not found or already processed.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>

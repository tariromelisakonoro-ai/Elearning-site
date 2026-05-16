<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Allow administrators and instructors to view pending enrollments
if (empty($_SESSION['user_id']) || ($_SESSION['role'] !== 'administrator' && $_SESSION['role'] !== 'instructor')) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$is_admin = ($_SESSION['role'] === 'administrator');

$sql = "SELECT e.id as enrollment_id, e.status, e.enrolled_at as created_at, 
               c.title as course_title, 
               u.fullname as student_name, u.email as student_email 
        FROM course_enrollments e 
        JOIN courses c ON e.course_id = c.id 
        JOIN users u ON e.student_id = u.id 
        WHERE e.status = 'pending'";

if (!$is_admin) {
    $sql .= " AND c.instructor_id = ?";
}
$sql .= " ORDER BY e.enrolled_at ASC";

$stmt = $conn->prepare($sql);
if (!$is_admin) {
    $stmt->bind_param("i", $user_id);
}
$stmt->execute();
$result = $stmt->get_result();

$pending = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $pending[] = $row;
    }
}

echo json_encode(['success' => true, 'pending' => $pending]);

$conn->close();
?>

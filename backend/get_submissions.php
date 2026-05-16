<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$role    = $_SESSION['role'];

$query = "SELECT s.*, a.title AS assignment_title, u.fullname AS student_name, c.title AS course_title
          FROM submissions s
          JOIN assignments a ON a.id = s.assignment_id
          JOIN users u ON u.id = s.student_id
          JOIN courses c ON c.id = a.course_id";

if ($role === 'instructor') {
    // Show only for assignments this instructor owns
    $query .= " WHERE a.instructor_id = ?";
} else if ($role === 'student') {
    // Show only this student's submissions
    $query .= " WHERE s.student_id = ?";
}

$query .= " ORDER BY s.submitted_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$submissions = [];

while ($row = $result->fetch_assoc()) {
    $submissions[] = $row;
}

echo json_encode(['success' => true, 'submissions' => $submissions]);

$stmt->close();
$conn->close();
?>

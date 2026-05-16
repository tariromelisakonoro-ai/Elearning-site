<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$user_role = $_SESSION['role'] ?? '';
if (empty($_SESSION['user_id']) || ($user_role !== 'administrator' && $user_role !== 'instructor')) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$sql = "SELECT id, fullname, email, role, approved, status, created_at FROM users";
if ($user_role === 'instructor') {
    // Instructors can only see students
    $sql .= " WHERE role = 'student'";
}
$sql .= " ORDER BY created_at DESC";
$result = $conn->query($sql);

$users = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
}

echo json_encode(['success' => true, 'users' => $users]);
$conn->close();
?>

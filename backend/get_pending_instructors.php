<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'administrator') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$stmt   = $conn->prepare("SELECT id, fullname, email FROM users WHERE role = 'instructor' AND approved = 0");
$stmt->execute();
$result = $stmt->get_result();
$list   = [];

while ($row = $result->fetch_assoc()) {
    $list[] = $row;
}

echo json_encode(['success' => true, 'instructors' => $list]);

$stmt->close();
$conn->close();
?>

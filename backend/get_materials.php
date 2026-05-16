<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

$type    = $_GET['type'] ?? ''; // optional filter
$subject = $_GET['subject'] ?? ''; // optional filter

$sql = "SELECT items.*, users.fullname as instructor_name, courses.title as course_title 
        FROM items 
        JOIN users ON items.instructor_id = users.id
        JOIN courses ON items.course_id = courses.id";
$params = [];
$types = "";

if ($type) {
    $sql .= " WHERE items.type = ?";
    $params[] = $type;
    $types .= "s";
}

$sql .= " ORDER BY items.created_at DESC";

$stmt = $conn->prepare($sql);
if ($params) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode(['success' => true, 'items' => $items]);

$stmt->close();
$conn->close();
?>

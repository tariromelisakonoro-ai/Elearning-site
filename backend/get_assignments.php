<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Optional: filter by instructor or course
$instructor_id = isset($_GET['instructor_id']) ? (int)$_GET['instructor_id'] : null;
$course_id     = isset($_GET['course_id']) ? (int)$_GET['course_id'] : null;

$query = "SELECT a.*, c.title AS course_title, u.fullname AS instructor_name
          FROM assignments a
          JOIN courses c ON c.id = a.course_id
          JOIN users u ON u.id = a.instructor_id";

$params = [];
$types  = "";

if ($instructor_id || $course_id) {
    $query .= " WHERE";
    if ($instructor_id) {
        $query .= " a.instructor_id = ?";
        $params[] = $instructor_id;
        $types .= "i";
    }
    if ($course_id) {
        if ($instructor_id) $query .= " AND";
        $query .= " a.course_id = ?";
        $params[] = $course_id;
        $types .= "i";
    }
}

$query .= " ORDER BY a.due_date ASC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$assignments = [];

while ($row = $result->fetch_assoc()) {
    $assignments[] = $row;
}

echo json_encode(['success' => true, 'assignments' => $assignments]);

$stmt->close();
$conn->close();
?>

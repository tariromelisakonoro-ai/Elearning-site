<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

// Auth check
if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'administrator') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$stats = [
    'total_students' => 0,
    'total_instructors' => 0,
    'total_courses' => 0,
    'total_enrollments' => 0
];

// Students count
$res = $conn->query("SELECT COUNT(*) as c FROM users WHERE role = 'student'");
if ($res && $row = $res->fetch_assoc()) $stats['total_students'] = (int)$row['c'];

// Instructors count
$res = $conn->query("SELECT COUNT(*) as c FROM users WHERE role = 'instructor'");
if ($res && $row = $res->fetch_assoc()) $stats['total_instructors'] = (int)$row['c'];

// Courses count
$res = $conn->query("SELECT COUNT(*) as c FROM courses");
if ($res && $row = $res->fetch_assoc()) $stats['total_courses'] = (int)$row['c'];

// Enrollments count
$res = $conn->query("SELECT COUNT(*) as c FROM course_enrollments");
if ($res && $row = $res->fetch_assoc()) $stats['total_enrollments'] = (int)$row['c'];

echo json_encode(['success' => true, 'stats' => $stats]);
$conn->close();
?>

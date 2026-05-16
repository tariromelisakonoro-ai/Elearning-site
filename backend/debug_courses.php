<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Debug endpoint - shows all courses and users for troubleshooting
$debug = [];

// Check if tables exist
$tables = $conn->query("SHOW TABLES");
$table_list = [];
while ($row = $tables->fetch_row()) {
    $table_list[] = $row[0];
}
$debug['tables'] = $table_list;

// Get all courses
try {
    $courses_result = $conn->query("SELECT * FROM courses");
    $debug['course_count'] = $courses_result->num_rows;
    $debug['courses'] = [];

    while ($row = $courses_result->fetch_assoc()) {
        $debug['courses'][] = $row;
    }
} catch (Exception $e) {
    $debug['courses_error'] = $e->getMessage();
}

// Get all instructors (users with role='instructor')
try {
    $instructors_result = $conn->query("SELECT id, fullname, email, role FROM users WHERE role='instructor'");
    $debug['instructor_count'] = $instructors_result->num_rows;
    $debug['instructors'] = [];

    while ($row = $instructors_result->fetch_assoc()) {
        $debug['instructors'][] = $row;
    }
} catch (Exception $e) {
    $debug['instructors_error'] = $e->getMessage();
}

// Test the regular get_courses endpoint
$debug['get_courses_test'] = 'Check /backend/get_courses.php for actual data';

echo json_encode($debug, JSON_PRETTY_PRINT);

$conn->close();
?>

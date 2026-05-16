<?php
require 'db.php';
$conn->query("INSERT IGNORE INTO users (id, fullname, email, password, role, approved) VALUES (99, 'Test Inst', 'ti@t.com', 'xxx', 'instructor', 1)");
$conn->query("INSERT IGNORE INTO users (id, fullname, email, password, role, approved) VALUES (100, 'Test Stud', 'ts@t.com', 'xxx', 'student', 1)");
$conn->query("INSERT IGNORE INTO courses (id, title, description, instructor_id) VALUES (99, 'Test Course', 'DC', 99)");
$conn->query("INSERT IGNORE INTO course_enrollments (id, course_id, student_id, status) VALUES (99, 99, 100, 'pending')");

$user_id = 99;
$enrollment_id = 99;
$newStatus = 'approved';

$stmt = $conn->prepare("
    UPDATE course_enrollments 
    SET status = ? 
    WHERE id = ? AND status = 'pending' 
    AND course_id IN (SELECT id FROM courses WHERE instructor_id = ?)
");
if ($stmt) {
   $stmt->bind_param('sii', $newStatus, $enrollment_id, $user_id);
   $stmt->execute();
   var_dump($stmt->affected_rows);
   echo $stmt->error;
} else {
   echo $conn->error;
}

<?php
require 'db.php';
$stmt = $conn->prepare("
    UPDATE course_enrollments 
    SET status = 'approved' 
    WHERE id = 1 AND status = 'pending' 
    AND course_id IN (SELECT id FROM courses WHERE instructor_id = 2)
");
if (!$stmt) echo "Prepare error: " . $conn->error;
else {
    $stmt->execute();
    echo "Execute error? " . $stmt->error;
}

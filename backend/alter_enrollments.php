<?php
require __DIR__ . '/../db.php';
$conn->query('ALTER TABLE course_enrollments ADD COLUMN completed_at TIMESTAMP NULL DEFAULT NULL');
echo "completed_at added or already exists";

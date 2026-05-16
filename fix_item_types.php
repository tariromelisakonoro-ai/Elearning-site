<?php
include 'db.php';

// Fix items that should be exams/quizzes based on their title
$conn->query("UPDATE items SET type = 'exam' WHERE title LIKE '%exam%' AND type = 'file'");
$conn->query("UPDATE items SET type = 'quiz' WHERE title LIKE '%quiz%' AND type = 'file'");

// Fix the one with empty type
$conn->query("UPDATE items SET type = 'exam' WHERE id = 10");

echo "Database items fixed.";
?>

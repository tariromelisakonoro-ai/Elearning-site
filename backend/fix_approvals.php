<?php
require_once __DIR__ . '/../db.php';
$conn->query("UPDATE users SET approved = 1");
echo "Rows updated: " . $conn->affected_rows;
?>

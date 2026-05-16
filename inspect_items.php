<?php
include 'db.php';
$q = $conn->query("SELECT id, title, type FROM items");
$items = $q->fetch_all(MYSQLI_ASSOC);
echo json_encode($items, JSON_PRETTY_PRINT);
?>

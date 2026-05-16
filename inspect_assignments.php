<?php
include 'db.php';
$q = $conn->query("SELECT * FROM assignments");
echo json_encode($q->fetch_all(MYSQLI_ASSOC), JSON_PRETTY_PRINT);
?>

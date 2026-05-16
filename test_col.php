<?php
require 'db.php';
$res = $conn->query("SHOW COLUMNS FROM courses");
while($row = $res->fetch_assoc()) echo $row['Field'] . "\n";
?>

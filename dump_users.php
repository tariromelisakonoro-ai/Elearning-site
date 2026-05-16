<?php
require_once 'db.php';
header('Content-Type: text/plain');

echo "--- USERS TABLE STRUCTURE ---\n";
$res = $conn->query("DESCRIBE users");
while($row = $res->fetch_assoc()) {
    print_r($row);
}

echo "\n--- USERS TABLE DATA ---\n";
$res = $conn->query("SELECT * FROM users");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>

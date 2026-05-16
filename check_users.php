<?php
require_once 'db.php';
header('Content-Type: text/plain');

echo "--- CURRENT USERS IN DB ---\n";
$res = $conn->query("SELECT id, fullname, email, role, approved, created_at FROM users");
if ($res) {
    while($row = $res->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "Error: " . $conn->error;
}
?>

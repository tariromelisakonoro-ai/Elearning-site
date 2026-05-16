<?php
include 'db.php';
$q = $conn->query("DESCRIBE items");
while($row = $q->fetch_assoc()) {
    if ($row['Field'] == 'type') {
        echo "Type Column Definition: " . $row['Type'] . "\n";
    }
}
?>

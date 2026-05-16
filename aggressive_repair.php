<?php
include 'db.php';

echo "Aggressive DB Repair starting...\n";

// 1. Fix empty types and 'file' types that sound like exams/quizzes
$repairs = [
    "UPDATE items SET type = 'exam' WHERE type = '' OR type IS NULL", // Default fallback if empty
    "UPDATE items SET type = 'exam' WHERE title LIKE '%exam%' OR title LIKE '%paper%' OR title LIKE '%assessment%'",
    "UPDATE items SET type = 'quiz' WHERE title LIKE '%quiz%' OR title LIKE '%test%'",
    "UPDATE items SET type = 'resource' WHERE title LIKE '%material%' OR title LIKE '%lecture%' OR title LIKE '%resource%'"
];

foreach ($repairs as $sql) {
    if ($conn->query($sql)) {
        echo "✅ Ran: $sql\n";
    } else {
        echo "❌ Failed: $sql - " . $conn->error . "\n";
    }
}

// 2. Check the result
$q = $conn->query("SELECT id, title, type FROM items");
echo "\nFinal State:\n";
while ($row = $q->fetch_assoc()) {
    echo "[" . $row['id'] . "] " . $row['type'] . " - " . $row['title'] . "\n";
}

$conn->close();
?>

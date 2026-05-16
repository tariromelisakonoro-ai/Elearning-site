<?php
include 'db.php';
echo "Altering items table to support new assessment types...\n";

$sql = "ALTER TABLE items MODIFY COLUMN type ENUM('text', 'video', 'file', 'live_class', 'exam', 'quiz', 'resource') NOT NULL";

if ($conn->query($sql)) {
    echo "✅ Table altered successfully.\n";
    
    // Now re-run the aggressive repair to populate the types
    $repairs = [
        "UPDATE items SET type = 'exam' WHERE title LIKE '%exam%' OR title LIKE '%paper%' OR title LIKE '%assessment%'",
        "UPDATE items SET type = 'quiz' WHERE title LIKE '%quiz%' OR title LIKE '%test%'",
        "UPDATE items SET type = 'resource' WHERE type = 'file' AND (title NOT LIKE '%exam%' AND title NOT LIKE '%quiz%')",
        "UPDATE items SET type = 'exam' WHERE type = '' OR type IS NULL" // Catch-all for anything still empty
    ];

    foreach ($repairs as $r) {
        $conn->query($r);
    }
    echo "✅ Items categorization fixed.\n";
} else {
    echo "❌ Error altering table: " . $conn->error . "\n";
}

$conn->close();
?>

<?php
require_once __DIR__ . '/../db.php';

echo "Updating database schema for Admin Dashboard...\n";

// 1. Add status column to users if it doesn't exist
$res = $conn->query("SHOW COLUMNS FROM users LIKE 'status'");
if ($res->num_rows === 0) {
    if ($conn->query("ALTER TABLE users ADD COLUMN status ENUM('active', 'blocked', 'suspended') DEFAULT 'active'")) {
        echo "✅ Added 'status' column to 'users' table.\n";
    } else {
        echo "❌ Failed to add 'status' column: " . $conn->error . "\n";
    }
} else {
    echo "✅ 'status' column already exists in 'users' table.\n";
}

// 2. Create announcements table
$sqlAnnouncements = "CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(50) DEFAULT 'all',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
)";

if ($conn->query($sqlAnnouncements)) {
    echo "✅ Created 'announcements' table.\n";
} else {
    echo "❌ Failed to create 'announcements' table: " . $conn->error . "\n";
}

$conn->close();
?>

<?php
// DB Connection test + full registration test
// Visit: http://localhost/LearnExpress/test_db.php
// DELETE THIS FILE after confirming everything works!

$host = "localhost";
$user = "root";
$password = "";
$database = "learnexpress_new";

echo "<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 20px}
.ok{color:green;background:#e8f5e9;padding:10px;border-radius:8px;margin:8px 0}
.err{color:red;background:#ffebee;padding:10px;border-radius:8px;margin:8px 0}
h2{margin-top:30px}</style>";
echo "<h1>🔍 LearnExpress DB Diagnostic</h1>";

// 1. Test connection
echo "<h2>1. Database Connection</h2>";
$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    echo "<div class='err'>❌ Connection FAILED: " . $conn->connect_error . "</div>";
    exit;
} else {
    echo "<div class='ok'>✅ Connected to <strong>$database</strong> on localhost as root</div>";
}

// 2. Check tables exist
echo "<h2>2. Tables Check</h2>";
$tables = ['users', 'courses'];
foreach ($tables as $table) {
    $res = $conn->query("SHOW TABLES LIKE '$table'");
    if ($res && $res->num_rows > 0) {
        echo "<div class='ok'>✅ Table <strong>$table</strong> exists</div>";
    } else {
        echo "<div class='err'>❌ Table <strong>$table</strong> is MISSING — run setup first!</div>";
    }
}

// 3. Test insert a user
echo "<h2>3. Insert Test (will insert then delete a test row)</h2>";
$test_email = 'db_test_' . time() . '@example.com';
$test_hash  = password_hash('test1234', PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (fullname, email, password, role, approved) VALUES (?, ?, ?, 'student', 1)");
$stmt->bind_param("sss", ...[
    'DB Test User',
    $test_email,
    $test_hash,
]);
if ($stmt->execute()) {
    $test_id = $stmt->insert_id;
    echo "<div class='ok'>✅ Test user inserted successfully (ID: $test_id, email: $test_email)</div>";

    // Clean up
    $conn->query("DELETE FROM users WHERE id = $test_id");
    echo "<div class='ok'>✅ Test row cleaned up — no dummy data left</div>";
} else {
    echo "<div class='err'>❌ Insert FAILED: " . $stmt->error . "</div>";
}
$stmt->close();

// 4. Show existing users
echo "<h2>4. Current Users in Database</h2>";
$result = $conn->query("SELECT id, fullname, email, role, approved, created_at FROM users ORDER BY created_at DESC LIMIT 20");
if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'>";
    echo "<tr style='background:#eee'><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Approved</th><th>Created</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>
            <td>{$row['id']}</td>
            <td>{$row['fullname']}</td>
            <td>{$row['email']}</td>
            <td>{$row['role']}</td>
            <td>" . ($row['approved'] ? '✅ Yes' : '⏳ No') . "</td>
            <td>{$row['created_at']}</td>
        </tr>";
    }
    echo "</table>";
} else {
    echo "<div class='err'>⚠️ No users found in database yet.</div>";
}

// 5. PHP version and session info
echo "<h2>5. Server Info</h2>";
echo "<div class='ok'>PHP version: " . phpversion() . "</div>";
echo "<div class='ok'>mysqli extension: " . (function_exists('mysqli_connect') ? 'Loaded ✅' : 'MISSING ❌') . "</div>";

if (session_status() === PHP_SESSION_NONE) session_start();
$_SESSION['test'] = 'works';
echo "<div class='ok'>PHP Sessions: " . (isset($_SESSION['test']) ? 'Working ✅' : 'BROKEN ❌') . "</div>";

echo "<br><p style='color:#666;font-size:0.9rem'>⚠️ Delete this file (<strong>test_db.php</strong>) when you\'re done testing.</p>";

$conn->close();
?>

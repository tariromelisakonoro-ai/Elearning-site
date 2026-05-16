<?php
require_once 'db.php';

$results = [];

// Create users table
$sql_users = "CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  fullname   VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('student','instructor','administrator','parent') NOT NULL DEFAULT 'student',
  approved   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql_users)) {
    $results[] = ['ok' => true,  'msg' => '✅ <strong>users</strong> table created (or already exists).'];
} else {
    $results[] = ['ok' => false, 'msg' => '❌ Failed to create <strong>users</strong> table: ' . $conn->error];
}

// Create courses table
$sql_courses = "CREATE TABLE IF NOT EXISTS courses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(150) NOT NULL,
  description   TEXT         NOT NULL,
  subject       VARCHAR(100) NOT NULL,
  category      VARCHAR(100) DEFAULT '',
  icon          VARCHAR(10)  DEFAULT '📖',
  instructor_id INT          NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql_courses)) {
    $results[] = ['ok' => true,  'msg' => '✅ <strong>courses</strong> table created (or already exists).'];
} else {
    $results[] = ['ok' => false, 'msg' => '❌ Failed to create <strong>courses</strong> table: ' . $conn->error];
}

$conn->close();
$allOk = array_reduce($results, fn($carry, $r) => $carry && $r['ok'], true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>LearnExpress – Database Setup</title>
  <link rel="stylesheet" href="styles.css" />
  <style>
    body { max-width: 660px; margin: 6rem auto; padding: 0 1.5rem; font-family: sans-serif; }
    .result { padding: 1rem 1.25rem; border-radius: 14px; margin-bottom: 0.85rem; border: 1px solid transparent; }
    .result.ok  { background: rgba(34,121,81,.1); border-color: rgba(34,121,81,.2); }
    .result.err { background: rgba(255,60,60,.08); border-color: rgba(255,60,60,.2); color:#a00; }
    .done { margin-top: 1.5rem; padding: 1.1rem 1.25rem; background: #e8f5ed; border-radius: 14px; border: 1px solid rgba(34,121,81,.25); }
  </style>
</head>
<body>
  <h1>🛠️ Database Setup</h1>
  <p>Running setup for database: <strong>learnexpress_new</strong></p>

  <?php foreach ($results as $r): ?>
    <div class="result <?= $r['ok'] ? 'ok' : 'err' ?>">
      <?= $r['msg'] ?>
    </div>
  <?php endforeach; ?>

  <?php if ($allOk): ?>
    <div class="done">
      <strong>All done!</strong> Your database tables are ready.<br><br>
      You can now <a href="register.html">Register an account</a> and start using LearnExpress.<br>
      <small style="color:#666;">Delete or rename this file (setup.php) when you're done for security.</small>
    </div>
  <?php else: ?>
    <p style="color:#a00;">Some steps failed – check the errors above. Make sure XAMPP MySQL is running and the database <strong>learnexpress_new</strong> exists in phpMyAdmin.</p>
  <?php endif; ?>
</body>
</html>

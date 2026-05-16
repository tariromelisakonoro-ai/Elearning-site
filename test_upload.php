<?php
require 'db.php';

// Temporarily create a dummy user to bypass the foreign key constraint
$conn->query("INSERT IGNORE INTO users (id, fullname, email, password, role, status) VALUES (1, 'Test Instructor', 'test@example.com', 'test', 'instructor', 'active')");

$data = [
    'user_id' => 1,
    'role' => 'instructor',
    'title' => 'Test Course',
    'description' => 'Test Desc',
    'category' => 'Test Cat',
];
$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data),
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents('http://localhost/learn_express_website/backend/add_course.php', false, $context);
if ($result === FALSE) {
    echo "Error making request";
} else {
    echo "Result:\n$result\n";
}
?>

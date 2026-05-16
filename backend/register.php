<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

// Catch ANY error and return JSON (not PHP error HTML)
set_exception_handler(function($e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
});
set_error_handler(function($no, $str) {
    echo json_encode(['success' => false, 'message' => 'PHP error: ' . $str]);
    exit;
});

require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true);
file_put_contents(__DIR__ . '/debug.log', "[" . date('Y-m-d H:i:s') . "] CALL: Received payload: " . json_encode($data) . "\n", FILE_APPEND);

// Fallback: also accept normal POST form fields
if (!$data) {
    $data = $_POST;
}

$fullname = trim($data['fullname'] ?? '');
$email    = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';
$role     = strtolower(trim($data['role'] ?? 'student'));

$allowed_roles = ['student', 'instructor', 'administrator', 'parent'];
if (!$fullname || !$email || !$password || !in_array($role, $allowed_roles)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required. Got: name=' . $fullname . ', email=' . $email . ', role=' . $role]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

// Check if email already exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']);
    $check->close();
    exit;
}
$check->close();

// Everyone needs approval by default
$approved = 0;

// If registering as an administrator, check if this is the very first one
if ($role === 'administrator') {
    $admin_check = $conn->query("SELECT id FROM users WHERE role = 'administrator' AND approved = 1 LIMIT 1");
    if ($admin_check && $admin_check->num_rows === 0) {
        $approved = 1; // Auto-approve the first administrator
    }
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (fullname, email, password, role, approved) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $fullname, $email, $hashed, $role, $approved);

if ($stmt->execute()) {
    $user_id = $stmt->insert_id;
    file_put_contents(__DIR__ . '/debug.log', "[" . date('Y-m-d H:i:s') . "] SUCCESS: User $email created with ID $user_id\n", FILE_APPEND);

    $_SESSION['user_id']  = $user_id;
    $_SESSION['fullname'] = $fullname;
    $_SESSION['email']    = $email;
    $_SESSION['role']     = $role;
    $_SESSION['approved'] = $approved;

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully.',
        'user'    => [
            'id'       => $user_id,
            'fullname' => $fullname,
            'email'    => $email,
            'role'     => $role,
            'approved' => (bool)$approved,
        ]
    ]);
} else {
    $err = $stmt->error;
    file_put_contents(__DIR__ . '/debug.log', "[" . date('Y-m-d H:i:s') . "] DB ERROR: $err\n", FILE_APPEND);
    echo json_encode(['success' => false, 'message' => 'Database insert failed: ' . $err]);
}

$stmt->close();
$conn->close();
?>

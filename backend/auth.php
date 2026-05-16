<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

$data     = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}
$email    = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']);
    exit;
}

$stmt = $conn->prepare("SELECT id, fullname, email, password, role, approved FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Incorrect email or password.']);
    $stmt->close();
    exit;
}

$_SESSION['user_id']  = $user['id'];
$_SESSION['fullname'] = $user['fullname'];
$_SESSION['email']    = $user['email'];
$_SESSION['role']     = $user['role'];
$_SESSION['approved'] = $user['approved'];

echo json_encode([
    'success' => true,
    'user'    => [
        'id'       => $user['id'],
        'fullname' => $user['fullname'],
        'email'    => $user['email'],
        'role'     => $user['role'],
        'approved' => (bool)$user['approved'],
    ]
]);

$stmt->close();
$conn->close();
?>

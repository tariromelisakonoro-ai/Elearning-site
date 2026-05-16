<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true);
$provider = $data['provider'] ?? '';

if (!in_array($provider, ['google', 'github'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid provider']);
    exit;
}

$fullname = ucfirst($provider) . ' Demo User';
$email = $provider . '_demo@example.com';
$role = 'student';
$approved = 1;

// Check if mock user exists
$stmt = $conn->prepare("SELECT id, fullname, email, role, approved FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    // Create the mock user
    $hashed = password_hash(random_bytes(16), PASSWORD_DEFAULT);
    $insert = $conn->prepare("INSERT INTO users (fullname, email, password, role, approved) VALUES (?, ?, ?, ?, ?)");
    $insert->bind_param("ssssi", $fullname, $email, $hashed, $role, $approved);
    $insert->execute();
    
    $user_id = $insert->insert_id;
    $insert->close();
    
    $user = [
        'id' => $user_id,
        'fullname' => $fullname,
        'email' => $email,
        'role' => $role,
        'approved' => $approved
    ];
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

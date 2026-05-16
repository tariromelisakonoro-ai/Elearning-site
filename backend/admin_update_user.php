<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$user_role = $_SESSION['role'] ?? '';
if (empty($_SESSION['user_id']) || ($user_role !== 'administrator' && $user_role !== 'instructor')) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$target_id = (int)($data['target_id'] ?? 0);
$action = strtolower($data['action'] ?? '');

if (!$target_id || !$action) {
    echo json_encode(['success' => false, 'message' => 'Invalid parameters.']);
    exit;
}

// Security: instructors can ONLY perform the 'approve' action on 'student' role
if ($user_role === 'instructor') {
    if ($action !== 'approve') {
        echo json_encode(['success' => false, 'message' => 'Instructors can only approve users.']);
        exit;
    }
    // Check role of target user
    $role_check = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $role_check->bind_param("i", $target_id);
    $role_check->execute();
    $res = $role_check->get_result();
    $target_user = $res->fetch_assoc();
    $role_check->close();

    if (!$target_user || $target_user['role'] !== 'student') {
        echo json_encode(['success' => false, 'message' => 'Instructors can only approve students.']);
        exit;
    }
}

// Security: Prevent admin from blocking themselves
if ($target_id == $_SESSION['user_id']) {
    echo json_encode(['success' => false, 'message' => 'You cannot modify your own account status.']);
    exit;
}

if ($action === 'reset_password') {
    $newPassword = 'Password123';
    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $hashed, $target_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Password reset to: ' . $newPassword]);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . $conn->error]);
    }
    $stmt->close();
} elseif ($action === 'approve') {
    $stmt = $conn->prepare("UPDATE users SET approved = 1 WHERE id = ?");
    $stmt->bind_param("i", $target_id);
    if ($stmt->execute()) echo json_encode(['success' => true, 'message' => 'User approved.']);
    $stmt->close();
} elseif (in_array($action, ['active', 'blocked', 'suspended'])) {
    $stmt = $conn->prepare("UPDATE users SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $action, $target_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User status updated to ' . $action]);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . $conn->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
}

$conn->close();
?>

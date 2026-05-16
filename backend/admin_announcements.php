<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

// Both GET and POST need auth, but mostly we use this for admin
$user_id = $_SESSION['user_id'] ?? 0;
$role = $_SESSION['role'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($role !== 'administrator') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $title = $_POST['title'] ?? '';
    $message = $_POST['message'] ?? '';
    $target_role = $_POST['target_role'] ?? 'all';
    
    if (empty($title) || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Missing fields.']);
        exit;
    }
    
    $stmt = $conn->prepare("INSERT INTO announcements (title, message, target_role, created_by) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $title, $message, $target_role, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Announcement posted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . $conn->error]);
    }
    $stmt->close();
} else {
    // GET requests: if admin, get all. If user, get 'all' and their specific role.
    $sql = "SELECT a.*, u.fullname as author_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id";
    if ($role !== 'administrator') {
        $sql .= " WHERE target_role = 'all' OR target_role = ?";
    }
    $sql .= " ORDER BY created_at DESC LIMIT 50";
    
    $stmt = $conn->prepare($sql);
    if ($role !== 'administrator') {
        $stmt->bind_param("s", $role);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    
    echo json_encode(['success' => true, 'announcements' => $items]);
    $stmt->close();
}

$conn->close();
?>

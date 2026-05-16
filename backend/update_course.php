<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Support both JSON (old) and multipart/form-data (new)
$input_data = json_decode(file_get_contents('php://input'), true);
if (!$input_data) $input_data = $_POST;

$user_id = !empty($_SESSION['user_id']) ? $_SESSION['user_id'] : ($input_data['user_id'] ?? null);
$user_role = !empty($_SESSION['role']) ? $_SESSION['role'] : ($input_data['role'] ?? '');

if (empty($user_id) || strtolower($user_role) !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$course_id   = intval($input_data['id'] ?? 0);
$title       = trim($input_data['title'] ?? '');
$description = trim($input_data['description'] ?? '');
$category    = trim($input_data['category'] ?? '');
$icon        = trim($input_data['icon'] ?? '📖');

if (!$course_id || !$title || !$description) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

$instructor_id = $user_id;

// Handle optional file upload
$attachment_sql = "";
$attachment_path = null;
if (!empty($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../uploads/courses/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $file = $_FILES['attachment'];
    $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/x-rar-compressed'];
    
    $isValid = false;
    if (function_exists('mime_content_type')) {
        $fileType = mime_content_type($file['tmp_name']);
        $isValid = in_array($fileType, $allowedTypes);
    } else {
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar'];
        $isValid = in_array($ext, $allowedExts);
    }
    
    if ($isValid) {
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newFilename = 'course_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $targetPath = $uploadDir . $newFilename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $attachment_path = 'uploads/courses/' . $newFilename;
            $attachment_sql = ", attachment_path = ?";
        }
    }
}

// Ensure columns exist (schema migration)
try {
    $conn->query("ALTER TABLE courses ADD COLUMN attachment_path VARCHAR(255) DEFAULT ''");
} catch (Exception $e) {
    // Ignore
}

if ($attachment_path) {
    $stmt = $conn->prepare("UPDATE courses SET title = ?, description = ?, category = ?, icon = ?, attachment_path = ? WHERE id = ? AND instructor_id = ?");
    if (!$stmt) { echo json_encode(['success' => false, 'message' => 'Database prepare failed: ' . $conn->error]); exit; }
    $stmt->bind_param("sssssii", $title, $description, $category, $icon, $attachment_path, $course_id, $instructor_id);
} else {
    $stmt = $conn->prepare("UPDATE courses SET title = ?, description = ?, category = ?, icon = ? WHERE id = ? AND instructor_id = ?");
    if (!$stmt) { echo json_encode(['success' => false, 'message' => 'Database prepare failed: ' . $conn->error]); exit; }
    $stmt->bind_param("ssssii", $title, $description, $category, $icon, $course_id, $instructor_id);
}

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Course updated successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error.']);
}

$stmt->close();
$conn->close();
?>

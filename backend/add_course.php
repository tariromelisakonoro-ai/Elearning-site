<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Handle both JSON and multipart form data
$isJson = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;

if ($isJson) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) $data = $_POST;
} else {
    $data = $_POST;
}

$user_id = !empty($_SESSION['user_id']) ? $_SESSION['user_id'] : ($data['user_id'] ?? null);
$user_role = !empty($_SESSION['role']) ? $_SESSION['role'] : ($data['role'] ?? '');

if (empty($user_id) || strtolower($user_role) !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only approved instructors can add courses.']);
    exit;
}

$title       = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$category    = trim($data['category'] ?? '');
$icon        = trim($data['icon'] ?? '📖');
$parent_course_id = !empty($data['parent_course_id']) ? intval($data['parent_course_id']) : null;
$release_date = trim($data['release_date'] ?? '');
$learning_objectives = trim($data['learning_objectives'] ?? '');

if (!$title || !$description) {
    echo json_encode(['success' => false, 'message' => 'Title and description are required.']);
    exit;
}

$instructor_id = $user_id;

// Handle file upload
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
        }
    }
}

// Check if parent_course_id exists if provided
if ($parent_course_id) {
    $checkStmt = $conn->prepare("SELECT id FROM courses WHERE id = ? AND instructor_id = ?");
    $checkStmt->bind_param("ii", $parent_course_id, $instructor_id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    if ($checkResult->num_rows === 0) {
        $parent_course_id = null; // Invalid parent, ignore it
    }
    $checkStmt->close();
}

// Check if columns exist, if not create them (schema migration)
try {
    $conn->query("ALTER TABLE courses ADD COLUMN parent_course_id INT DEFAULT NULL");
    $conn->query("ALTER TABLE courses ADD COLUMN release_date VARCHAR(255) DEFAULT ''");
    $conn->query("ALTER TABLE courses ADD COLUMN learning_objectives TEXT");
    $conn->query("ALTER TABLE courses ADD COLUMN attachment_path VARCHAR(255) DEFAULT ''");
} catch (Exception $e) {
    // Ignore duplicate column errors
}

$stmt = $conn->prepare(
    "INSERT INTO courses (title, description, category, icon, instructor_id, parent_course_id, release_date, learning_objectives, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Database prepare failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param("ssssiisss", $title, $description, $category, $icon, $instructor_id, $parent_course_id, $release_date, $learning_objectives, $attachment_path);

if ($stmt->execute()) {
    $course_id = $stmt->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'Course added successfully!',
        'course'  => [
            'id'          => $course_id,
            'title'       => $title,
            'description' => $description,
            'category'    => $category,
            'icon'        => $icon,
            'attachment'  => $attachment_path
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save the course. Please try again.']);
}

$stmt->close();
$conn->close();
?>

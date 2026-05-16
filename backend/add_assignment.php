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
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$instructor_id = $user_id;
$course_id     = isset($_POST['course_id']) ? (int)$_POST['course_id'] : (isset($input_data['course_id']) ? (int)$input_data['course_id'] : 0);
$title           = isset($_POST['title']) ? trim($_POST['title']) : (isset($input_data['title']) ? trim($input_data['title']) : '');
$description     = isset($_POST['description']) ? trim($_POST['description']) : (isset($input_data['description']) ? trim($input_data['description']) : '');
$grading_criteria = isset($_POST['grading_criteria']) ? trim($_POST['grading_criteria']) : (isset($input_data['grading_criteria']) ? trim($input_data['grading_criteria']) : '');
$due_date        = isset($_POST['due_date']) ? $_POST['due_date'] : (isset($input_data['due_date']) ? $input_data['due_date'] : '');
$file_url        = '';

// Handle file upload
$file = $_FILES['file'] ?? null;
if ($file && $file['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'mp4', 'webm', 'zip', 'jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($ext, $allowed)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
        exit;
    }
    $filename = time() . "_" . preg_replace("/[^a-zA-Z0-9.]/", "_", $file['name']);
    $targetPath = __DIR__ . '/../uploads/' . $filename;
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $file_url = 'uploads/' . $filename;
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file.']);
        exit;
    }
}

if (empty($title) || empty($description) || empty($due_date) || $course_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Ensure assignment table has file_url, if not we will fail but let's assume it has it or we can add it if needed.
try {
    $conn->query("ALTER TABLE assignments ADD COLUMN file_url VARCHAR(255) DEFAULT '' AFTER description");
} catch (Exception $e) {
    // Ignore duplicate column errors
}

$stmt = $conn->prepare("INSERT INTO assignments (instructor_id, course_id, title, description, file_url, grading_criteria, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("iisssss", $instructor_id, $course_id, $title, $description, $file_url, $grading_criteria, $due_date);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Assignment added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>

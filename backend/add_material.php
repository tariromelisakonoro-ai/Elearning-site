<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Support both JSON (old) and multipart/form-data (new)
$input_data = json_decode(file_get_contents('php://input'), true);
if (!$input_data) $input_data = $_POST;

$user_id = !empty($_SESSION['user_id']) ? $_SESSION['user_id'] : ($input_data['user_id'] ?? null);
$user_role = !empty($_SESSION['role']) ? $_SESSION['role'] : ($input_data['role'] ?? '');

// Must be logged in as an approved instructor
if (empty($user_id) || strtolower($user_role) !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

// Support both JSON (old) and multipart/form-data (new)
if (!empty($_FILES) || !empty($_POST)) {
    // Handling multipart form
    $type        = $_POST['type'] ?? '';
    $title       = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $course_id       = (int)($_POST['course_id'] ?? 0);
    $url             = trim($_POST['url'] ?? '');
    $content         = trim($_POST['content'] ?? '');
    $due_date        = !empty($_POST['due_date']) ? $_POST['due_date'] : null;
    $grading_criteria = trim($_POST['grading_criteria'] ?? '');
    $file_url        = '';

    $file = $_FILES['file'] ?? null;
    if ($file && $file['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'mp4', 'webm', 'zip', 'jpg', 'jpeg', 'png', 'gif'];

        if (!in_array($ext, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
            exit;
        }

        if (empty($title)) {
            $title = pathinfo($file['name'], PATHINFO_FILENAME);
            $title = trim(ucwords(preg_replace('/[^a-zA-Z0-9\s-]/', ' ', $title)));
        }

        $filename = time() . "_" . preg_replace("/[^a-zA-Z0-9.]/", "_", $file['name']);
        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0777, true)) {
            echo json_encode(['success' => false, 'message' => 'Unable to create upload directory.']);
            exit;
        }
        $targetPath = $uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $file_url = 'uploads/' . $filename;
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file.']);
            exit;
        }
    }
} else {
    // Fallback for JSON
    $data        = json_decode(file_get_contents('php://input'), true);
    $type        = $data['type'] ?? '';
    $title       = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $course_id       = (int)($data['course_id'] ?? 0);
    $url             = trim($data['url'] ?? '');
    $content         = $data['content'] ?? '';
    $due_date        = !empty($data['due_date']) ? $data['due_date'] : null;
    $grading_criteria = $data['grading_criteria'] ?? '';
    $file_url        = '';
}

if (!$type || !$course_id) {
    echo json_encode(['success' => false, 'message' => 'Type and Course ID are required.']);
    exit;
}

$instructor_id = $user_id;

// Verify instructor owns the course
$check = $conn->prepare("SELECT id FROM courses WHERE id = ? AND instructor_id = ?");
$check->bind_param("ii", $course_id, $instructor_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'You do not have permission to add content to this course.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO items (course_id, instructor_id, title, description, type, content, url, file_url, due_date, grading_criteria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("iissssssss", $course_id, $instructor_id, $title, $description, $type, $content, $url, $file_url, $due_date, $grading_criteria);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => ucfirst($type) . ' added successfully!', 'item_id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add item: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>

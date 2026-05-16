<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Students only.']);
    exit;
}

$student_id    = $_SESSION['user_id'];
$assignment_id = isset($_POST['assignment_id']) ? (int)$_POST['assignment_id'] : 0;

if ($assignment_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid assignment ID']);
    exit;
}

// Handle file upload
$file_url = null;
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = '../uploads/submissions/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    $filename = 'sub_' . $assignment_id . '_' . $student_id . '_' . time() . '.' . $ext;
    $target_file = $upload_dir . $filename;

    if (move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
        $file_url = 'uploads/submissions/' . $filename;
    } else {
        echo json_encode(['success' => false, 'message' => 'Upload failed.']);
        exit;
    }
}

// Upsert submission (allow student to re-submit)
$stmt = $conn->prepare("INSERT INTO submissions (assignment_id, student_id, file_url, status) 
                        VALUES (?, ?, ?, 'submitted') 
                        ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), status = 'submitted', submitted_at = CURRENT_TIMESTAMP");
$stmt->bind_param("iis", $assignment_id, $student_id, $file_url);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Work submitted successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>

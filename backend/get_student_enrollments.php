<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) $data = $_POST;

if (empty($_SESSION['user_id']) && empty($data['user_id']) && empty($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$student_id = !empty($_SESSION['user_id']) ? $_SESSION['user_id'] : (!empty($data['user_id']) ? $data['user_id'] : $_GET['user_id']);
$user_role = !empty($_SESSION['role']) ? $_SESSION['role'] : (!empty($data['role']) ? $data['role'] : (isset($_GET['role']) ? $_GET['role'] : ''));

if ($user_role === 'parent' && !empty($_GET['student_email'])) {
    $email = trim($_GET['student_email']);
    $stmt_p = $conn->prepare("SELECT id FROM users WHERE email = ? AND role = 'student'");
    if ($stmt_p) {
        $stmt_p->bind_param("s", $email);
        $stmt_p->execute();
        $res_p = $stmt_p->get_result();
        if ($row_p = $res_p->fetch_assoc()) {
            $student_id = $row_p['id'];
        }
        $stmt_p->close();
    }
}

$sql = "SELECT e.id as enrollment_id, e.status, e.created_at, e.completed_at, c.id as course_id, c.title, c.subject, c.category, c.icon 
        FROM course_enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.student_id = ?
        ORDER BY e.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $student_id);
$stmt->execute();
$result = $stmt->get_result();

$enrollments = [];
while ($row = $result->fetch_assoc()) {
    $enrollments[] = $row;
}

echo json_encode(['success' => true, 'enrollments' => $enrollments]);

$stmt->close();
$conn->close();
?>

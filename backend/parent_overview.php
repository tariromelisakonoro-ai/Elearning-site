<?php
/**
 * backend/parent_overview.php
 * Returns an overview of a linked student's academic data for parent viewing.
 *
 * Link mechanism: parent account's email is matched against a student whose
 * email starts with the same domain, OR we use a simple "parent links to their
 * own user_id - N" placeholder until a proper parent<->student link table exists.
 *
 * For now: parent can search for a student by email or student ID via GET param.
 * GET  ?student_email=xxx   → returns that student's data (auth required, role=parent)
 * GET  (no param)           → returns all students + summary stats for admin/parent overview
 */
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'parent') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$student_email = trim($_GET['student_email'] ?? '');
$student_id    = (int)($_GET['student_id'] ?? 0);

// Find student
if ($student_email) {
    $stmt = $conn->prepare("SELECT id, fullname, email, status FROM users WHERE email = ? AND role = 'student'");
    $stmt->bind_param("s", $student_email);
} elseif ($student_id) {
    $stmt = $conn->prepare("SELECT id, fullname, email, status FROM users WHERE id = ? AND role = 'student'");
    $stmt->bind_param("i", $student_id);
} else {
    // Return list of all students (for parent to search/pick)
    $res = $conn->query("SELECT id, fullname, email FROM users WHERE role = 'student' ORDER BY fullname ASC");
    $students = [];
    while ($row = $res->fetch_assoc()) $students[] = $row;
    echo json_encode(['success' => true, 'students' => $students]);
    exit;
}

$stmt->execute();
$student = $stmt->get_result()->fetch_assoc();
if (!$student) {
    echo json_encode(['success' => false, 'message' => 'Student not found.']);
    exit;
}
$sid = $student['id'];

// Enrollments
$eStmt = $conn->prepare("
    SELECT e.status, c.title, c.subject, c.icon, c.category
    FROM course_enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.student_id = ?
    ORDER BY e.created_at DESC
");
$eStmt->bind_param("i", $sid);
$eStmt->execute();
$eRes = $eStmt->get_result();
$enrollments = [];
while ($row = $eRes->fetch_assoc()) $enrollments[] = $row;

// Submissions / Grades
$sStmt = $conn->prepare("
    SELECT s.grade, s.feedback, s.status, s.submitted_at,
           a.title as assignment_title, c.title as course_title
    FROM submissions s
    JOIN assignments a ON a.id = s.assignment_id
    JOIN courses c ON c.id = a.course_id
    WHERE s.student_id = ?
    ORDER BY s.submitted_at DESC
    LIMIT 20
");
$sStmt->bind_param("i", $sid);
$sStmt->execute();
$sRes = $sStmt->get_result();
$submissions = [];
while ($row = $sRes->fetch_assoc()) $submissions[] = $row;

// Assignments (upcoming/active)
$aStmt = $conn->prepare("
    SELECT a.title, a.due_date, c.title as course_title
    FROM assignments a
    JOIN course_enrollments e ON e.course_id = a.course_id AND e.student_id = ?
    JOIN courses c ON c.id = a.course_id
    WHERE e.status = 'approved' AND (a.due_date IS NULL OR a.due_date >= NOW())
    ORDER BY a.due_date ASC
    LIMIT 10
");
$aStmt->bind_param("i", $sid);
$aStmt->execute();
$aRes = $aStmt->get_result();
$assignments = [];
while ($row = $aRes->fetch_assoc()) $assignments[] = $row;

echo json_encode([
    'success'     => true,
    'student'     => $student,
    'enrollments' => $enrollments,
    'submissions' => $submissions,
    'assignments' => $assignments,
]);

$conn->close();
?>

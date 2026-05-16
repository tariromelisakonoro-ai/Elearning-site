<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

// Ensure the community_questions table exists
$conn->query("CREATE TABLE IF NOT EXISTS community_questions (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    subject    VARCHAR(100) DEFAULT 'General',
    body       TEXT,
    user_id    INT,
    author     VARCHAR(150) DEFAULT 'Anonymous',
    upvotes    INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)");

// Ensure the community_upvotes table exists for tracking
$conn->query("CREATE TABLE IF NOT EXISTS community_upvotes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    user_id     INT NOT NULL,
    UNIQUE KEY unique_vote (question_id, user_id)
)");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = $data['action'] ?? 'post_question';

    if ($action === 'upvote') {
        if (empty($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'Login to upvote.']); exit;
        }
        $qid = (int)($data['question_id'] ?? 0);
        $uid = (int)$_SESSION['user_id'];
        // Toggle upvote
        $chk = $conn->prepare("SELECT id FROM community_upvotes WHERE question_id = ? AND user_id = ?");
        $chk->bind_param("ii", $qid, $uid);
        $chk->execute();
        if ($chk->get_result()->num_rows > 0) {
            $conn->query("DELETE FROM community_upvotes WHERE question_id = $qid AND user_id = $uid");
            $conn->query("UPDATE community_questions SET upvotes = upvotes - 1 WHERE id = $qid AND upvotes > 0");
            echo json_encode(['success' => true, 'voted' => false]);
        } else {
            $ins = $conn->prepare("INSERT INTO community_upvotes (question_id, user_id) VALUES (?, ?)");
            $ins->bind_param("ii", $qid, $uid);
            $ins->execute();
            $conn->query("UPDATE community_questions SET upvotes = upvotes + 1 WHERE id = $qid");
            echo json_encode(['success' => true, 'voted' => true]);
        }
        exit;
    }

    // Post a question
    $title   = trim($data['title'] ?? '');
    $subject = trim($data['subject'] ?? 'General');
    $body    = trim($data['body'] ?? '');
    $user_id = $_SESSION['user_id'] ?? null;
    $author  = $_SESSION['fullname'] ?? 'Anonymous';

    if (empty($title)) {
        echo json_encode(['success' => false, 'message' => 'Title is required.']); exit;
    }

    $stmt = $conn->prepare("INSERT INTO community_questions (title, subject, body, user_id, author) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssds", $title, $subject, $body, $user_id, $author);

    // Fix: user_id may be null - adjust binding
    $stmt = $conn->prepare("INSERT INTO community_questions (title, subject, body, user_id, author) VALUES (?, ?, ?, ?, ?)");
    if ($user_id) {
        $stmt->bind_param("sssis", $title, $subject, $body, $user_id, $author);
    } else {
        $uid_null = null;
        $stmt->bind_param("sssbs", $title, $subject, $body, $uid_null, $author);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Question posted!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . $conn->error]);
    }
    $stmt->close();

} else {
    // GET: return questions, optionally filtered by subject
    $subject = $_GET['subject'] ?? '';
    $uid     = $_SESSION['user_id'] ?? 0;

    if ($subject && $subject !== 'all') {
        $stmt = $conn->prepare("SELECT q.*, CASE WHEN uv.id IS NOT NULL THEN 1 ELSE 0 END as my_vote
            FROM community_questions q
            LEFT JOIN community_upvotes uv ON uv.question_id = q.id AND uv.user_id = ?
            WHERE q.subject = ?
            ORDER BY q.created_at DESC LIMIT 30");
        $stmt->bind_param("is", $uid, $subject);
    } else {
        $stmt = $conn->prepare("SELECT q.*, CASE WHEN uv.id IS NOT NULL THEN 1 ELSE 0 END as my_vote
            FROM community_questions q
            LEFT JOIN community_upvotes uv ON uv.question_id = q.id AND uv.user_id = ?
            ORDER BY q.created_at DESC LIMIT 30");
        $stmt->bind_param("i", $uid);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $questions = [];
    while ($row = $result->fetch_assoc()) $questions[] = $row;

    echo json_encode(['success' => true, 'questions' => $questions]);
    $stmt->close();
}

$conn->close();
?>

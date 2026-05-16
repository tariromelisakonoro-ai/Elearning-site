<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../db.php';

// Optional: filter by instructor for dashboard view
$instructor_id = isset($_GET['instructor_id']) ? (int)$_GET['instructor_id'] : null;

try {
    if ($instructor_id) {
        $stmt = $conn->prepare(
            "SELECT c.id, c.title, c.description, c.category, c.icon, c.created_at,
                    COALESCE(u.fullname, 'Unknown Instructor') AS instructor_name
             FROM courses c
             LEFT JOIN users u ON u.id = c.instructor_id
             WHERE c.instructor_id = ?
             ORDER BY c.created_at DESC"
        );
        $stmt->bind_param("i", $instructor_id);
    } else {
        $stmt = $conn->prepare(
            "SELECT c.id, c.title, c.description, c.category, c.icon, c.created_at,
                    COALESCE(u.fullname, 'Unknown Instructor') AS instructor_name
             FROM courses c
             LEFT JOIN users u ON u.id = c.instructor_id
             ORDER BY c.created_at DESC"
        );
    }

    $stmt->execute();
    $result  = $stmt->get_result();
    $courses = [];

    while ($row = $result->fetch_assoc()) {
        $courses[] = $row;
    }

    echo json_encode(['success' => true, 'courses' => $courses]);

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>

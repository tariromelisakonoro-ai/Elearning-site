<?php
if (session_status() === PHP_SESSION_NONE) session_start();
header('Content-Type: application/json');

if (!empty($_SESSION['user_id'])) {
    echo json_encode([
        'loggedIn' => true,
        'user'     => [
            'id'       => $_SESSION['user_id'],
            'fullname' => $_SESSION['fullname'],
            'email'    => $_SESSION['email'],
            'role'     => $_SESSION['role'],
            'approved' => (bool)$_SESSION['approved'],
        ]
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>

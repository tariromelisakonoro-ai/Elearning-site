require_once __DIR__ . '/../db.php';
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY student_course (student_id, course_id)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table course_enrollments created successfully!";
} else {
    echo "Error creating table: " . $conn->error;
}
$conn->close();
?>

<?php
require_once __DIR__ . '/db.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    echo "Starting Safe Database Repair...\n";

    // 1. Users
    $conn->query("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'instructor', 'administrator', 'parent') NOT NULL,
        status ENUM('active', 'suspended', 'blocked') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Safety check for users columns
    $uCols = $conn->query("SHOW COLUMNS FROM users");
    $uColNames = []; while($c = $uCols->fetch_assoc()) $uColNames[] = $c['Field'];
    if (!in_array('approved', $uColNames)) $conn->query("ALTER TABLE users ADD COLUMN approved TINYINT(1) DEFAULT 0 AFTER role");
    if (!in_array('status', $uColNames)) $conn->query("ALTER TABLE users ADD COLUMN status ENUM('active', 'suspended', 'blocked') DEFAULT 'active' AFTER approved");

    // 2. Courses
    $conn->query("CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        icon VARCHAR(50) DEFAULT '📖',
        instructor_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    
    // Ensure new columns exist for enhanced course form
    $cCols = $conn->query("SHOW COLUMNS FROM courses");
    $cColNames = []; while($c = $cCols->fetch_assoc()) $cColNames[] = $c['Field'];
    if (!in_array('parent_course_id', $cColNames)) $conn->query("ALTER TABLE courses ADD COLUMN parent_course_id INT DEFAULT NULL AFTER instructor_id");
    if (!in_array('release_date', $cColNames)) $conn->query("ALTER TABLE courses ADD COLUMN release_date DATETIME DEFAULT NULL AFTER parent_course_id");
    if (!in_array('learning_objectives', $cColNames)) $conn->query("ALTER TABLE courses ADD COLUMN learning_objectives TEXT DEFAULT NULL AFTER release_date");
    if (!in_array('attachment_path', $cColNames)) $conn->query("ALTER TABLE courses ADD COLUMN attachment_path VARCHAR(500) DEFAULT NULL AFTER learning_objectives");

    // 3. Items (Multimedia)
    $conn->query("CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT,
        instructor_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('video', 'text', 'file', 'live_class', 'exam', 'quiz', 'resource') NOT NULL,
        content LONGTEXT,
        url VARCHAR(500),
        file_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    )");
    
    // Ensure multimedia columns exist if table was already there
    $columns = $conn->query("SHOW COLUMNS FROM items");
    $colNames = []; while($c = $columns->fetch_assoc()) $colNames[] = $c['Field'];
    if (!in_array('content', $colNames)) $conn->query("ALTER TABLE items ADD COLUMN content LONGTEXT AFTER type");
    if (!in_array('url', $colNames)) $conn->query("ALTER TABLE items ADD COLUMN url VARCHAR(500) AFTER content");
    if (!in_array('course_id', $colNames)) $conn->query("ALTER TABLE items ADD COLUMN course_id INT AFTER id");

    // 4. Enrollments
    $conn->query("CREATE TABLE IF NOT EXISTS course_enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT,
        student_id INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY student_course (student_id, course_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    // Migrate: rename user_id -> student_id if old schema exists
    $eCols = $conn->query("SHOW COLUMNS FROM course_enrollments LIKE 'user_id'");
    if ($eCols->num_rows > 0) {
        $conn->query("ALTER TABLE course_enrollments CHANGE COLUMN user_id student_id INT NOT NULL");
        echo "✅ Migrated course_enrollments.user_id → student_id\n";
    }

    // 5. Assignments
    $conn->query("CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        instructor_id INT,
        course_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )");

    // 6. Submissions
    $conn->query("CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id INT,
        student_id INT,
        file_url VARCHAR(500),
        grade VARCHAR(20),
        feedback TEXT,
        status ENUM('submitted', 'graded', 'returned') DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY student_assignment (student_id, assignment_id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    echo "✅ Database Repair Completed Safely.\n";

} catch (Exception $e) {
    echo "❌ Error during repair: " . $e->getMessage() . "\n";
}

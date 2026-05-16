<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

include "db.php";

// TEMP login
$_SESSION['user_id'] = 1;
$_SESSION['role'] = 'instructor';

$message = "";
if (isset($_GET['success']) && $_GET['success'] == 1) {
    $message = "Course created successfully!";
}

if (isset($_POST['submit'])) {

    $title = $_POST['title'];
    $description = $_POST['description'];
    $subject = $_POST['subject'];

    $sql = "INSERT INTO courses (title, description, subject, instructor_id) VALUES (?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $title, $description, $subject, $_SESSION['user_id']);

    if ($stmt->execute()) {
        header("Location: add_course.php?success=1");
        exit();
    } else {
        $message = "Error: " . $stmt->error;
    }

    $stmt->close();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Add Course</title>
</head>
<body>

<h2>Create New Course</h2>


<form method="POST">
    <label>Course Title:</label><br>
    <input type="text" name="title" required><br><br>

    <label>Description:</label><br>
    <textarea name="description" required></textarea><br><br>

    <label>Subject:</label><br>
    <input type="text" name="subject" required><br><br>

    <button type="submit" name="submit">Create Course</button>
</form>

<?php if (!empty($message)) { ?>
    <p style="color:green;"><?php echo $message; ?></p>
<?php } ?>


</body>
</html>
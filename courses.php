<?php
session_start();
?>
<?php
include "db.php";
?>

<!DOCTYPE html>
<html>
<head>
    <title>All Courses</title>
</head>
<body>

<h2>Available Courses</h2>

<?php
$sql = "SELECT * FROM courses";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "<div style='border:1px solid black; padding:10px; margin:10px;'>";
        echo "<h3>" . $row['title'] . "</h3>";
        echo "<p>" . $row['description'] . "</p>";
        echo "<small>Subject: " . $row['subject'] . "</small>";
        echo "</div>";
    }
} else {
    echo "No courses found.";
}
?>

</body>
</html>
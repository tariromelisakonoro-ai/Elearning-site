<?php
require 'db.php';

function addColumnIfMissing($conn, $table, $column, $definition) {
    $res = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($res->num_rows == 0) {
        if ($conn->query("ALTER TABLE `$table` ADD COLUMN `$column` $definition")) {
            echo "Added $column to $table\n";
        } else {
            echo "Error adding $column to $table: " . $conn->error . "\n";
        }
    } else {
        echo "Column $column already exists in $table\n";
    }
}

addColumnIfMissing($conn, 'items', 'due_date', 'DATETIME NULL');
addColumnIfMissing($conn, 'items', 'grading_criteria', 'TEXT NULL');
addColumnIfMissing($conn, 'assignments', 'grading_criteria', 'TEXT NULL');

?>

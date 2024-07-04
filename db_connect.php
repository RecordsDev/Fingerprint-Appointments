<?php
error_reporting(0); // Suppress all errors
ini_set('display_errors', 0); // Don't display errors

$servername = "localhost";
$username = "root"; // default MySQL username
$password = ""; // default MySQL password (empty)
$dbname = "fingerprint appointments"; // replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(array("error" => "Connection failed: " . $conn->connect_error)));
}
?>
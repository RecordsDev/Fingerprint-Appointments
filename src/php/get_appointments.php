<?php
// Include the configuration file
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

include 'db_connect.php';

$sql = "SELECT date, time, name, phone, completed, fingerprint_card_only FROM appointments";
$result = $conn->query($sql);

if ($result === FALSE) {
    echo json_encode(array("error" => "Error: " . $conn->error));
} else {
    $appointments = array();

    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $appointments[] = $row;
        }
    }

    echo json_encode($appointments);
}

$conn->close();
?>
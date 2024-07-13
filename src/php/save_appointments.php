<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

include 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($data === null) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

$conn->begin_transaction();

try {
    $insert_stmt = $conn->prepare("INSERT INTO appointments (date, time, name, phone, completed, fingerprint_card_only) VALUES (?, ?, ?, ?, ?, ?)");
    $update_stmt = $conn->prepare("UPDATE appointments SET name = ?, phone = ?, completed = ?, fingerprint_card_only = ? WHERE date = ? AND time = ?");

    // Assuming $data is a single appointment object, not an array
    $date = date('Y-m-d', strtotime($data['date']));
    $time = $data['time'];

    // Check if the appointment already exists
    $check_stmt = $conn->prepare("SELECT COUNT(*) FROM appointments WHERE date = ? AND time = ?");
    $check_stmt->bind_param("ss", $date, $time);
    $check_stmt->execute();
    $check_stmt->bind_result($count);
    $check_stmt->fetch();
    $check_stmt->close();

    if ($count > 0) {
        // Update existing appointment
        $update_stmt->bind_param("ssiiss", 
            $data['name'], 
            $data['phone'], 
            $data['completed'], 
            $data['fingerprint_card_only'],
            $date,
            $time
        );
        $update_stmt->execute();
        $message = "Appointment updated successfully";
    } else {
        // Insert new appointment
        $insert_stmt->bind_param("ssssii", 
            $date, 
            $time, 
            $data['name'], 
            $data['phone'], 
            $data['completed'], 
            $data['fingerprint_card_only']
        );
        $insert_stmt->execute();
        $message = "New appointment created successfully";
    }

    $insert_stmt->close();
    $update_stmt->close();

    $conn->commit();
    echo json_encode(['success' => true, 'message' => $message]);
} catch (Exception $e) {
    $conn->rollback();
    $error_message = 'Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine();
    error_log($error_message);
    echo json_encode(['success' => false, 'error' => $error_message]);
}

$conn->close();

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('JSON encode error: ' . json_last_error_msg());
}
?>
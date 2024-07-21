<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Set a custom error log location (uncomment and modify path if needed)
// ini_set('error_log', '/path/to/your/custom/php-errors.log');

include 'db_connect.php';

error_log("--- New request to save_appointments.php ---");

$data = json_decode(file_get_contents('php://input'), true);

if ($data === null) {
    error_log("Error: Invalid JSON data received");
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

error_log("Received data: " . json_encode($data));

error_log("Database connection status: " . ($conn->connect_error ? "Failed: " . $conn->connect_error : "Success"));

$conn->begin_transaction();

try {
    $insert_stmt = $conn->prepare("INSERT INTO appointments (date, time, name, phone, completed, fingerprint_card_only) VALUES (?, ?, ?, ?, ?, ?)");
    $update_stmt = $conn->prepare("UPDATE appointments SET name = ?, phone = ?, completed = ?, fingerprint_card_only = ? WHERE date = ? AND time = ?");

    error_log("Prepared INSERT statement: " . ($insert_stmt ? "Success" : "Failed: " . $conn->error));
    error_log("Prepared UPDATE statement: " . ($update_stmt ? "Success" : "Failed: " . $conn->error));

    $date = date('Y-m-d', strtotime($data['date']));
    $time = $data['time'];
    $completed = isset($data['completed']) ? ($data['completed'] ? 1 : 0) : 0;
    $fingerprint_card_only = isset($data['fingerprint_card_only']) ? ($data['fingerprint_card_only'] ? 1 : 0) : 0;

    // Check if the appointment already exists
    $check_stmt = $conn->prepare("SELECT COUNT(*) FROM appointments WHERE date = ? AND time = ?");
    $check_stmt->bind_param("ss", $date, $time);
    $check_stmt->execute();
    $check_stmt->bind_result($count);
    $check_stmt->fetch();
    $check_stmt->close();

    error_log("Appointment check result: " . ($count > 0 ? "Exists" : "New"));

    if ($count > 0) {
        // Update existing appointment
        $update_stmt->bind_param("ssiiss", 
            $data['name'], 
            $data['phone'], 
            $completed, 
            $fingerprint_card_only,
            $date,
            $time
        );
        error_log("Executing UPDATE query");
        $update_stmt->execute();
        error_log("UPDATE query execution result: " . ($update_stmt->affected_rows > 0 ? "Success" : "Failed") . ". Affected rows: " . $update_stmt->affected_rows);
        $message = "Appointment updated successfully";
    } else {
        // Insert new appointment
        $insert_stmt->bind_param("ssssii", 
            $date, 
            $time, 
            $data['name'], 
            $data['phone'], 
            $completed, 
            $fingerprint_card_only
        );
        error_log("Executing INSERT query");
        $insert_stmt->execute();
        error_log("INSERT query execution result: " . ($insert_stmt->affected_rows > 0 ? "Success" : "Failed") . ". Affected rows: " . $insert_stmt->affected_rows);
        $message = "New appointment created successfully";
    }

    $insert_stmt->close();
    $update_stmt->close();

    $conn->commit();
    error_log("Transaction committed successfully");
    
    echo json_encode(['success' => true, 'message' => $message]);
    error_log("Response sent: " . json_encode(['success' => true, 'message' => $message]));
} catch (Exception $e) {
    $conn->rollback();
    $error_message = 'Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine();
    error_log($error_message);
    echo json_encode(['success' => false, 'error' => $error_message]);
    error_log("Response sent: " . json_encode(['success' => false, 'error' => $error_message]));
}

$conn->close();
error_log("Database connection closed");

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('JSON encode error: ' . json_last_error_msg());
}

error_log("--- End of request to save_appointments.php ---");
?>
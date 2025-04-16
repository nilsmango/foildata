<?php
// Set error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define upload directory
$targetDir = "images/parawings/";

// Create directory if it doesn't exist
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// Response array
$response = array('success' => false, 'message' => '', 'filename' => '');

// Check if file was uploaded
if (isset($_FILES["imageFile"]) && $_FILES["imageFile"]["error"] == 0) {
    $filename = basename($_FILES["imageFile"]["name"]);
    $targetFilePath = $targetDir . $filename;
    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);
    
    // Allow certain file formats
    $allowTypes = array('jpg', 'jpeg', 'png', 'gif');
    if (in_array(strtolower($fileType), $allowTypes)) {
        // Upload file to server
        if (move_uploaded_file($_FILES["imageFile"]["tmp_name"], $targetFilePath)) {
            $response['success'] = true;
            $response['message'] = "The file " . $filename . " has been uploaded.";
            $response['filename'] = $filename;
        } else {
            $response['message'] = "Sorry, there was an error uploading your file.";
        }
    } else {
        $response['message'] = "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
    }
} else {
    $response['message'] = "No file was uploaded or there was an upload error.";
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
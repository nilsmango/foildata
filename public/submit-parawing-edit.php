<?php
// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 403 Forbidden');
    exit('Access denied');
}

// Get the raw POST data
$json = file_get_contents('php://input');
$editData = json_decode($json, true);

// Validate required fields
if (!isset($editData['originalParawingName']) || !isset($editData['originalBrandName']) || 
    !isset($editData['parawingName']) || !isset($editData['brandName']) || !isset($editData['sizes'])) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Handle file upload if there's an image
if (isset($_FILES['imageFilename']) && $_FILES['imageFilename']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'images/parawings/';
    $filename = basename($_FILES['imageFilename']['name']);
    $uploadFile = $uploadDir . $filename;
    
    // Check if it's an image
    $imageFileType = strtolower(pathinfo($uploadFile, PATHINFO_EXTENSION));
    $check = getimagesize($_FILES['imageFilename']['tmp_name']);
    if ($check === false) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'File is not an image']);
        exit;
    }
    
    // Allow certain file formats
    if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" && $imageFileType != "webp") {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Sorry, only JPG, JPEG, PNG, GIF & WEBP files are allowed']);
        exit;
    }
    
    // Move the uploaded file
    if (move_uploaded_file($_FILES['imageFilename']['tmp_name'], $uploadFile)) {
        $editData['newImage'] = $filename;
    } else {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to upload image']);
        exit;
    }
}

// Read existing edits file or create a new one
$editsFile = 'parawing-edits.json';
$edits = [];

if (file_exists($editsFile)) {
    $editsContent = file_get_contents($editsFile);
    $edits = json_decode($editsContent, true) ?: [];
}

// Add the new edit
$editData['id'] = uniqid();
$editData['timestamp'] = date('Y-m-d H:i:s');
$editData['status'] = 'pending'; // Status can be 'pending', 'approved', or 'rejected'
$edits[] = $editData;

// Save to file
if (file_put_contents($editsFile, json_encode($edits, JSON_PRETTY_PRINT))) {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Edit submitted successfully']);
} else {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'Failed to save edit']);
}
?>
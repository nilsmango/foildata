<?php
// Set headers to allow JSON response
header('Content-Type: application/json');

// Get the raw POST data
$jsonData = file_get_contents('php://input');

// Decode the JSON data
$info = json_decode($jsonData, true);

// Validate the data
if (!$info || !isset($info['spotId']) || !isset($info['text']) || !isset($info['tag'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

try {
    // Load existing infos
    $infosFile = 'pending-infos.json';
    $infos = [];
    
    if (file_exists($infosFile)) {
        $infosJson = file_get_contents($infosFile);
        $infos = json_decode($infosJson, true);
        
        // If the file exists but is empty or invalid JSON
        if (!is_array($infos)) {
            $infos = [];
        }
    }
    
    // Add ID and date to the info
    $info['id'] = uniqid();
    $info['date'] = date('c'); // ISO 8601 date format
    
    // Add the new info
    $infos[] = $info;
    
    // Save the updated infos
    file_put_contents($infosFile, json_encode($infos, JSON_PRETTY_PRINT));
    
    // Return success response
    echo json_encode(['success' => true, 'info' => $info]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

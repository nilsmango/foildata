<?php
// Set headers to allow JSON response and prevent caching
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: 0');

// Get the raw POST data
$jsonData = file_get_contents('php://input');

// Decode the JSON data
$spot = json_decode($jsonData, true);

// Validate the data
if (!$spot || !isset($spot['name']) || !isset($spot['locations'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

try {
    // Load existing spots
    $spotsFile = 'spots.json';
    $spots = [];
    
    if (file_exists($spotsFile)) {
        $spotsJson = file_get_contents($spotsFile);
        $spots = json_decode($spotsJson, true);
        
        // If the file exists but is empty or invalid JSON
        if (!is_array($spots)) {
            $spots = [];
        }
    }
    
    // Add the new spot
    $spots[] = $spot;
    
    // Save the updated spots
    file_put_contents($spotsFile, json_encode($spots, JSON_PRETTY_PRINT));
    
    // Process info texts to a separate file if needed
    if (isset($spot['infos']) && !empty($spot['infos'])) {
        $infosFile = 'infos.json';
        $infos = [];
        
        if (file_exists($infosFile)) {
            $infosJson = file_get_contents($infosFile);
            $infos = json_decode($infosJson, true);
            
            // If the file exists but is empty or invalid JSON
            if (!is_array($infos)) {
                $infos = [];
            }
        }
        
        // Add spot ID to each info
        foreach ($spot['infos'] as $info) {
            $info['spotId'] = $spot['id'];
            $infos[] = $info;
        }
        
        // Save the updated infos
        file_put_contents($infosFile, json_encode($infos, JSON_PRETTY_PRINT));
    }
    
    // Return success response
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

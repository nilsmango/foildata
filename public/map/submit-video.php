<?php
// Set headers to allow JSON response
header('Content-Type: application/json');

// Get the POST data
$spotId = $_POST['spotId'] ?? null;
$videoUrl = $_POST['videoUrl'] ?? null;

// Validate the data
if (!$spotId || !$videoUrl) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

try {
    // Detect video type
    $videoType = 'Other';
    if (strpos($videoUrl, 'youtube.com') !== false || strpos($videoUrl, 'youtu.be') !== false) {
        $videoType = 'YouTube';
    } elseif (strpos($videoUrl, 'instagram.com') !== false) {
        $videoType = 'Insta';
    }
    
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
    
    // Find the spot and add the video
    $spotFound = false;
    foreach ($spots as &$spot) {
        if ($spot['id'] === $spotId) {
            $spotFound = true;
            
            // Initialize videos array if it doesn't exist
            if (!isset($spot['videos'])) {
                $spot['videos'] = [];
            }
            
            // Add the new video
            $spot['videos'][] = [
                'url' => $videoUrl,
                'kind' => $videoType,
                'date' => date('c') // ISO 8601 date format
            ];
            
            break;
        }
    }
    
    if (!$spotFound) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Spot not found']);
        exit;
    }
    
    // Save the updated spots
    file_put_contents($spotsFile, json_encode($spots, JSON_PRETTY_PRINT));
    
    // Return success response
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

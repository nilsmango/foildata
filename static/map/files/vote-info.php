<?php
// Set headers to allow JSON response
header('Content-Type: application/json');

// Get the raw POST data
$jsonData = file_get_contents('php://input');

// Decode the JSON data
$data = json_decode($jsonData, true);

// Validate the data
if (!$data || !isset($data['infoId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

$infoId = $data['infoId'];

// Get client IP address for vote tracking
$clientIp = $_SERVER['REMOTE_ADDR'];

try {
    // Load existing infos
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
    
    // Load vote tracking
    $votesFile = 'votes.json';
    $votes = [];
    
    if (file_exists($votesFile)) {
        $votesJson = file_get_contents($votesFile);
        $votes = json_decode($votesJson, true);
        
        // If the file exists but is empty or invalid JSON
        if (!is_array($votes)) {
            $votes = [];
        }
    }
    
    // Check if user already voted for this info
    $voteKey = $infoId . '_' . $clientIp;
    if (isset($votes[$voteKey])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You have already voted for this information']);
        exit;
    }
    
    // Find the info and increment votes
    $infoFound = false;
    foreach ($infos as &$info) {
        if ($info['id'] === $infoId) {
            $infoFound = true;
            
            // Initialize votes if not set
            if (!isset($info['votes'])) {
                $info['votes'] = 0;
            }
            
            // Increment votes
            $info['votes']++;
            
            // Record the vote
            $votes[$voteKey] = time();
            
            break;
        }
    }
    
    if (!$infoFound) {
        // Try to find in pending-infos.json
        $pendingFile = 'pending-infos.json';
        if (file_exists($pendingFile)) {
            $pendingJson = file_get_contents($pendingFile);
            $pendingInfos = json_decode($pendingJson, true);
            
            if (is_array($pendingInfos)) {
                foreach ($pendingInfos as &$info) {
                    if ($info['id'] === $infoId) {
                        $infoFound = true;
    
                        if (!isset($info['votes'])) {
                            $info['votes'] = 0;
                        }
    
                        $info['votes']++;
                        $votes[$voteKey] = time();
    
                        // Save the updated pending infos
                        file_put_contents($pendingFile, json_encode($pendingInfos, JSON_PRETTY_PRINT));
    
                        break;
                    }
                }
            }
        }
    
        if (!$infoFound) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Information not found']);
            exit;
        }
    }
    
    // Save the updated infos
    file_put_contents($infosFile, json_encode($infos, JSON_PRETTY_PRINT));
    
    // Save the updated votes
    file_put_contents($votesFile, json_encode($votes, JSON_PRETTY_PRINT));
    
    // Return success response with updated vote count
    echo json_encode([
        'success' => true, 
        'votes' => $info['votes']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

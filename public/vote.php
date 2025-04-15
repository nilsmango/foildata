<?php
// vote.php - handles the vote submission and persistence

// Prevent direct access if needed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode(['error' => 'Direct access not allowed']);
    exit;
}

// Path to JSON file for storing votes
$jsonFilePath = 'votes.json';

// Get the option from POST data
$data = json_decode(file_get_contents('php://input'), true);
$option = isset($data['option']) ? $data['option'] : null;

// Validate the option
$validOptions = ['boards', 'foils', 'map'];
if (!in_array($option, $validOptions)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Invalid option']);
    exit;
}

// Check if IP has already voted (optional, in addition to session-based check)
$clientIP = $_SERVER['REMOTE_ADDR'];
$voterLogPath = 'voters.json';

// Initialize or load voter log
if (file_exists($voterLogPath)) {
    $voterLog = json_decode(file_get_contents($voterLogPath), true);
} else {
    $voterLog = [];
}

// Check if this IP has voted
if (in_array($clientIP, $voterLog)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Already voted']);
    exit;
}

// Read existing votes
if (file_exists($jsonFilePath)) {
    $votes = json_decode(file_get_contents($jsonFilePath), true);
} else {
    // Initialize votes if file doesn't exist
    $votes = [
        'boards' => 0,
        'foils' => 0,
        'map' => 0
    ];
}

// Increment vote for chosen option
$votes[$option]++;

// Save updated votes
file_put_contents($jsonFilePath, json_encode($votes, JSON_PRETTY_PRINT));

// Log this voter's IP
$voterLog[] = $clientIP;
file_put_contents($voterLogPath, json_encode($voterLog, JSON_PRETTY_PRINT));

// Return success response with updated counts
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Vote recorded successfully',
    'votes' => $votes
]);
?>
<?php
// get-votes.php - retrieves the current vote counts

header('Content-Type: application/json');

// Path to JSON file storing votes
$jsonFilePath = 'votes.json';

// Check if file exists
if (file_exists($jsonFilePath)) {
    // Return the current votes
    echo file_get_contents($jsonFilePath);
} else {
    // Return default values if no votes yet
    echo json_encode([
        'boards' => 0,
        'foils' => 0,
        'map' => 0
    ]);
}
?>
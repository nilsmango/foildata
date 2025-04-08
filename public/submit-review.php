<?php
// submit-review.php

header('Content-Type: application/json');

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// Get the form data
$userName = $_POST['userName'] ?? '';
$website = $_POST['website'] ?? '';
$stars = (int)($_POST['stars'] ?? 0);
$reviewText = $_POST['reviewText'] ?? '';
$brandName = $_POST['brandName'] ?? '';
$productName = $_POST['productName'] ?? '';

// Validate the data
if (empty($userName) || empty($reviewText) || empty($brandName) || empty($productName)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

if ($stars < 1 || $stars > 5) {
    echo json_encode(['success' => false, 'message' => 'Rating must be between 1-5 stars']);
    exit;
}

// Path to the JSON file
$jsonFilePath = 'parawings.json';

// Check if the file exists
if (!file_exists($jsonFilePath)) {
    echo json_encode(['success' => false, 'message' => 'Data file not found']);
    exit;
}

try {
    // Read the JSON file
    $jsonData = file_get_contents($jsonFilePath);
    
    // Decode the JSON into an array
    $parawings = json_decode($jsonData, true);
    
    if ($parawings === null) {
        throw new Exception('Invalid JSON data');
    }
    
    // Find the correct parawing to update
    $parawingFound = false;
    foreach ($parawings as &$parawing) {
        if ($parawing['brandName'] === $brandName && $parawing['name'] === $productName) {
            // Create the new review
            $newReview = [
                'userName' => $userName,
                'website' => !empty($website) ? $website : null,
                'date' => date('Y-m-d'),
                'stars' => $stars,
                'text' => $reviewText
            ];
            
            // Add the review to the parawing
            if (!isset($parawing['reviews'])) {
                $parawing['reviews'] = [];
            }
            
            $parawing['reviews'][] = $newReview;
            $parawingFound = true;
            break;
        }
    }
    
    if (!$parawingFound) {
        throw new Exception('Parawing not found');
    }
    
    // Encode the updated array back to JSON
    $updatedJson = json_encode($parawings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    // Write the JSON back to the file
    if (file_put_contents($jsonFilePath, $updatedJson) === false) {
        throw new Exception('Failed to write to file');
    }
    
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
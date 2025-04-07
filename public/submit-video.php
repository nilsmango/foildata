<?php
// Set proper error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Absolute path to JSON file
$file = __DIR__ . '/parawings.json';

// Check if file exists and is writable
if (!file_exists($file)) {
    die("Error: JSON file not found");
}
if (!is_writable($file)) {
    die("Error: JSON file is not writable");
}

// Verify POST data exists
if (!isset($_POST['brandName']) || !isset($_POST['name']) || !isset($_POST['videoUrl'])) {
    die("Error: Missing required form data");
}

// Load and decode JSON data
$jsonContent = file_get_contents($file);
if ($jsonContent === false) {
    die("Error: Could not read JSON file");
}

$data = json_decode($jsonContent, true);
if ($data === null) {
    die("Error: Invalid JSON format in file");
}

// Flag to track if we found and updated an item
$updated = false;

// Find and update the matching item
foreach ($data as &$item) {
    if ($item['brandName'] === $_POST['brandName'] && $item['name'] === $_POST['name']) {
        // Initialize videos array if it doesn't exist
        if (!isset($item['videos'])) {
            $item['videos'] = [];
        }
        
        // Add the new video
        $item['videos'][] = [
            'url' => $_POST['videoUrl'],
            'kind' => strpos($_POST['videoUrl'], 'instagram') !== false ? 'Insta' : 'YouTube',
            'date' => date('Y-m-d')
        ];
        
        $updated = true;
        break;
    }
}

// Save the updated data back to the file
if ($updated) {
    $result = file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    if ($result === false) {
        die("Error: Failed to write to JSON file");
    }
}

// Get the referring URL or use a default
$redirect = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '/';

// Redirect back to the original page
header("Location: $redirect");
exit;
?>
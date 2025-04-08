<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Absolute path to your parawings JSON file
$parawingsFile = 'parawings.json';

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure correct method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

// Read existing parawings
$parawings = [];
if (file_exists($parawingsFile)) {
    $parawings = json_decode(file_get_contents($parawingsFile), true) ?? [];
}

// Prepare parawing data
$newParawing = [
    'name' => $_POST['parawing'] ?? '',
    'brandName' => $_POST['brand'] ?? '',
    'imageFilename' => null,
    'website' => !empty($_POST['website']) ? $_POST['website'] : null,
    'sizes' => [],
    'videos' => [],
    'reviews' => []
];

// Handle file upload if present
if (!empty($_FILES['imageFilename']['tmp_name'])) {
    $uploadDir = dirname($parawingsFile) . '/images/parawings/';
    
    // Create upload directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $newParawing['imageFilename'] = basename($_FILES['imageFilename']['name']);
    $uploadPath = $uploadDir . $newParawing['imageFilename'];
    
    // Move uploaded file
    if (!move_uploaded_file($_FILES['imageFilename']['tmp_name'], $uploadPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload parawing image']);
        exit();
    }
}

// Process sizes
if (isset($_POST['areaSqM'])) {
    for ($i = 0; $i < count($_POST['areaSqM']); $i++) {
        $size = [
            'areaSqM' => floatval($_POST['areaSqM'][$i]),
            'wingSpan' => !empty($_POST['wingSpan'][$i]) ? floatval($_POST['wingSpan'][$i]) : null,
            'linesLengthCm' => !empty($_POST['linesLengthCm'][$i]) ? floatval($_POST['linesLengthCm'][$i]) : null,
            'aspectRatio' => !empty($_POST['aspectRatio'][$i]) ? floatval($_POST['aspectRatio'][$i]) : null,
            'weightKg' => !empty($_POST['weightKg'][$i]) ? floatval($_POST['weightKg'][$i]) : null,
            'doubleSkin' => filter_var($_POST['doubleSkin'][$i], FILTER_VALIDATE_BOOLEAN),
            'listPriceUSD' => !empty($_POST['listPriceUSD'][$i]) ? floatval($_POST['listPriceUSD'][$i]) : null
        ];
        
        $newParawing['sizes'][] = $size;
    }
}

// Function to merge parawing attributes
function mergeParawingAttributes($existingParawing, $newParawing) {
    // Merge non-null attributes, prioritizing new parawing's data
    return [
        'name' => $existingParawing['name'],
        'brandName' => $newParawing['brandName'],
        'imageFilename' => $newParawing['imageFilename'] ?? $existingParawing['imageFilename'],
        'website' => !empty($newParawing['website']) ? $newParawing['website'] : $existingParawing['website'],
        'sizes' => array_merge($existingParawing['sizes'], $newParawing['sizes']),
        'reviews' => array_merge($existingParawing['reviews'], $newParawing['reviews']),
        'videos' => array_merge($existingParawing['videos'], $newParawing['videos']),
    ];
}

// Check if parawing already exists
$parawingExists = false;
for ($i = 0; $i < count($parawings); $i++) {
    if (strtolower($parawings[$i]['name']) === strtolower($newParawing['name']) && 
        strtolower($parawings[$i]['brandName']) === strtolower($newParawing['brandName'])) {
        // Merge the parawings
        $parawings[$i] = mergeParawingAttributes($parawings[$i], $newParawing);
        $parawingExists = true;
        break;
    }
}

// If parawing doesn't exist, add it
if (!$parawingExists) {
    $parawings[] = $newParawing;
}

// Write to JSON file
$jsonContent = json_encode($parawings, JSON_PRETTY_PRINT);
if (file_put_contents($parawingsFile, $jsonContent) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save parawing']);
    exit();
}

echo json_encode([
    'success' => true, 
    'message' => $parawingExists ? 'Parawing updated successfully' : 'Parawing added successfully'
]);
exit();
?>
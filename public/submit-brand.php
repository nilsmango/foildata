<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
// Allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
// Absolute path to your brands JSON file
$brandsFile = 'brands.json';
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
// Read existing brands
$brands = [];
if (file_exists($brandsFile)) {
    $brands = json_decode(file_get_contents($brandsFile), true) ?? [];
}
// Collect form data
$newBrand = [
    'name' => $_POST['name'] ?? '',
    'logoFilename' => null,
    'website' => !empty($_POST['website']) ? $_POST['website'] : null,,
    'instagram' => !empty($_POST['instagram']) ? $_POST['instagram'] ?? null,
    'youtube' => !empty($_POST['youtube']) ? $_POST['youtube'] ?? null
];
// Handle file upload if present
if (!empty($_FILES['logo']['tmp_name'])) {
    $uploadDir = dirname($brandsFile) . '/images/brands/';
    
    // Create upload directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $newBrand['logoFilename'] = basename($_FILES['logo']['name']);
    $uploadPath = $uploadDir . $newBrand['logoFilename'];
    
    // Move uploaded file
    if (!move_uploaded_file($_FILES['logo']['tmp_name'], $uploadPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload logo']);
        exit();
    }
}
// Function to merge brand attributes
function mergeBrandAttributes($existingBrand, $newBrand) {
    // Merge non-null attributes, prioritizing new brand's data
    return [
        'name' => $existingBrand['name'],
        'logoFilename' => $newBrand['logoFilename'] ?? $existingBrand['logoFilename'],
        'website' => !empty($newBrand['website']) ? $newBrand['website'] : $existingBrand['website'],
        'instagram' => !empty($newBrand['instagram']) ? $newBrand['instagram'] : $existingBrand['instagram'],
        'youtube' => !empty($newBrand['youtube']) ? $newBrand['youtube'] : $existingBrand['youtube'],
    ];
}
// Check if brand already exists
$brandExists = false;
for ($i = 0; $i < count($brands); $i++) {
    if (strtolower($brands[$i]['name']) === strtolower($newBrand['name'])) {
        // Merge the brands
        $brands[$i] = mergeBrandAttributes($brands[$i], $newBrand);
        $brandExists = true;
        break;
    }
}
// If brand doesn't exist, add it
if (!$brandExists) {
    $brands[] = $newBrand;
}
// Write to JSON file
$jsonContent = json_encode($brands, JSON_PRETTY_PRINT);
if (file_put_contents($brandsFile, $jsonContent) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save brand']);
    exit();
}
echo json_encode(['success' => true, 'message' => $brandExists ? 'Brand updated successfully' : 'Brand added successfully']);
exit();
?>
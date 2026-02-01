<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$jsonData = file_get_contents('php://input');
$spot = json_decode($jsonData, true);

if (!$spot || !isset($spot['name']) || !isset($spot['locations'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data: name and locations required']);
    exit;
}

$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';

$configFile = '../.api-key';
if (!file_exists($configFile)) {
    file_put_contents($configFile, bin2hex(random_bytes(16)));
}
$expectedKey = file_get_contents($configFile);

if (!hash_equals($expectedKey, $apiKey)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized: Invalid API key']);
    exit;
}

try {
    $spotsFile = 'spots.json';
    $spots = [];

    if (file_exists($spotsFile)) {
        $spotsJson = file_get_contents($spotsFile);
        $spots = json_decode($spotsJson, true);

        if (!is_array($spots)) {
            $spots = [];
        }
    }

    $idBase = strtolower(trim($spot['name']));
    $idBase = preg_replace(['/ä/', '/ö/', '/ü/', '/ß/'], ['ae', 'oe', 'ue', 'ss'], $idBase);
    $idBase = preg_replace(['/àáâãäå/', '/èéêë/', '/ìíîï/', '/òóôõö/', '/ùúûü/', '/ç/', '/ñ/'], ['a', 'e', 'i', 'o', 'u', 'c', 'n'], $idBase);
    $idBase = preg_replace('/[^a-z0-9]/', '-', $idBase);
    $idBase = preg_replace('/-+/', '-', $idBase);
    $idBase = preg_replace('/^-|-$/', '', $idBase);

    if (empty($idBase)) {
        $idBase = 'spot';
    }

    $existingIds = array_column($spots, 'id');
    $finalId = $idBase;
    $counter = 2;

    while (in_array($finalId, $existingIds)) {
        $finalId = $idBase . '-' . $counter;
        $counter++;
    }

    $spot['id'] = $finalId;
    $spot['pending'] = true;

    if (!isset($spot['country'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Country is required']);
        exit;
    }

    if ($spot['country'] === 'US' && !isset($spot['state'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'State is required for US locations']);
        exit;
    }

    $locations = [];
    foreach ($spot['locations'] as $loc) {
        if (isset($loc['lat']) && isset($loc['lng'])) {
            $locations[] = [
                'lat' => floatval($loc['lat']),
                'lng' => floatval($loc['lng'])
            ];
        }
    }
    $spot['locations'] = $locations;

    if (!isset($spot['infos'])) {
        $spot['infos'] = [];
    }

    foreach ($spot['infos'] as &$info) {
        if (!isset($info['id'])) {
            $info['id'] = $finalId . '-' . bin2hex(random_bytes(8));
        }
        if (!isset($info['date'])) {
            $info['date'] = date('c');
        }
    }

    if (!isset($spot['videos'])) {
        $spot['videos'] = [];
    }

    foreach ($spot['videos'] as &$video) {
        if (!isset($video['kind'])) {
            $video['kind'] = 'Other';
            if (strpos($video['url'], 'youtube.com') !== false || strpos($video['url'], 'youtu.be') !== false) {
                $video['kind'] = 'YouTube';
            } elseif (strpos($video['url'], 'instagram.com') !== false) {
                $video['kind'] = 'Insta';
            }
        }
        if (!isset($video['date'])) {
            $video['date'] = date('c');
        }
    }

    $spots[] = $spot;

    file_put_contents($spotsFile, json_encode($spots, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    if (!empty($spot['infos'])) {
        $infosFile = 'infos.json';
        $infos = [];

        if (file_exists($infosFile)) {
            $infosJson = file_get_contents($infosFile);
            $infos = json_decode($infosJson, true);
            if (!is_array($infos)) {
                $infos = [];
            }
        }

        foreach ($spot['infos'] as $info) {
            $info['spotId'] = $finalId;
            $infos[] = $info;
        }

        file_put_contents($infosFile, json_encode($infos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    echo json_encode(['success' => true, 'spotId' => $finalId]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

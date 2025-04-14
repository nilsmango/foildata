<?php
function listImages($dir) {
    $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    $files = [];
    foreach ($rii as $file) {
        if ($file->isDir()) continue;
        $path = str_replace($dir . "/", "", $file->getPathname());
        $files[] = $path;
    }
    return $files;
}
header('Content-Type: application/json');
echo json_encode(listImages(__DIR__ . '/images'));
<?php
$url = 'http://46.14.58.189/mjpg/video.mjpg';

// Get the headers from the original stream
$headers = get_headers($url, 1);

// Forward the content type
if (isset($headers['Content-Type'])) {
    header('Content-Type: ' . $headers['Content-Type']);
}

// Just pass through the stream
readfile($url);
?>
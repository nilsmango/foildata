<?php
// Get spot ID from URL parameter
$spotId = $_GET['id'] ?? null;

if (!$spotId) {
    header('Location: /foildata/map');
    exit;
}

// Load spots data
$spotsFile = 'spots.json';
$spots = [];

if (file_exists($spotsFile)) {
    $spotsJson = file_get_contents($spotsFile);
    $spots = json_decode($spotsJson, true);
}

// Find the spot
$spot = null;
foreach ($spots as $s) {
    if ($s['id'] === $spotId) {
        $spot = $s;
        break;
    }
}

// If spot not found, redirect to map
if (!$spot) {
    header('Location: /foildata/map');
    exit;
}

// Load infos data
$infosFile = 'infos.json';
$allInfos = [];

if (file_exists($infosFile)) {
    $infosJson = file_get_contents($infosFile);
    $allInfos = json_decode($infosJson, true);
}

// Filter infos for this spot
$spotInfos = [];
foreach ($allInfos as $info) {
    if ($info['spotId'] === $spotId) {
        $spotInfos[] = $info;
    }
}

// Sort infos by votes (if any) and then by date
usort($spotInfos, function($a, $b) {
    $aVotes = $a['votes'] ?? 0;
    $bVotes = $b['votes'] ?? 0;
    
    if ($aVotes === $bVotes) {
        return strtotime($b['date']) - strtotime($a['date']);
    }
    
    return $bVotes - $aVotes;
});

// Group infos by tag
$infosByTag = [];
foreach ($spotInfos as $info) {
    $tag = $info['tag'];
    if (!isset($infosByTag[$tag])) {
        $infosByTag[$tag] = [];
    }
    $infosByTag[$tag][] = $info;
}

// Format location name
$locationName = '';
if (isset($spot['locations']) && !empty($spot['locations'])) {
    if (count($spot['locations']) === 1) {
        $locationName = $spot['name'];
    } else {
        // For routes, use start → end format
        $locationName = $spot['name'];
    }
}

// Determine spot type label
$spotTypes = [
    'pump-foil-dock' => 'Pump Foil Dock',
    'wake-thief-spot' => 'Wake Thief Spot',
    'wave-wind-spot' => 'Wave Wind Spot',
    'wind-spot' => 'Wind Spot',
    'wave-spot' => 'Wave Spot',
    'rental-station' => 'Rental Station',
    'shop' => 'Shop',
    'school' => 'School',
    'wake-boat' => 'Wake Boat',
    'downwind-run' => 'Downwind Run',
    'sup-tour' => 'SUP Tour'
];

$spotTypeLabel = $spotTypes[$spot['kind']] ?? $spot['kind'];

// Format text with links
function formatTextWithLinks($text) {
    $urlPattern = '/(https?:\/\/[^\s]+)/';
    return preg_replace($urlPattern, '<a href="$1" target="_blank" rel="noopener">$1</a>', $text);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($spot['name']); ?> - 7III Foil Data</title>
    <link rel="stylesheet" href="https://project7iii.com/foildata/styles.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="https://unpkg.com/@turf/turf@6.5.0/turf.min.js"></script>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;0,800;1,400&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">
                <a href="/foildata">
                    <h1><span class="iii">7III</span> foildata</h1>
                </a>
            </div>
            
            <div class="nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="/foildata/about.html">about</a></li>
                    <li class="nav-item"><a href="/foildata/parawings.html">parawings</a></li>
                    <li class="nav-item"><a href="/foildata/map">map</a></li>
                </ul>
            </div>
        </header>
        
        <div class="card">
            <div class="card-header">
                <div class="product-header">
                    <h1 class="card-title"><?php echo htmlspecialchars($spot['name']); ?></h1>
                </div>
            </div>
            
            <div class="card-content">
                <div id="spot-map" style="height: 400px; margin-bottom: 1rem; margin-top: -0.75rem;"></div>
                
                <h2>Information</h2>
                <?php if (empty($spotInfos)): ?>
                    <p>No information available yet.</p>
                <?php else: ?>
                <p><?php echo htmlspecialchars($spotTypeLabel); ?>
                <?php if (isset($spot['distance'])): ?>
                    <br>Distance: <?php echo htmlspecialchars($spot['distance']); ?> km
                <?php endif; ?>
                </p>
                    <div class="badge-container">
                        <button class="badge badge-outline active" data-tag="all">All</button>
                        <?php foreach (array_keys($infosByTag) as $tag): ?>
                            <button class="badge badge-outline" data-tag="<?php echo htmlspecialchars($tag); ?>">
                                <?php echo htmlspecialchars(ucwords(str_replace('-', ' ', $tag))); ?>
                            </button>
                        <?php endforeach; ?>
                    </div>
                    <hr class="info-separator">
                    <div class="info-container">
                        <?php foreach ($spotInfos as $info): ?>
                            <div class="info-item" data-tag="<?php echo htmlspecialchars($info['tag']); ?>">
                                <div class="info-header">
                                    <h3><?php echo htmlspecialchars(ucwords(str_replace('-', ' ', $info['tag']))); ?></h3>
                                    <div>•</div>
                                    <div class="info-meta">
                                        <span class="info-date"><?php echo date('F j, Y', strtotime($info['date'])); ?></span>
                                        <span class="info-author">by 
                                            <?php if (!empty($info['userUrl'])): ?>
                                                <a href="<?php echo htmlspecialchars($info['userUrl']); ?>" target="_blank" rel="noopener">
                                                    <?php echo htmlspecialchars($info['userName']); ?>
                                                </a>
                                            <?php else: ?>
                                                <?php echo htmlspecialchars($info['userName']); ?>
                                            <?php endif; ?>
                                        </span>
                                    </div>
                                </div>
                                <div class="info-content">
                                    <?php echo formatTextWithLinks(nl2br(htmlspecialchars($info['text']))); ?>
                                </div>
                                <div class="info-actions">
                                    <div class="vote-btn" data-info-id="<?php echo htmlspecialchars($info['id']); ?>" style="padding: 5px 15px 8px; display: inline-block; margin-top: 0.5rem;">
                                        <span class="vote-icon">
                                            <svg width="20" height="24" viewBox="0 0 24 28" fill="currentColor" style="position: relative; top: 5px;">
                                                            <path d="M12 4c-.5 0-1 .2-1.4.6l-6.8 6.8c-.8.8-.2 2.2.9 2.2h3.8v8.8c0 .8.7 1.6 1.5 1.6h4c.8 0 1.5-.8 1.5-1.6v-8.8h3.8c1.1 0 1.7-1.4.9-2.2l-6.8-6.8c-.4-.4-.9-.6-1.4-.6z"/>
                                                        </svg>
                                        </span>
                                        <span class="vote-count"><?php echo $info['votes'] ?? 0; ?></span>
                                    </div>
                                </div>
                                <hr class="info-separator">
                            </div>
                            
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <div class="main-button" id="add-info-btn" style="margin-top: 1.5rem;">+ Add Info</div>
                
                <div class="add-info-section" style="display: none;">
                    <h2>Add Information</h2>
                    <form id="add-info-form">
                        <input type="hidden" name="spotId" value="<?php echo htmlspecialchars($spotId); ?>">
                        
                        <div class="form-group">
                            <label for="info-tag" class="required">Tag</label>
                            <select id="info-tag" name="tag" required>
                                <option value="">Select Tag</option>
                                <option value="description">Description</option>
                                <option value="wind-direction">Wind Direction</option>
                                <option value="wind-measurements">Wind Measurements</option>
                                <option value="wind-predictions">Wind Predictions</option>
                                <option value="conditions">Conditions</option>
                                <option value="logistics">Logistics</option>
                                <option value="local-contact">Local Contact</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="info-text" class="required">Text</label>
                            <textarea id="info-text" name="text" rows="7" required></textarea>
                            <p class="results-count">Info: URLs starting with http will be converted into clickable links.</p>
                        </div>
                        
                        <div class="form-group">
                            <label for="user-name" class="required">Your Name</label>
                            <input type="text" id="user-name" name="userName" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="user-url">Your URL (optional)</label>
                            <input type="url" id="user-url" name="userUrl">
                        </div>
                        
                        <button type="submit" class="main-button">Submit Information</button>
                    </form>
                </div>
                
                <h2>Videos</h2>
                
                <?php if (empty($spot['videos'])): ?>
                    <p>No videos available yet.</p>
                <?php else: ?>
                    <div id="videos-container" class="videos-container">
                        <?php foreach ($spot['videos'] as $video): ?>
                            <div class="video-item">
                                <?php if ($video['kind'] === 'YouTube'): ?>
                                    <?php
                                    $videoId = '';
                                    $url = $video['url'];
                                    
                                    if (strpos($url, 'youtu.be/') !== false) {
                                        $parts = explode('youtu.be/', $url);
                                        $videoId = $parts[1];
                                    } elseif (strpos($url, 'youtube.com/watch?v=') !== false) {
                                        parse_str(parse_url($url, PHP_URL_QUERY), $params);
                                        $videoId = $params['v'] ?? '';
                                    } elseif (strpos($url, 'youtube.com/shorts/') !== false) {
                                        $parts = explode('youtube.com/shorts/', $url);
                                        $videoId = $parts[1];
                                    }
                                    
                                    if ($videoId):
                                    ?>
                                        <div class="video-wrapper">
                                            <iframe src="https://www.youtube-nocookie.com/embed/<?php echo htmlspecialchars($videoId); ?>" 
                                                    frameborder="0" 
                                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                                    allowfullscreen></iframe>
                                        </div>
                                    <?php endif; ?>
                                <?php elseif ($video['kind'] === 'Insta'): ?>
                                    <div class="instagram-wrapper">
                                        <blockquote class="instagram-media" data-instgrm-permalink="<?php echo htmlspecialchars($video['url']); ?>"></blockquote>
                                    </div>
                                <?php else: ?>
                                    <div class="video-link">
                                        <a href="<?php echo htmlspecialchars($video['url']); ?>" target="_blank" rel="noopener">
                                            <?php echo htmlspecialchars($video['url']); ?>
                                        </a>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <div class="main-button" id="add-video-btn" style="margin-top: 1rem;">+ Add Video</div>
                
                <div class="add-video-section" style="display: none;">
                    <h2>Add Video</h2>
                    <form id="add-video-form">
                        <input type="hidden" name="spotId" value="<?php echo htmlspecialchars($spotId); ?>">
                        
                        <div class="form-group">
                            <label for="video-url" class="required">Video URL (YouTube or Instagram)</label>
                            <input type="url" id="video-url" name="videoUrl" required>
                        </div>
                        
                        <button type="submit" class="main-button">Submit Video</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <footer>
        <div class="footer-nav">
            <ul class="footer-nav-list">
                <li class="footer-nav-item"><a href="/foildata/contact.html">contact</a></li>
                <li class="footer-nav-item"><a href="/foildata/privacy.html">privacy policy</a></li>
            </ul>
        </div>
        <p class="copyright">Copyright © <script>document.write(new Date().getFullYear())</script> project7III - Simon Lang. All rights reserved.</p>
    </footer>
    
    <script>
        // Initialize the map
        const spotMap = L.map('spot-map');
        
        // Add the tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(spotMap);
        
        // Icons for different spot types
        const spotIcons = {
          "pump-foil-dock": L.icon({
            iconUrl: "icons/pump-foil-dock.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "wake-thief-spot": L.icon({
            iconUrl: "icons/wake-thief-spot.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "wave-wind-spot": L.icon({
            iconUrl: "icons/wave-wind-spot.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
          "wind-spot": L.icon({
            iconUrl: "icons/wind-spot.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "wave-spot": L.icon({
            iconUrl: "icons/wave-spot.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "rental-station": L.icon({
            iconUrl: "icons/rental-station.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "shop": L.icon({
            iconUrl: "icons/shop.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "school": L.icon({
            iconUrl: "icons/coach-school.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "wake-boat": L.icon({
            iconUrl: "icons/wake-boat.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "downwind-run": L.icon({
            iconUrl: "icons/route-start.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          "paddle-tour": L.icon({
            iconUrl: "icons/paddle-route-start.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
          default: L.icon({
            iconUrl: "icons/default.svg",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
        }
        
        // Get spot data
        const spotData = <?php echo json_encode($spot); ?>;
        
        // Get the appropriate icon based on spot type and pending status
        function getIcon(type, isPending) {
          // if (isPending) {
          //   return L.icon({
          //     iconUrl: "icons/pending.svg",
          //     iconSize: [32, 32],
          //     iconAnchor: [16, 32],
          //     popupAnchor: [0, -32],
          //   })
          // }
        
          // Add debug logging to see what icon is being requested
          console.log("Getting icon for type:", type)
        
          // Check if the icon exists in our spotIcons object
          if (!spotIcons[type]) {
            console.warn(`Icon not found for type: ${type}, using default`)
            return spotIcons.default
          }
        
          return spotIcons[type]
        }
        
        // Add markers and polylines
        if (spotData.locations && spotData.locations.length > 0) {
            if (spotData.locations.length === 1) {
                // Single point
                const marker = L.marker([spotData.locations[0].lat, spotData.locations[0].lng], {
                  icon: getIcon(spotData.kind, spotData.pending),
                }).addTo(spotMap)
                spotMap.setView([spotData.locations[0].lat, spotData.locations[0].lng], 17);
            } else {
                // Route with multiple points
                const points = spotData.locations.map(loc => [loc.lat, loc.lng]);
                const turfPoints = spotData.locations.map(loc => [loc.lng, loc.lat]);
                const line = turf.lineString(turfPoints);
                const curved = turf.bezierSpline(line);
                const smoothPoints = curved.geometry.coordinates.map(c => [c[1], c[0]]);
                // Create a polyline
                L.polyline(smoothPoints, {
                    color: '#E7FF00',
                    weight: 4,
                    opacity: 1.0
                }).addTo(spotMap);
                
                // Add start and end markers
                const startIcon = spotData.kind === "paddle-tour"
                  ? L.icon({ iconUrl: "icons/paddle-route-start.svg", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
                  : spotData.kind === "downwind-run"
                  ? L.icon({ iconUrl: "icons/route-start.svg", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
                  : getIcon(spotData.kind, spotData.pending)
                
                const startMarker = L.marker(points[0], {
                  icon: startIcon,
                }).addTo(spotMap)
                
                const endIcon = spotData.kind === "paddle-tour"
                  ? L.icon({ iconUrl: "icons/paddle-route-finish.svg", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
                  : spotData.kind === "downwind-run"
                  ? L.icon({ iconUrl: "icons/route-finish.svg", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
                  : getIcon(spotData.kind, spotData.pending)
                
                const endMarker = L.marker(points[points.length - 1], {
                  icon: endIcon,
                }).addTo(spotMap)
                
                // Fit the map to the route
                spotMap.fitBounds(points);
            }
        }
                
        // Tag filter functionality
        document.querySelectorAll('.badge').forEach(button => {
          button.addEventListener('click', () => {
              const isActive = button.classList.contains('active');
              const currentTag = button.getAttribute('data-tag');
          
              document.querySelectorAll('.badge').forEach(btn => btn.classList.remove('active'));
          
              let tag = button.getAttribute('data-tag');
              if (isActive && currentTag !== 'all') {
                  tag = 'all';
                  document.querySelector('.badge[data-tag="all"]').classList.add('active');
              } else if (!isActive) {
                  button.classList.add('active');
              }
          
              document.querySelectorAll('.info-item').forEach(item => {
                  if (tag === 'all' || item.getAttribute('data-tag') === tag) {
                      item.style.display = 'block';
                  } else {
                      item.style.display = 'none';
                  }
              });
            });
        });
        
        // Vote functionality
        document.querySelectorAll('.vote-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const infoId = button.getAttribute('data-info-id');
                const voteCount = button.querySelector('.vote-count');
                
                try {
                    const response = await fetch('vote-info.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ infoId })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        voteCount.textContent = data.votes;
                        button.classList.add('voted');
                    } else {
                        alert(data.message);
                    }
                } catch (error) {
                    console.error('Error voting:', error);
                }
            });
        });
        
        // Add info form submission
        document.getElementById('add-info-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            const infoData = {
                spotId: formData.get('spotId'),
                tag: formData.get('tag'),
                text: formData.get('text'),
                userName: formData.get('userName'),
                userUrl: formData.get('userUrl')
            };
            
            try {
                const response = await fetch('submit-info.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(infoData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Information submitted successfully!');
                    form.reset();
                    location.reload();
                } else {
                    alert('Error submitting information: ' + data.message);
                }
            } catch (error) {
                console.error('Error submitting info:', error);
                alert('An error occurred while submitting your information.');
            }
        });
        
        // Add video form submission
        document.getElementById('add-video-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            
            try {
                const response = await fetch('submit-video.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Video submitted successfully!');
                    form.reset();
                    location.reload();
                } else {
                    alert('Error submitting video: ' + data.message);
                }
            } catch (error) {
                console.error('Error submitting video:', error);
                alert('An error occurred while submitting your video.');
            }
        });
        
        // Load Instagram embeds if needed
        if (document.querySelector('.instagram-media')) {
            const script = document.createElement('script');
            script.src = '//www.instagram.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            // Add event listener to the Add Info button
            const addInfoBtn = document.getElementById('add-info-btn');
            const addInfoSection = document.querySelector('.add-info-section');
            
            if (addInfoBtn && addInfoSection) {
                addInfoBtn.addEventListener('click', function() {
                    // Toggle the visibility of the form
                    if (addInfoSection.style.display === 'none' || !addInfoSection.style.display) {
                        addInfoSection.style.display = 'block';
                        addInfoBtn.textContent = '- Hide Form';
                    } else {
                        addInfoSection.style.display = 'none';
                        addInfoBtn.textContent = '+ Add Info';
                    }
                });
            }
            
            // Add event listener to the Add Video button
            const addVideoBtn = document.getElementById('add-video-btn');
            const addVideoSection = document.querySelector('.add-video-section');
            
            if (addVideoBtn && addVideoSection) {
                addVideoBtn.addEventListener('click', function() {
                    // Toggle the visibility of the form
                    if (addVideoSection.style.display === 'none' || !addVideoSection.style.display) {
                        addVideoSection.style.display = 'block';
                        addVideoBtn.textContent = '- Hide Form';
                    } else {
                        addVideoSection.style.display = 'none';
                        addVideoBtn.textContent = '+ Add Video';
                    }
                });
            }
        });
    </script>
</body>
</html>
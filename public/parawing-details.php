<?php

// --- Configuration ---
$urlPrefix = '/foildata'; // Base URL path
$jsonFilePath = __DIR__ . '/parawings.json'; // Assumes JSON is in the same directory
$placeholderImageURL = $urlPrefix . '/images/brands/noImage.jpg';
$imageBasePath = $urlPrefix . '/images/parawings/'; // Adjust if your image path is different
// TODO: FIX THIS / remove
$jsBaseUrl = $urlPrefix . '/js/'; // Adjust if your JS path is different 
$discontinuedLabel = '<span class="discontinued-badge" style="font-size: 0.7rem; background-color: rgb(255, 107, 107); color: white; padding: 0.15rem 0.3rem; border-radius: 0.25rem; margin-left: 0.5rem; vertical-align: baseline; position: relative; top: -0.15rem;">Discontinued</span>';

// --- Helper Functions (Adapt or replace with your includes) ---

// Basic Head function (replace with your actual implementation)
function createHead($title, $metaDescription, $urlPrefix) {
    $safeTitle = htmlspecialchars($title);
    $safeMetaDescription = htmlspecialchars($metaDescription ?: 'Explore and compare foil data, connect and discuss with the foiling community, and discover cool tools at 7III foildata.');
    $safeUrlPrefix = htmlspecialchars($urlPrefix);
    return <<<HTML
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$safeTitle}</title>
    <link rel="stylesheet" href="{$safeUrlPrefix}/styles.css">
    <meta name="description" content="{$safeMetaDescription}">
    <link rel="apple-touch-icon" sizes="180x180" href="/favi/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favi/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favi/favicon-16x16.png">
    <link rel="manifest" href="/favi/site.webmanifest">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;0,800;1,400&display=swap" rel="stylesheet">
</head>
HTML;
}

// Basic Header function (replace with your actual implementation)
function createHeader($activePage, $urlPrefix) {
    $headerPages = ['about', 'parawings', 'map']; // Example pages
    $homeURL = $urlPrefix;
    $safeHomeURL = htmlspecialchars($homeURL);
    $navList = '';
    foreach ($headerPages as $page) {
        $pageSlug = explode(' ', strtolower($page))[0];
        $pageUrl = ($pageSlug === 'map') ? "{$urlPrefix}/{$pageSlug}" : "{$urlPrefix}/{$pageSlug}.html";
        $safePageName = htmlspecialchars($page);
        if ($activePage === $page || $activePage === "{$page} {$page}") { // Handle compound activePage names like "ENSIS Roger"
             $navList .= "<li class=\"nav-item\"><a class=\"nav-active\" href=\"{$pageUrl}\">{$safePageName}</a></li>\n";
        } else {
             $navList .= "<li class=\"nav-item\"><a href=\"{$pageUrl}\">{$safePageName}</a></li>\n";
        }
    }

    return <<<HTML
<header>
    <div class="logo">
        <a href="{$safeHomeURL}">
            <h1><span class="iii">7III</span> foildata</h1>
        </a>
    </div>
    <div class="nav">
        <ul class="nav-list">
            {$navList}
        </ul>
    </div>
</header>
HTML;
}

// Basic Footer function (replace with your actual implementation)
function createFooter($activePage, $urlPrefix) {
     $footerPages = ['contact', 'privacy policy']; // Example pages
     $footerNavList = '';
     foreach ($footerPages as $page) {
        $pageSlug = explode(' ', strtolower($page))[0];
        $pageUrl = htmlspecialchars("{$urlPrefix}/{$pageSlug}.html"); // Assuming .html extension
        $safePageName = htmlspecialchars($page);
        if ($activePage === $page) {
             $footerNavList .= "<li class=\"footer-nav-item\"><a class=\"nav-active\" href=\"{$pageUrl}\">{$safePageName}</a></li>\n";
        } else {
             $footerNavList .= "<li class=\"footer-nav-item\"><a href=\"{$pageUrl}\">{$safePageName}</a></li>\n";
        }
    }
    $currentYear = date('Y');
    return <<<HTML
<footer>
    <div class="footer-nav">
        <ul class="footer-nav-list">
            {$footerNavList}
        </ul>
    </div>
    <p class="copyright">Copyright © {$currentYear} project7III - Simon Lang. All rights reserved.</p>
</footer>
HTML;
}


// Check if a specific column has any non-null/non-empty data across all sizes
function shouldIncludeColumn($sizes, $key) {
    if (empty($sizes)) return false;
    foreach ($sizes as $size) {
        if (isset($size[$key]) && $size[$key] !== null && $size[$key] !== '') {
            return true;
        }
    }
    return false;
}

// Get text indicating if the parawing is single or double skin (only if consistent)
function getDoubleSkinText($sizes) {
    if (empty($sizes) || !isset($sizes[0]['doubleSkin'])) {
        return "";
    }
    $firstValue = $sizes[0]['doubleSkin'];
    $allTheSame = true;
    foreach ($sizes as $size) {
        if (!isset($size['doubleSkin']) || $size['doubleSkin'] !== $firstValue) {
            $allTheSame = false;
            break;
        }
    }

    if ($allTheSame) {
        $skinType = $firstValue ? "Double" : "Single";
        return "<p>Skin: {$skinType}</p>";
    } else {
        return ""; // Not consistent, will be shown per size in table
    }
}

// Get text listing columns missing data across all sizes
function getMissingParawingColumnsText($sizes) {
    $columns = [
        'wingSpan' => 'Wingspan',
        'linesLengthCm' => 'Lines Length',
        'aspectRatio' => 'Aspect Ratio',
        'weightKg' => 'Weight',
        'listPriceUSD' => 'List Price'
    ];
    $missingColumns = [];

    foreach ($columns as $key => $name) {
        if (!shouldIncludeColumn($sizes, $key)) {
            $missingColumns[] = $name;
        }
    }

    if (empty($missingColumns)) {
        return "";
    } else {
        return "All sizes are missing values for: " . htmlspecialchars(implode(', ', $missingColumns));
    }
}

// Placeholder for generating the reviews section (JS will populate #dynamic-reviews)
function generateReviewsHTMLPlaceholder($brandName, $productName, $urlPrefix) {
    $safeBrandName = htmlspecialchars($brandName);
    $safeProductName = htmlspecialchars($productName);

    // Note: No server-side rendering of individual reviews here.
    return <<<HTML
<div class="product-reviews" data-brand="{$safeBrandName}" data-product="{$safeProductName}">
    <h2 id="reviews">Reviews</h2>
    <div id="dynamic-reviews">
        <p class="loading-review">Loading reviews...</p> 
    </div>
    <div class="main-button" id="add-review-btn">+ Add Review</div>
    <div id="review-form-container" style="display: none;">
        <form id="review-form">
             <div class="form-group">
                 <label for="userName">Your Name:</label>
                 <input type="text" id="userName" name="userName" required>
             </div>
             <div class="form-group">
                 <label for="website">Your Website (optional):</label>
                 <input type="url" id="website" name="website">
             </div>
             <div class="form-group">
                 <label for="stars">Rating:</label>
                 <select id="stars" name="stars" required>
                     <option value="" disabled selected>Select Rating</option>
                     <option value="1">1 Star</option>
                     <option value="2">2 Stars</option>
                     <option value="3">3 Stars</option>
                     <option value="4">4 Stars</option>
                     <option value="5">5 Stars</option>
                 </select>
             </div>
             <div class="form-group">
                 <label for="reviewText">Your Review:</label>
                 <textarea id="reviewText" name="reviewText" rows="5" required></textarea>
             </div>
             <input type="hidden" id="brandName" name="brandName" value="{$safeBrandName}">
             <input type="hidden" id="productName" name="productName" value="{$safeProductName}">
             <button type="submit" class="main-button">Submit Review</button>
         </form>
     </div>
</div>
HTML;
}


// --- Main Script Logic ---

// Get Brand and Name from URL parameters
$brandName = isset($_GET['brand']) ? trim($_GET['brand']) : null;
$parawingName = isset($_GET['name']) ? trim($_GET['name']) : null;

if (!$brandName || !$parawingName) {
    http_response_code(400);
    echo "Error: Brand and Name parameters are required.";
    exit;
}

// Load and decode JSON data
if (!file_exists($jsonFilePath)) {
    http_response_code(500);
    echo "Error: Data file not found.";
    exit;
}

$jsonData = file_get_contents($jsonFilePath);
$parawings = json_decode($jsonData, true); // Decode as associative array

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo "Error: Failed to decode JSON data - " . json_last_error_msg();
    exit;
}

// Find the specific parawing
$parawingData = null;
foreach ($parawings as $pw) {
    if (isset($pw['brandName']) && isset($pw['name']) && $pw['brandName'] === $brandName && $pw['name'] === $parawingName) {
        $parawingData = $pw;
        break;
    }
}

if ($parawingData === null) {
    http_response_code(404);
    echo "Error: Parawing '" . htmlspecialchars($brandName) . " " . htmlspecialchars($parawingName) . "' not found.";
    exit;
}

// --- Prepare Data for HTML ---

// Image Tag
$logoTag = '<img src="' . htmlspecialchars($placeholderImageURL) . '" alt="No Image Yet" class="product-image">';
if (!empty($parawingData['imageFilename'])) {
    $imageUrl = $imageBasePath . htmlspecialchars($parawingData['imageFilename']);
    $altText = htmlspecialchars($parawingData['brandName'] . ' ' . $parawingData['name'] . ' Image');
    $logoTag = "<img src=\"{$imageUrl}\" alt=\"{$altText}\" class=\"product-image\">";
} elseif (!empty($parawingData['imageURL'])) { // Fallback if imageURL field exists (as in original Swift)
    $imageUrl = htmlspecialchars($parawingData['imageURL']);
     $altText = htmlspecialchars($parawingData['brandName'] . ' ' . $parawingData['name'] . ' Image');
     $logoTag = "<img src=\"{$imageUrl}\" alt=\"{$altText}\" class=\"product-image\">";
}


// Website Tag
$paraWebsiteTag = '';
$isDiscontinued = isset($parawingData['discontinued']) && $parawingData['discontinued'] === true;

if ($isDiscontinued) {
    $paraWebsiteTag = "<p>Status: {$discontinuedLabel}</p>";
} elseif (!empty($parawingData['website'])) {
    $websiteUrl = $parawingData['website'];
    $cleanWebsite = preg_replace('/^(https?:\/\/)?(www\.)?/', '', $websiteUrl);
    $cleanWebsite = rtrim($cleanWebsite, '/'); // Remove trailing slash for display
    $safeWebsiteUrl = htmlspecialchars($websiteUrl);
    $safeCleanWebsite = htmlspecialchars($cleanWebsite);
    $paraWebsiteTag = "<p>Website: <a href=\"{$safeWebsiteUrl}\" rel=\"noopener\" target=\"_blank\">{$safeCleanWebsite}</a></p>";
}


// Edit Button
$safeEditUrl = htmlspecialchars($urlPrefix . '/edit-parawing.html?brand=' . urlencode($brandName) . '&parawing=' . urlencode($parawingName));
$editButton = "<a href=\"{$safeEditUrl}\" id=\"edit\" class=\"main-button small\">Edit Parawing</a>";

// Sizes Data
$sizes = isset($parawingData['sizes']) && is_array($parawingData['sizes']) ? $parawingData['sizes'] : [];

// Determine columns to show
$showWingspan = shouldIncludeColumn($sizes, 'wingSpan');
$showLinesLength = shouldIncludeColumn($sizes, 'linesLengthCm');
$showAspectRatio = shouldIncludeColumn($sizes, 'aspectRatio');
$showWeight = shouldIncludeColumn($sizes, 'weightKg');
$showListPrice = shouldIncludeColumn($sizes, 'listPriceUSD');

// Double Skin Info
$doubleSkinText = getDoubleSkinText($sizes);
$showSkinInTable = ($doubleSkinText === ""); // Show in table if not consistent

// Missing columns text
$missingColumnsText = getMissingParawingColumnsText($sizes);

// Reviews Data (for rating calculation only)
$reviews = isset($parawingData['reviews']) && is_array($parawingData['reviews']) ? $parawingData['reviews'] : [];
$averageRating = 0;
$reviewCount = count($reviews);
$starsTag = '';

if ($reviewCount > 0) {
    $totalStars = 0;
    foreach ($reviews as $review) {
        if (isset($review['stars'])) {
            $totalStars += (float)$review['stars'];
        }
    }
    $averageRating = $totalStars / $reviewCount;
    $formattedRating = number_format($averageRating, 1);
    $starsTag = <<<HTML
<a href="#reviews" class="rating-link">
    <span class="rating-text">{$formattedRating}</span>
    <span class="stars" style="--rating: {$averageRating};"></span>
    <span class="review-count">({$reviewCount})</span>
</a>
HTML;
} else {
    // Empty stars tag if no reviews
    $starsTag = <<<HTML
<a href="#reviews" class="rating-link">
    <span class="rating-text"></span>
    <span class="stars" style="--rating: ;"></span>
    <span class="review-count"></span>
</a>
HTML;
}


// --- Generate HTML Output ---
?>
<!DOCTYPE html>
<html lang="en">
<?php echo createHead(htmlspecialchars($brandName) . ' ' . htmlspecialchars($parawingName), htmlspecialchars($brandName) . ' ' . htmlspecialchars($parawingName) . ' info, videos and reviews.', $urlPrefix); ?>
<body>
    <div class="container">
        <?php echo createHeader(htmlspecialchars($brandName) . ' ' . htmlspecialchars($parawingName), $urlPrefix); ?>
        <div class="card">
            <div class="card-header">
                 <div class="product-header">
                     <div>
                         <h1 class="card-title"><?php echo htmlspecialchars($brandName) . ' ' . htmlspecialchars($parawingName); ?></h1>
                         <?php echo $starsTag; // Already contains HTML, no need to escape ?>
                     </div>
                     <div><?php echo $editButton; // Already contains HTML, no need to escape ?></div>
                 </div>
            </div>
            <div class="card-content">
                <?php echo $logoTag; // Already contains HTML, no need to escape ?>
                <h2>Specifications</h2>
                <?php echo $paraWebsiteTag; // Already contains HTML, no need to escape ?>
                <?php echo $doubleSkinText; // Already contains HTML, no need to escape ?>

                <h2>Sizes</h2>
                <div class="table-container">
                    <table id="table">
                        <thead>
                            <tr>
                                <th>Area (m²)</th>
                                <?php if ($showWingspan) echo "<th>Wingspan (m)</th>"; ?>
                                <?php if ($showLinesLength) echo "<th>Lines Length (cm)</th>"; ?>
                                <?php if ($showAspectRatio) echo "<th>Aspect Ratio</th>"; ?>
                                <?php if ($showWeight) echo "<th>Weight (kg)</th>"; ?>
                                <?php if ($showSkinInTable) echo "<th>Skin</th>"; ?>
                                <?php if ($showListPrice) echo "<th>List Price (USD)</th>"; ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($sizes as $size): ?>
                            <tr>
                                <td><?php echo isset($size['areaSqM']) ? htmlspecialchars($size['areaSqM']) : '-'; ?></td>
                                <?php if ($showWingspan): ?>
                                    <td><?php echo isset($size['wingSpan']) ? htmlspecialchars($size['wingSpan']) : '-'; ?></td>
                                <?php endif; ?>
                                <?php if ($showLinesLength): ?>
                                    <td><?php echo isset($size['linesLengthCm']) ? htmlspecialchars($size['linesLengthCm']) : '-'; ?></td>
                                <?php endif; ?>
                                <?php if ($showAspectRatio): ?>
                                    <td><?php echo isset($size['aspectRatio']) ? htmlspecialchars($size['aspectRatio']) : '-'; ?></td>
                                <?php endif; ?>
                                <?php if ($showWeight): ?>
                                    <td><?php echo isset($size['weightKg']) ? htmlspecialchars(number_format((float)$size['weightKg'], 1)) : '-'; ?></td>
                                <?php endif; ?>
                                <?php if ($showSkinInTable): ?>
                                     <td><?php echo isset($size['doubleSkin']) ? ($size['doubleSkin'] ? 'Double' : 'Single') : '-'; ?></td>
                                <?php endif; ?>
                                <?php if ($showListPrice): ?>
                                    <td><?php echo isset($size['listPriceUSD']) ? '$' . htmlspecialchars(number_format((float)$size['listPriceUSD'], 2)) : '-'; ?></td>
                                <?php endif; ?>
                            </tr>
                            <?php endforeach; ?>
                             <?php if (empty($sizes)): ?>
                             <tr><td colspan="100%" style="text-align: center;">No size information available.</td></tr>
                             <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <div class="results-count">
                     <span><?php echo $missingColumnsText; // Already escaped in helper function ?></span>
                </div>
                <br>

                <?php echo generateReviewsHTMLPlaceholder($brandName, $parawingName, $urlPrefix); // Review section placeholder ?>

                <h2>Videos</h2>
                <div id="videos">
                    <p class="loading-video">Loading videos...</p>
                </div>

                <form action="<?php echo htmlspecialchars($urlPrefix); ?>/submit-video.php" method="POST">
                     <input type="hidden" name="brandName" id="brandNameInput" value="<?php echo htmlspecialchars($brandName); ?>">
                     <input type="hidden" name="name" id="nameInput" value="<?php echo htmlspecialchars($parawingName); ?>">
                     <div style="padding-top: 40px">
                         <label>
                             Add a Video URL (YouTube or Instagram Reel):
                             <input name="videoUrl" id="videoUrl" type="url" required>
                         </label>
                         <div class="bottom-button">
                             <button type="submit" class="main-button">Submit Video</button>
                         </div>
                     </div>
                 </form>
            </div>
        </div>
    </div>
    <?php echo createFooter(htmlspecialchars($brandName) . ' ' . htmlspecialchars($parawingName), $urlPrefix); ?>
    <script>
            // --- Video Loading Logic ---
            async function loadVideos() {
              const jsonFile = "<?php echo htmlspecialchars($urlPrefix); ?>/parawings.json"; // Use PHP variable for urlPrefix
              const res = await fetch(jsonFile);
              const parawings = await res.json();
              const videoContainer = document.getElementById("videos");
    
              // Inject PHP variables safely into JavaScript
              const brandName = <?php echo json_encode($brandName); ?>;
              const name = <?php echo json_encode($parawingName); ?>;
    
              // Clear loading message if present
               const loadingMessage = videoContainer.querySelector('.loading-video');
               if (loadingMessage) {
                   videoContainer.removeChild(loadingMessage);
               }
    
    
              // Add masonry container style
              videoContainer.style.columnCount = "1";
              videoContainer.style.columnGap = "20px";
              videoContainer.style.padding = "0";
    
              // Set column count based on viewport width
              const setMasonryColumns = () => {
                if (window.innerWidth > 1200) {
                  videoContainer.style.columnCount = "3";
                } else if (window.innerWidth > 768) {
                  videoContainer.style.columnCount = "2";
                } else {
                  videoContainer.style.columnCount = "1";
                }
              };
    
              // Set initial column count
              setMasonryColumns();
    
              // Update columns on resize
              window.addEventListener("resize", setMasonryColumns);
    
              // Get all videos for the specific brand/name and remove duplicates by URL
              let allVideos = parawings
                .filter(p => p.brandName === brandName && p.name === name)
                .flatMap((p) => p.videos?.map((v) => ({ ...v, name: p.name })) || []);
    
              // Track seen URLs to filter out duplicates
              const seenUrls = new Set();
              allVideos = allVideos.filter(video => {
                // Normalize URL to handle slight variations
                const normalizedUrl = normalizeVideoUrl(video.url);
    
                if (seenUrls.has(normalizedUrl)) {
                  return false; // Skip this duplicate
                }
    
                // Add to seen set and keep this video
                seenUrls.add(normalizedUrl);
                return true;
              });
    
              // Sort by date (newest first)
              allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
    
              // Function to normalize video URLs to identify duplicates
              function normalizeVideoUrl(url) {
                try {
                  const parsedUrl = new URL(url);
    
                  // For YouTube videos (including Shorts)
                  // Note: Adjusted hostnames based on your example JSON
                  if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be') || parsedUrl.hostname === 'googleusercontent.com') {
                     let videoId;
    
                     // Handle googleusercontent.com links (need specific path check based on your actual URLs)
                     if (parsedUrl.hostname === 'googleusercontent.com') {
                        // Assuming format like www.youtube.com/watch?v=VIDEO_ID
                        // This needs refinement based on the exact structure of these URLs in your JSON
                        const youtubeUrlMatch = url.match(/youtube\.com\/[0-9]+\/watch\?v=([^&?/]+)/);
                        if (youtubeUrlMatch && youtubeUrlMatch[1]) {
                            videoId = youtubeUrlMatch[1];
                        } else {
                            // Add other patterns if needed for googleusercontent URLs
                            console.warn("Could not extract YouTube ID from googleusercontent URL:", url);
                        }
    
                     }
                     // Handle youtu.be shortened URLs
                     else if (parsedUrl.hostname === 'youtu.be') {
                       videoId = parsedUrl.pathname.substring(1);
                     }
                     // Handle YouTube Shorts
                     else if (parsedUrl.pathname.includes('/shorts/')) {
                       videoId = parsedUrl.pathname.split('/shorts/')[1].split('/')[0];
                     }
                     // Handle regular YouTube videos
                     else if (parsedUrl.pathname === '/watch') {
                       videoId = parsedUrl.searchParams.get("v");
                     }
    
                     if (videoId) {
                       // Return just the video ID as the normalized form
                       return `youtube:${videoId}`;
                     }
                  }
    
                  // For Instagram posts/reels
                  if (parsedUrl.hostname.includes('instagram.com')) {
                    const path = parsedUrl.pathname.split('/').filter(Boolean);
                    // Check for standard /p/ID/ or /reel/ID/ formats
                    if (path.length >= 2 && (path[0] === 'p' || path[0] === 'reel')) {
                      // Return the type and ID as the normalized form
                      return `instagram:${path[0]}/${path[1]}`;
                    }
                  }
    
                  // For URLs that don't match patterns, return the cleaned URL (no query params/hash)
                   return parsedUrl.origin + parsedUrl.pathname;
                } catch (e) {
                  console.warn("Error normalizing URL:", url, e);
                  return url; // Return original URL if parsing fails
                }
              }
    
              if (allVideos.length === 0) {
                const noVideosMessage = document.createElement("p");
                noVideosMessage.textContent = "No videos yet.";
                videoContainer.appendChild(noVideosMessage);
              } else {
                allVideos.forEach((video) => {
                  // Create masonry item
                  const item = document.createElement("div");
                  item.classList.add("masonry-item");
                  item.style.breakInside = "avoid";
                  item.style.marginBottom = "20px";
    
                  if (video.kind === "YouTube") {
                    try {
                      // Use the normalized ID for embedding
                      const normalizedId = normalizeVideoUrl(video.url);
                      if (normalizedId.startsWith('youtube:')) {
                         const videoId = normalizedId.substring(8); // Get ID after "youtube:"
    
                         // Create responsive YouTube container
                         const content = document.createElement("div");
                         content.style.position = "relative";
                         content.style.paddingBottom = "56.25%"; // 16:9
                         content.style.height = "0";
                         content.style.overflow = "hidden";
                         content.style.maxWidth = "550px";
                         content.style.width = "100%";
    
                         const embed = document.createElement("iframe");
                         embed.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
                         embed.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
                         embed.allowFullscreen = true;
                         embed.loading = "lazy";
                         embed.style.position = "absolute";
                         embed.style.top = "0";
                         embed.style.left = "0";
                         embed.style.width = "100%";
                         embed.style.height = "100%";
                         embed.style.border = "none";
    
                         content.appendChild(embed);
                         item.appendChild(content);
                         videoContainer.appendChild(item);
                      } else {
                         console.warn("Could not create YouTube embed for URL:", video.url);
                      }
                    } catch (e) {
                      console.warn("Error processing YouTube URL:", video.url, e);
                    }
                  } else if (video.kind === "Insta") {
                    try {
                       // Use the normalized ID for embedding
                      const normalizedId = normalizeVideoUrl(video.url);
                       if (normalizedId.startsWith('instagram:')) {
                         const instaPath = normalizedId.substring(10); // Get path after "instagram:"
    
                        // Instagram container
                        const content = document.createElement("div");
                        content.style.position = "relative";
                        content.style.paddingBottom = "125%"; // Adjust as needed
                        content.style.height = "0";
                        content.style.overflow = "hidden";
                        content.style.maxWidth = "350px";
                        content.style.width = "100%";
                        content.style.margin = "0 auto";
    
                        // Create a placeholder with loading effect
                        const placeholder = document.createElement("div");
                        placeholder.style.position = "absolute";
                        placeholder.style.top = "0";
                        placeholder.style.left = "0";
                        placeholder.style.width = "100%";
                        placeholder.style.height = "100%";
                        placeholder.style.display = "flex";
                        placeholder.style.alignItems = "center";
                        placeholder.style.justifyContent = "center";
                        placeholder.style.backgroundColor = "#fafafa";
    
                        // Add a loading spinner
                        const spinner = document.createElement("div");
                        spinner.style.border = "3px solid #f3f3f3";
                        spinner.style.borderTop = "3px solid #3897f0";
                        spinner.style.borderRadius = "50%";
                        spinner.style.width = "30px";
                        spinner.style.height = "30px";
                        spinner.style.animation = "spin 1s linear infinite";
                        placeholder.appendChild(spinner);
    
                        // Add animation style if not already added
                        if (!document.getElementById("spin-animation")) {
                          const style = document.createElement("style");
                          style.id = "spin-animation";
                          style.textContent = "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
                          document.head.appendChild(style);
                        }
    
                        // Create the Instagram iframe
                        const embedUrl = `https://www.instagram.com/${instaPath}/embed/?cr=1&v=14&wp=540&rd=YOUR_WEBSITE_DOMAIN&rp=%2F#%7B%22ci%22%3A0%2C%22os%22%3A0%2C%22ls%22%3A0%2C%22le%22%3A0%7D`; // Replace YOUR_WEBSITE_DOMAIN if needed
                        const embed = document.createElement('iframe');
                        embed.src = embedUrl;
                        embed.loading = "lazy";
                        embed.scrolling = "no";
                        embed.style.position = "absolute";
                        embed.style.top = "0";
                        embed.style.left = "0";
                        embed.style.width = "100%";
                        embed.style.height = "100%";
                        embed.style.border = "none";
    
                        // Remove placeholder when loaded
                        embed.onload = () => {
                           if(placeholder.parentNode) { // Check if still attached
                               placeholder.style.display = "none";
                           }
                        };
                         embed.onerror = () => {
                            console.error("Failed to load Instagram embed:", embedUrl);
                            if(placeholder.parentNode) {
                                placeholder.innerHTML = '<p style="color: red; font-size: 12px; text-align: center;">Could not load Instagram post.</p>';
                            }
                        };
    
                        content.appendChild(placeholder);
                        content.appendChild(embed);
                        item.appendChild(content);
                        videoContainer.appendChild(item);
    
                        // Load Instagram embed script if needed (Load once)
                        if (!document.getElementById("instagram-embed-script")) {
                          const instaScript = document.createElement("script");
                          instaScript.id = "instagram-embed-script";
                          instaScript.src = "https://www.instagram.com/embed.js"; // Use https
                          instaScript.async = true;
                          // instaScript.defer = true; // Defer can sometimes cause issues with dynamic loading
                          document.body.appendChild(instaScript);
                        }
                      } else {
                         console.warn("Could not create Instagram embed for URL:", video.url);
                      }
                    } catch (e) {
                      console.warn("Error processing Instagram URL:", video.url, e);
                    }
                  }
                });
    
                // Process Instagram embeds after all are added (optional, might be handled by embed.js itself)
                // Ensure the script is loaded before calling process
                 setTimeout(() => { // Add slight delay to ensure script might be loaded
                    if (window.instgrm && window.instgrm.Embeds) {
                     console.log("Processing Instagram embeds...");
                     window.instgrm.Embeds.process();
                    }
                }, 500); // Delay might need adjustment
              }
            }
    
            // Add event listeners for video loading
            window.addEventListener("DOMContentLoaded", loadVideos);
            // Fallback load trigger if DOMContentLoaded is missed or insta script loads late
            window.addEventListener("load", function() {
                 setTimeout(() => { // Add slight delay
                    if (window.instgrm && window.instgrm.Embeds) {
                     console.log("Processing Instagram embeds on window.load...");
                     window.instgrm.Embeds.process();
                    }
                 }, 500);
            });
    
    
            // --- Review Loading Logic ---
            async function loadDynamicReviews() {
              try {
                 // Clear loading message if present
                 const dynamicReviewsContainer = document.getElementById('dynamic-reviews');
                 if (!dynamicReviewsContainer) return;
                 const loadingReviewMsg = dynamicReviewsContainer.querySelector('.loading-review');
                  if (loadingReviewMsg) {
                     dynamicReviewsContainer.removeChild(loadingReviewMsg);
                 }
    
    
                // Fetch the JSON data
                const jsonFile = "<?php echo htmlspecialchars($urlPrefix); ?>/parawings.json";
                const response = await fetch(jsonFile);
                if (!response.ok) {
                  throw new Error('Failed to load product data');
                }
                const parawings = await response.json();
    
                // Get the current page's product information from data attributes
                const reviewsContainer = document.querySelector('.product-reviews');
                if (!reviewsContainer) return;
    
                const brandName = reviewsContainer.getAttribute('data-brand');
                const productName = reviewsContainer.getAttribute('data-product');
    
                // Find the matching parawing
                const parawing = parawings.find(p => p.brandName === brandName && p.name === productName);
    
                // Filter reviews (handle case where reviews might be null or missing)
                const currentReviews = (parawing && Array.isArray(parawing.reviews)) ? parawing.reviews : [];
    
    
                if (currentReviews.length === 0) {
                     dynamicReviewsContainer.innerHTML = '<p class="empty-review">No reviews yet.</p>'; // Show message if no reviews
                } else {
                     dynamicReviewsContainer.innerHTML = ''; // Clear container before adding new reviews
                }
    
                // Sort reviews by date, newest first
                const sortedReviews = currentReviews.sort((a, b) =>
                  new Date(b.date) - new Date(a.date)
                );
    
    
                // Calculate the average rating based ONLY on the fetched reviews
                 let totalStars = 0;
                 sortedReviews.forEach(review => {
                     totalStars += (review.stars ? Number(review.stars) : 0); // Ensure stars is a number
                 });
    
                 const totalReviewsCount = sortedReviews.length;
                 const averageRating = totalReviewsCount > 0 ? totalStars / totalReviewsCount : 0;
    
    
                // Update the rating display elements
                const ratingTextElement = document.querySelector('.rating-text');
                const starsElement = document.querySelector('.rating-link .stars');
                const reviewCountElement = document.querySelector('.review-count');
    
                if (totalReviewsCount > 0) {
                    if (ratingTextElement) {
                      ratingTextElement.textContent = averageRating.toFixed(1);
                    }
                    if (starsElement) {
                      starsElement.style.setProperty('--rating', averageRating);
                    }
                    if (reviewCountElement) {
                      reviewCountElement.textContent = `(${totalReviewsCount})`;
                    }
                } else {
                     // Clear rating if no reviews
                     if (ratingTextElement) ratingTextElement.textContent = '';
                     if (starsElement) starsElement.style.setProperty('--rating', '0');
                     if (reviewCountElement) reviewCountElement.textContent = '';
                }
    
    
                // Generate HTML for each review
                let reviewsHTML = '';
    
                sortedReviews.forEach(review => {
                  // Format the date
                  const formattedDate = formatReviewDate(review.date);
    
                  // Create stars string safely
                  const starsValue = review.stars ? Number(review.stars) : 0;
                  const stars = `<div class="stars small" style="--rating: ${starsValue};"></div>`;
    
                  // Website link safely
                   const websiteLinkStart = review.website ?
                     `<a href="${encodeURI(review.website)}" class="user-website" rel="noopener noreferrer" target="_blank">` : // Added rel and encodeURI
                     '';
                   const websiteLinkEnd = review.website ? '</a>' : '';
    
                   // Sanitize user input before displaying (basic example)
                   const safeUserName = document.createElement('span');
                   safeUserName.textContent = review.userName || 'Anonymous'; // Handle missing username
    
                   const safeReviewText = document.createElement('p');
                   safeReviewText.textContent = review.text || ''; // Handle missing text
                   const textHTML = safeReviewText.innerHTML.replace(/\n/g, '<br>'); // Convert newlines after sanitizing
    
    
                   reviewsHTML += `
                     <div class="review" data-user="${safeUserName.textContent}">
                       <div class="review-header">
                         <p>${websiteLinkStart}<span class="user-name">${safeUserName.innerHTML}</span>${websiteLinkEnd}${stars}</p>
                         </div>
                         <div class="review-date">${formattedDate}</div>
                       <p class="review-text">${textHTML}</p>
                     </div>
                   `;
                });
    
                // Add the reviews to the dynamic reviews container
                dynamicReviewsContainer.innerHTML = reviewsHTML; // Replace content entirely
    
              } catch (error) {
                console.error('Error loading dynamic reviews:', error);
                 const dynamicReviewsContainer = document.getElementById('dynamic-reviews');
                 if (dynamicReviewsContainer) {
                     dynamicReviewsContainer.innerHTML = '<p class="error-review">Could not load reviews.</p>';
                 }
    
              }
            }
    
            // Helper function to format the review date string
            function formatReviewDate(dateString) {
              // Check if dateString is valid
               if (!dateString) return 'Date unknown';
    
               const date = new Date(dateString);
               // Check if the created date is valid
               if (isNaN(date.getTime())) {
                 return dateString; // Return original string if invalid
               }
    
               // Use en-US locale for "Month Day, Year" format
               const options = { year: 'numeric', month: 'long', day: 'numeric' };
               try {
                    return date.toLocaleDateString('en-US', options);
               } catch (e) {
                   console.warn("Could not format date:", dateString, e);
                   return dateString; // Fallback to original string on error
               }
            }
    
            // Load reviews when the DOM is fully loaded
            document.addEventListener('DOMContentLoaded', loadDynamicReviews);
    
    
            // --- Add Review Form Logic ---
            document.addEventListener('DOMContentLoaded', function() {
              const reviewBtn = document.getElementById('add-review-btn');
              const formContainer = document.getElementById('review-form-container');
              const form = document.getElementById('review-form');
              const productReviews = document.querySelector('.product-reviews'); // Used to get data attributes
    
               // Ensure elements exist before adding listeners
               if (!reviewBtn || !formContainer || !form || !productReviews) {
                   console.error("Add review form elements not found.");
                   return;
               }
    
    
              // Set the hidden fields with the data attributes from the product-reviews div
               const brandHiddenInput = form.querySelector('#brandName');
               const productHiddenInput = form.querySelector('#productName');
    
               if (brandHiddenInput) {
                   brandHiddenInput.value = productReviews.dataset.brand || '';
               }
               if (productHiddenInput) {
                   productHiddenInput.value = productReviews.dataset.product || '';
               }
    
    
              // Show the form when the button is clicked
              reviewBtn.addEventListener('click', function() {
                reviewBtn.style.display = 'none';
                formContainer.style.display = 'block';
              });
    
              // Handle form submission
              form.addEventListener('submit', function(e) {
                e.preventDefault();
    
                // Add temporary submitting state feedback
                 const submitButton = form.querySelector('button[type="submit"]');
                 const originalButtonText = submitButton.textContent;
                 submitButton.disabled = true;
                 submitButton.textContent = 'Submitting...';
    
    
                const formData = new FormData(form);
    
                // Use the urlPrefix variable from PHP for the fetch URL
                fetch("<?php echo htmlspecialchars($urlPrefix); ?>/submit-review.php", {
                  method: 'POST',
                  body: formData
                })
                .then(response => {
                    // Check if response is ok and content type is JSON before parsing
                    if (!response.ok) {
                        // Try to get text for non-JSON errors
                        return response.text().then(text => {
                             throw new Error(`Server error: ${response.status} ${response.statusText} - ${text}`);
                        });
                    }
                    const contentType = response.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                         return response.text().then(text => { // Handle non-JSON success response (if applicable)
                            console.log("Received non-JSON success response:", text);
                            // Treat as success for now, or adapt based on actual response
                             return { success: true, message: "Review submitted (non-JSON response)." };
                         });
                    }
                     return response.json(); // Process valid JSON response
                })
                .then(data => {
                  if (data.success) {
                     // Show success message
                    alert('Review submitted successfully! It will appear after approval.'); // Modified message
    
                    // Hide the form and show the button again
                    formContainer.style.display = 'none';
                    reviewBtn.style.display = 'inline-block'; // Or 'block' depending on CSS
                    form.reset(); // Clear the form fields
    
                    // Optionally: Instead of reload, you could dynamically add the review
                    // to the list if your backend confirms it's approved immediately.
                    // Or trigger a re-fetch of reviews:
                    // loadDynamicReviews();
                  } else {
                    // Use the message from the server response if available
                    alert('Error submitting review: ' + (data.message || 'Unknown error.'));
                  }
                })
                .catch(error => {
                  console.error('Error submitting review form:', error);
                  alert('An error occurred while submitting your review. Please try again later.');
                })
                 .finally(() => {
                     // Restore button state regardless of success/error
                     submitButton.disabled = false;
                     submitButton.textContent = originalButtonText;
                 });
              });
            });
    
        </script>
</body>
</html>
async function loadVideos() {
  const jsonFile = "__JSON_FILE__";
  const res = await fetch(jsonFile);
  const parawings = await res.json();
  const videoContainer = document.getElementById("videos");
  const brandName = "__BRAND_NAME__";
  const name = "__NAME__";

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

  // Get all videos and remove duplicates by URL
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
      if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname === 'youtu.be') {
        let videoId;

        // Handle youtu.be shortened URLs
        if (parsedUrl.hostname === 'youtu.be') {
          videoId = parsedUrl.pathname.substring(1);
        } 
        // Handle YouTube Shorts
        else if (parsedUrl.pathname.includes('/shorts/')) {
          videoId = parsedUrl.pathname.split('/shorts/')[1].split('/')[0];
        } 
        // Handle regular YouTube videos
        else {
          videoId = parsedUrl.searchParams.get("v");
        }

        if (videoId) {
          // Return just the video ID as the normalized form
          return `youtube:${videoId}`;
        }
      }

      // For Instagram posts/reels
      if (parsedUrl.hostname.includes('instagram.com')) {
          // Use a regex to match the pattern /optional_username/(reel|p)/identifier
          const match = parsedUrl.pathname.match(/^\/(?:[a-zA-Z0-9_.]+\/)?(reel|p)\/([a-zA-Z0-9_-]+)/);
      
          // If the regex finds a match and captures the type (reel or p) and the identifier
          if (match && match[1] && match[2]) {
              // Construct the desired string in the format instagram:type/identifier
              return `instagram:${match[1]}/${match[2]}`;
          }
      }

      // For URLs that don't match patterns, return the full URL
      return url;
    } catch (e) {
      console.warn("Error normalizing URL:", url, e);
      return url;
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
          const url = new URL(video.url);
          let videoId;

          // Handle youtu.be shortened URLs
          if (url.hostname === 'youtu.be') {
            videoId = url.pathname.substring(1);
          } 
          // Handle YouTube Shorts
          else if (url.pathname.includes('/shorts/')) {
            videoId = url.pathname.split('/shorts/')[1].split('/')[0];
          } 
          // Handle regular YouTube videos
          else {
            videoId = url.searchParams.get("v");
          }

          if (videoId) {
            // Create responsive YouTube container - wider than before
            const content = document.createElement("div");
            content.style.position = "relative";
            content.style.paddingBottom = "56.25%"; // 16:9 aspect ratio
            content.style.height = "0";
            content.style.overflow = "hidden";
            content.style.maxWidth = "550px"; // Increased YouTube width
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
          }
        } catch (e) {
          console.warn("Invalid YouTube URL:", video.url, e);
        }
      } else if (video.kind === "Insta") {
        try {
          const url = new URL(video.url);
          const path = url.pathname.split('/').filter(Boolean);

          if (path.length >= 2) {
            // Instagram container - no card design
            const content = document.createElement("div");
            content.style.position = "relative";
            content.style.paddingBottom = "125%"; // 4:5 aspect ratio for Instagram
            content.style.height = "0";
            content.style.overflow = "hidden";
            content.style.maxWidth = "350px"; // Keep Instagram width more compact
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
            spinner.style.borderTop = "3px solid #3897f0"; // Instagram blue
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

            // Create the Instagram iframe with proper parameters
            const embedUrl = `https://www.instagram.com/${path[0]}/${path[1]}/embed`;
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
              placeholder.style.display = "none";
            };

            content.appendChild(placeholder);
            content.appendChild(embed);
            item.appendChild(content);
            videoContainer.appendChild(item);

            // Load Instagram embed script if needed
            if (!document.getElementById("instagram-embed-script")) {
              const instaScript = document.createElement("script");
              instaScript.id = "instagram-embed-script";
              instaScript.src = "//www.instagram.com/embed.js";
              instaScript.async = true;
              instaScript.defer = true;
              document.body.appendChild(instaScript);
            }
          }
        } catch (e) {
          console.warn("Invalid Instagram URL:", video.url, e);
        }
      }
    });

    // Process Instagram embeds after all are added
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }
}

// Add event listeners
window.addEventListener("DOMContentLoaded", loadVideos);
window.addEventListener("load", function() {
  if (window.instgrm) {
    window.instgrm.Embeds.process();
  }
});
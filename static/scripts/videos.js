
async function loadVideos() {
  const res = await fetch("/parawings.json");
  const parawings = await res.json();
  const videoContainer = document.getElementById("videos");
  const allVideos = parawings.flatMap(
    (p) => p.videos?.map((v) => ({ ...v, name: p.name })) || [],
  );
  allVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
  allVideos.forEach((video) => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "2em";
    
    let embed;
    if (video.kind === "YouTube") {
      // Extract video ID from either youtu.be format or youtube.com format
      let videoId;
      try {
        const url = new URL(video.url);
        if (url.hostname === 'youtu.be') {
          // Format: https://youtu.be/dQw4w9WgXcQ
          videoId = url.pathname.substring(1); // Remove the leading '/'
        } else {
          // Format: https://www.youtube.com/watch?v=dQw4w9WgXcQ
          videoId = url.searchParams.get("v");
        }

        if (videoId) {
          embed = document.createElement("iframe");
          embed.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
          embed.allow =
            "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
          embed.loading = "lazy";
        } else {
          console.warn("Could not extract video ID from YouTube URL:", video.url);
        }
      } catch (e) {
        console.warn("Invalid YouTube URL:", video.url, e);
      }
    } else if (video.kind === "Insta") {
      try {
        const url = new URL(video.url);
        const path = url.pathname.split('/').filter(Boolean); // e.g., ["reel", "DEHSDqQoJKe"]
        if (path.length >= 2) {
          const embedUrl = `https://www.instagram.com/${path[0]}/${path[1]}/embed`;
          embed = document.createElement('iframe');
          embed.src = embedUrl;
          embed.loading = "lazy";
          embed.scrolling = "no";
        }
      } catch (e) {
        console.warn("Invalid Instagram URL:", video.url);
      }
    }
    if (embed) {
      embed.width = "100%";
      embed.height = video.kind === "Insta" ? "800" : "337.5";
      embed.style.border = "none";
      embed.style.maxWidth = "600px";
      wrapper.appendChild(embed);
    }
    videoContainer.appendChild(wrapper);
  });
}
window.addEventListener("DOMContentLoaded", loadVideos);
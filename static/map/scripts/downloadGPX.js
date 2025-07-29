async function downloadGPX() {
  try {
    const spot = spotData;
    
    if (!spot.locations || spot.locations.length <= 1) {
      console.error("Not enough locations for GPX track:", spot.locations?.length || 0);
      return;
    }
    
    const gpxContent = createGPXContent(spot);
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_track.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error downloading GPX:", error);
  }
}

function createGPXContent(spot) {
  const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="project7III/foildata" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(spot.name)}</name>
    <desc>Track for ${escapeXml(spot.name)} in ${escapeXml(spot.country)}${spot.state ? ', ' + escapeXml(spot.state) : ''}</desc>
    <author>
      <name>project7III/foildata</name>
      <link href="https://project7iii.com/foildata/map">
        <text>Downloaded from project7III foildata/map</text>
      </link>
    </author>
    <link href="https://project7iii.com/foildata/map">
      <text>project7III foildata/map</text>
    </link>
  </metadata>
  <trk>
    <name>${escapeXml(spot.name)}</name>
    <type>${escapeXml(spot.kind)}</type>
    <trkseg>`;

  const trackPoints = spot.locations.map((location, index) => 
    `      <trkpt lat="${location.lat}" lon="${location.lng}">
        <name>Point ${index + 1}</name>
      </trkpt>`
  ).join('\n');

  const gpxFooter = `    </trkseg>
  </trk>
</gpx>`;

  return gpxHeader + '\n' + trackPoints + '\n' + gpxFooter;
}

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') {
    return String(unsafe);
  }
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
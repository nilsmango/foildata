// Initialize the map
// Create map without default attribution
const map = L.map('map', {
  attributionControl: false
}).setView([51.505, -0.09], 13);

// Add custom attribution
L.control.attribution({
  prefix: '<a href="/foildata/about">about</a> | <a href="/foildata/contact">contact</a> | <a href="/foildata/privacy">privacy policy</a> | Powered by <a href="https://leafletjs.com">Leaflet</a> | Maps &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add the tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: ''
}).addTo(map);

// Global variables
let spots = []
let currentMarkers = []
let isAddMode = false
let tempMarkers = []
let tempPolylines = []

// Make functions available globally for form.js
window.cancelAddMode = cancelAddMode
window.loadSpots = loadSpots

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

// Default icon for temporary markers
const tempIcon = L.icon({
  iconUrl: "icons/temp-marker.svg",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -24],
})

// Load spots from JSON
async function loadSpots() {
  try {
    console.log("Attempting to load spots.json...")
    const response = await fetch(`spots.json?t=${Date.now()}`)
    if (!response.ok) {
      throw new Error(`Failed to load spots: ${response.status} ${response.statusText}`)
    }
    const data = await response.json()
    console.log("Loaded spots:", data)
    spots = data
    renderSpots()
  } catch (error) {
    console.error("Error loading spots:", error)
    // Initialize with empty array if file doesn't exist yet
    spots = []
    // Still try to render the map even if no spots are loaded
    renderSpots()
  }
}

// Get the appropriate icon based on spot type and pending status
function getIcon(type, isPending) {
  if (isPending) {
    return L.icon({
      iconUrl: "icons/pending.svg",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  // Add debug logging to see what icon is being requested
  console.log("Getting icon for type:", type)

  // Check if the icon exists in our spotIcons object
  if (!spotIcons[type]) {
    console.warn(`Icon not found for type: ${type}, using default`)
    return spotIcons.default
  }

  return spotIcons[type]
}

// Modify renderSpots to add more debugging
function renderSpots() {
  console.log("Rendering spots...")
  console.log("Total spots:", spots.length)

  // Clear existing markers
  currentMarkers.forEach((marker) => map.removeLayer(marker))
  currentMarkers = []

  // Get selected filters
  const selectedTypes = Array.from(document.querySelectorAll('input[name="spot-type"]:checked')).map(
    (checkbox) => checkbox.value,
  )
  console.log("Selected filters:", selectedTypes)

  const showPending = selectedTypes.includes("pending")

  // Filter spots based on selected types
  const filteredSpots = spots.filter((spot) => {
    // Skip pending spots if not showing them
    if (spot.pending && !showPending) return false

    // For routes (multiple points)
    if (spot.locations && spot.locations.length > 1) {
      return selectedTypes.includes(spot.kind)
    }

    // For single point spots
    return selectedTypes.includes(spot.kind)
  })

  console.log("Filtered spots:", filteredSpots.length)

  // Add filtered spots to the map
  filteredSpots.forEach((spot) => {
    console.log("Adding spot to map:", spot.name, spot.kind)

    if (spot.locations && spot.locations.length > 1) {
      // It's a route with multiple points
      const points = spot.locations.map((loc) => [loc.lat, loc.lng])
      console.log("Route points:", points)
      
      const turfPoints = spot.locations.map(loc => [loc.lng, loc.lat]);
      const line = turf.lineString(turfPoints);
      const curved = turf.bezierSpline(line);
      const smoothPoints = curved.geometry.coordinates.map(c => [c[1], c[0]]);
      // Create a polyline for the route
      const polyline = L.polyline(smoothPoints, {
        color: spot.pending ? "#888" : "#E7FF00",
        weight: 4,
        opacity: spot.pending ? 0.6 : 1.0,
      }).addTo(map)

      // Add start and end markers
      const startMarker = L.marker(points[0], {
        icon: getIcon(spot.kind, spot.pending),
      }).addTo(map)

      const endIcon = spot.pending
        ? L.icon({ iconUrl: "icons/pending.svg", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
        : spot.kind === "paddle-tour"
        ? L.icon({ iconUrl: "icons/paddle-route-finish.svg", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
        : spot.kind === "downwind-run"
        ? L.icon({ iconUrl: "icons/route-finish.svg", iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })
        : getIcon(spot.kind, spot.pending)
      
      const endMarker = L.marker(points[points.length - 1], {
        icon: endIcon,
      }).addTo(map)

      // Add click handlers
      polyline.on("click", () => showSpotInfo(spot))
      startMarker.on("click", () => showSpotInfo(spot))
      endMarker.on("click", () => showSpotInfo(spot))

      // Store markers and polyline for later removal
      currentMarkers.push(polyline, startMarker, endMarker)
    } else if (spot.locations && spot.locations.length === 1) {
      // It's a single point spot
      console.log("Single point:", spot.locations[0].lat, spot.locations[0].lng)

      const marker = L.marker([spot.locations[0].lat, spot.locations[0].lng], {
        icon: getIcon(spot.kind, spot.pending),
      }).addTo(map)

      marker.on("click", () => showSpotInfo(spot))
      currentMarkers.push(marker)
    } else {
      console.warn("Spot has no valid locations:", spot)
    }
  })

  // If we have spots, fit the map to show them all
  if (filteredSpots.length > 0) {
    const allPoints = []
    filteredSpots.forEach((spot) => {
      if (spot.locations) {
        spot.locations.forEach((loc) => {
          allPoints.push([loc.lat, loc.lng])
        })
      }
    })

    if (allPoints.length > 0) {
      console.log("Fitting map to bounds")
      map.fitBounds(allPoints)
    }
  }
}

// Show spot info in the card
function showSpotInfo(spot) {
  const infoCard = document.getElementById("spot-info-card")
  const spotName = document.getElementById("spot-name")
  const spotType = document.getElementById("spot-type")
  const spotDistance = document.getElementById("spot-distance")
  const spotDescription = document.getElementById("spot-description")
  const spotPendingNotice = document.getElementById("spot-pending-notice")
  const spotDetailsBtn = document.getElementById("spot-details-btn")

  // Set spot name
  spotName.textContent = spot.name

  // Set spot type
  const typeLabels = {
    "pump-foil-dock": "Pump Foil Dock",
    "wake-thief-spot": "Wake Thief Spot",
    "wave-wind-spot": "Wind & Wave Spot",
    "wind-spot": "Wind Spot",
    "wave-spot": "Wave Spot",
    "rental-station": "Rental Station",
    "shop": "Shop",
    "school": "School",
    "wake-boat": "Wake Boat",
    "downwind-run": "Downwind Run",
    "paddle-tour": "Paddle Tour",
  }

  spotType.textContent = typeLabels[spot.kind] || spot.kind

  // Set distance if it's a route
  if (spot.distance) {
    spotDistance.textContent = `Distance: ${spot.distance} km`
    spotDistance.classList.remove("hidden")
  } else {
    spotDistance.classList.add("hidden")
  }

  // Set description (first info with description tag, if available)
  spotDescription.innerHTML = ""
  if (spot.infos && spot.infos.length > 0) {
    const descriptionInfo = spot.infos.find((info) => info.tag === "description")
    if (descriptionInfo) {
      // Format text with links
      const formattedText = formatTextWithLinks(descriptionInfo.text)
      spotDescription.innerHTML = `<p>${formattedText}</p>`
    }
  }

  // Show pending notice if applicable
  if (spot.pending) {
    spotPendingNotice.classList.remove("hidden")
  } else {
    spotPendingNotice.classList.add("hidden")
  }

  // Set details button link
  spotDetailsBtn.onclick = () => {
    if (spot.pending) {
      // For pending spots, use the PHP page to dynamically generate content
      window.location.href = `spot-detail.php?id=${spot.id}`
    } else {
      // For non-pending spots, link directly to the static page
      window.location.href = `${spot.id}`
    }
  }

  // Show the info card
  infoCard.classList.remove("hidden")
}

// Format text with links
function formatTextWithLinks(text) {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g

  // Replace URLs with anchor tags
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
  })
}

// Calculate distance between two points in kilometers
function calculateDistance(point1, point2) {
  const lat1 = point1[0]
  const lon1 = point1[1]
  const lat2 = point2[0]
  const lon2 = point2[1]

  // Haversine formula to calculate distance between two points on Earth
  const R = 6371 // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km

  return distance
}

// Calculate total distance of a route
function calculateTotalDistance(points) {
  let totalDistance = 0

  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(points[i], points[i + 1])
  }

  return totalDistance
}

// Add spot button click handler
document.getElementById("add-spot-btn").addEventListener("click", () => {
  isAddMode = true
  document.getElementById("add-mode-hint").classList.remove("hidden")
  document.getElementById("add-spot-btn").classList.add("hidden")
})

// Cancel add mode
document.getElementById("cancel-add").addEventListener("click", () => {
  cancelAddMode()
})

// Close info card
document.getElementById("close-info-card").addEventListener("click", () => {
  document.getElementById("spot-info-card").classList.add("hidden")
})

// Map click handler for adding points
map.on("click", (e) => {
  if (!isAddMode) return

  const latlng = [e.latlng.lat, e.latlng.lng]

  // Add a temporary marker
  const marker = L.marker(latlng, { icon: tempIcon }).addTo(map)
  tempMarkers.push(marker)

  // Add click handler to remove the marker
  marker.on("click", () => {
    if (isAddMode) {
      // Find the index of the marker
      const index = tempMarkers.indexOf(marker)
      if (index !== -1) {
        // Remove the marker
        map.removeLayer(marker)
        tempMarkers.splice(index, 1)

        // Update polylines
        updateTempPolylines()

        // Update buttons
        updateAddButtons()
      }
    }
  })

  // Update polylines
  updateTempPolylines()

  // Update buttons
  updateAddButtons()

  // Reverse geocode to get location name
  reverseGeocode(latlng)
})

// Update temporary polylines
function updateTempPolylines() {
  // Remove existing polylines
  tempPolylines.forEach((polyline) => map.removeLayer(polyline))
  tempPolylines = []

  // If we have at least 2 markers, create a polyline
  if (tempMarkers.length >= 2) {
    const points = tempMarkers.map((marker) => marker.getLatLng())
    const polyline = L.polyline(points, {
      color: "#E7FF00",
      weight: 4,
      opacity: 1.0,
      // dashArray: "5, 10",
    }).addTo(map)

    tempPolylines.push(polyline)
  }
}

// Update add buttons based on number of points
function updateAddButtons() {
  const addSpotFormBtn = document.getElementById("add-spot-form-btn")
  const addRouteFormBtn = document.getElementById("add-route-form-btn")

  if (tempMarkers.length === 1) {
    addSpotFormBtn.classList.remove("hidden")
    addRouteFormBtn.classList.add("hidden")
  } else if (tempMarkers.length >= 2) {
    addSpotFormBtn.classList.add("hidden")
    addRouteFormBtn.classList.remove("hidden")
  } else {
    addSpotFormBtn.classList.add("hidden")
    addRouteFormBtn.classList.add("hidden")
  }
}

// Cancel add mode
function cancelAddMode() {
  isAddMode = false

  // Remove temporary markers and polylines
  tempMarkers.forEach((marker) => map.removeLayer(marker))
  tempPolylines.forEach((polyline) => map.removeLayer(polyline))

  tempMarkers = []
  tempPolylines = []

  // Hide add mode elements
  document.getElementById("add-mode-hint").classList.add("hidden")
  document.getElementById("add-spot-form-btn").classList.add("hidden")
  document.getElementById("add-route-form-btn").classList.add("hidden")
  document.getElementById("add-spot-btn").classList.remove("hidden")
}

// Reverse geocode to get location name for first and last markers only
async function reverseGeocode() {
  try {
    // Create an array to store location data
    let locationData = [];
    
    // Check if there are any markers
    if (tempMarkers.length === 0) {
      return null;
    }
    
    // Array of markers to geocode (first and last, or just first if only one)
    const markersToGeocode = [];
    markersToGeocode.push(tempMarkers[0]); // First marker
    
    // Add last marker if it's different from the first one
    if (tempMarkers.length > 1) {
      markersToGeocode.push(tempMarkers[tempMarkers.length - 1]);
    }
    
    // Geocode only the selected markers
    for (const marker of markersToGeocode) {
      const markerLatLng = marker.getLatLng();
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${markerLatLng.lat}&lon=${markerLatLng.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract useful address components
        const address = data.address;
        let locationName = '';
        
        // Try to get most relevant location name components
        if (address.village || address.town || address.city) {
          locationName = address.village || address.town || address.city;
        } else if (address.suburb) {
          locationName = address.suburb;
        } else if (address.county) {
          locationName = address.county;
        }
        
        // Add extra detail for single locations
        if (tempMarkers.length === 1 && address.road) {
          locationName = `${address.road}, ${locationName}`;
        }
        
        locationData.push({
          fullName: data.display_name,
          shortName: locationName,
          country: address.country,
          countryCode: address.country_code,
          state: address.state,
          stateCode: address.state_code
        });
      }
    }
    
    // Generate a display name based on the number of locations
    let displayName = "";
    let suggestedName = "";
    
    if (locationData.length === 1) {
      // Single location - use more detailed name
      displayName = locationData[0].fullName;
      suggestedName = locationData[0].shortName;
    } else if (locationData.length > 1) {
      // Multiple locations - show first and last with arrow
      displayName = `${locationData[0].fullName} → ${locationData[locationData.length - 1].fullName}`;
      suggestedName = `${locationData[0].shortName} → ${locationData[locationData.length - 1].shortName}`;
    }
    
    // Store the location data for form use
    sessionStorage.setItem("lastLocationData", JSON.stringify(locationData));
    sessionStorage.setItem("lastLocationName", displayName);
    sessionStorage.setItem("suggestedName", suggestedName);
    
    // Update location name display
    document.getElementById("location-name").textContent = `Suggestion: ${suggestedName}`;
    
    return locationData;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

// Add spot form button click handler
document.getElementById("add-spot-form-btn").addEventListener("click", () => {
  if (tempMarkers.length !== 1) return

  // Get the coordinates
  const latlng = tempMarkers[0].getLatLng()

  // Open the form modal
  openAddForm("spot", [[latlng.lat, latlng.lng]])
})

// Add route form button click handler
document.getElementById("add-route-form-btn").addEventListener("click", () => {
  if (tempMarkers.length < 2) return

  // Get all coordinates
  const points = tempMarkers.map((marker) => {
    const latlng = marker.getLatLng()
    return [latlng.lat, latlng.lng]
  })

  // Open the form modal
  openAddForm("route", points)
})

// Open add form modal
function openAddForm(type, points) {
  // Set form type
  document.getElementById("form-type").value = type;

  // Set form title
  document.getElementById("form-title").textContent = type === "spot" ? "Add Spot" : "Add Route";

  // Set coordinates
  document.getElementById("form-coordinates").value = JSON.stringify(points);

  // Get location data
  const locationName = sessionStorage.getItem("lastLocationName");
  const suggestedName = sessionStorage.getItem("suggestedName");
  const locationData = JSON.parse(sessionStorage.getItem("lastLocationData") || "[]");
  
  // Pre-fill the name field with the suggested name
  if (suggestedName) {
    document.getElementById("spot-name-input").value = suggestedName;
  }
  
  // Show location name as suggestion
  if (locationName) {
    document.getElementById("location-name").textContent = `Suggestion: ${suggestedName}`;
  }
  
  // Pre-fill country and state if available
  if (locationData.length > 0) {
    const firstLocation = locationData[0];
    
    // Pre-fill country
    if (firstLocation.countryCode) {
      const countrySelect = document.getElementById("country");
      countrySelect.value = firstLocation.countryCode.toUpperCase();
      
      // Trigger the change event to show/hide state field
      const event = new Event('change');
      countrySelect.dispatchEvent(event);
      
      // Pre-fill state for US locations
      if (firstLocation.countryCode.toUpperCase() === "US" && firstLocation.stateCode) {
        setTimeout(() => {
          const stateSelect = document.getElementById("state");
          stateSelect.value = firstLocation.stateCode.toUpperCase();
        }, 100); // Small delay to ensure the states dropdown is populated
      }
    }
  }

  // Populate spot kind options based on type
  const spotKindSelect = document.getElementById("spot-kind");
  spotKindSelect.innerHTML = '<option value="">Select Kind</option>';

  if (type === "spot") {
    const spotTypes = [
      { value: "pump-foil-dock", label: "Pump Foil Dock" },
      { value: "wake-thief-spot", label: "Wake Thief Spot" },
      { value: "wave-wind-spot", label: "Wave & Wind Spot" },
      { value: "wind-spot", label: "Wind Spot" },
      { value: "wave-spot", label: "Wave Spot" },
      { value: "rental-station", label: "Rental Station" },
      { value: "shop", label: "Shop" },
      { value: "school", label: "School" },
      { value: "wake-boat", label: "Wake Boat" },
    ];

    spotTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.value;
      option.textContent = type.label;
      spotKindSelect.appendChild(option);
    });
  } else {
    const routeTypes = [
      { value: "downwind-run", label: "Downwind Run" },
      { value: "paddle-tour", label: "Paddle Tour" },
    ];

    routeTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.value;
      option.textContent = type.label;
      spotKindSelect.appendChild(option);
    });

    // Show distance field for routes
    document.getElementById("distance-container").classList.remove("hidden");

    // Calculate and set the estimated distance
    const distance = calculateTotalDistance(points).toFixed(1);
    document.getElementById("distance").value = distance;
  }

  // Show the modal
  document.getElementById("add-form-modal").classList.remove("hidden");
}

// Filter checkboxes change handler
document.querySelectorAll('input[name="spot-type"]').forEach((checkbox) => {
  checkbox.addEventListener("change", renderSpots)
})

// Initialize the map
document.addEventListener("DOMContentLoaded", () => {
  loadSpots()
})

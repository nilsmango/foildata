// DOM elements
const modal = document.getElementById("add-form-modal")
const closeModalBtn = document.getElementById("close-modal")
const spotForm = document.getElementById("spot-form")
const addInfoBtn = document.getElementById("add-info-btn")
const addVideoBtn = document.getElementById("add-video-btn")
const countrySelect = document.getElementById("country")
const stateSelect = document.getElementById("state")
const stateContainer = document.getElementById("state-container")
const otherCountryContainer = document.getElementById("other-country-container") || document.createElement("div")

// Add other country container if it doesn't exist
if (!document.getElementById("other-country-container")) {
  otherCountryContainer.id = "other-country-container"
  otherCountryContainer.className = "form-group hidden"
  otherCountryContainer.innerHTML = `
    <label for="other-country" class="required">Specify Country</label>
    <input type="text" id="other-country" name="other-country">
  `
  
  // Insert after country select
  countrySelect.parentNode.insertAdjacentElement('afterend', otherCountryContainer)
}

// Countries and US states data
const countries = [
  { code: "OTHER", name: "Other (Not Listed)" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "NO", name: "Norway" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "VE", name: "Venezuela" },
  { code: "RU", name: "Russia" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "PH", name: "Philippines" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "TN", name: "Tunisia" },
  { code: "KE", name: "Kenya" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  // Added more countries
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AM", name: "Armenia" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CV", name: "Cape Verde" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IL", name: "Israel" },
  { code: "JM", name: "Jamaica" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NP", name: "Nepal" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "KP", name: "North Korea" },
  { code: "MK", name: "North Macedonia" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PL", name: "Poland" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SZ", name: "Eswatini" },
  { code: "SY", name: "Syria" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
]

const usStates = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

// Get references to functions from map.js
// These will be properly defined when map.js loads
function getCancelAddMode() {
  return (
    window.cancelAddMode ||
    (() => {
      console.warn("cancelAddMode function not found")
    })
  )
}

function getLoadSpots() {
  return (
    window.loadSpots ||
    (() => {
      console.warn("loadSpots function not found")
    })
  )
}

// Initialize form
function initForm() {
  console.log("Initializing form...")

  // Check if elements exist
  if (!countrySelect) {
    console.error("Country select element not found!")
    return
  }

  // Clear existing options first
  countrySelect.innerHTML = '<option value="">Select Country</option>'

  // Populate countries dropdown
  console.log("Populating countries dropdown with", countries.length, "countries")
  countries
    .sort((a, b) => {
      // Keep "Other" at the top
      if (a.code === "OTHER") return -1
      if (b.code === "OTHER") return 1
      // Sort the rest alphabetically
      return a.name.localeCompare(b.name)
    })
    .forEach((country) => {
      const option = document.createElement("option")
      option.value = country.code
      option.textContent = country.name
      countrySelect.appendChild(option)
    })

  // Country change handler
  countrySelect.addEventListener("change", () => {
    if (countrySelect.value === "US") {
      populateStates()
      stateContainer.classList.remove("hidden")
      otherCountryContainer.classList.add("hidden")
    } else if (countrySelect.value === "OTHER") {
      stateContainer.classList.add("hidden")
      otherCountryContainer.classList.remove("hidden")
      document.getElementById("other-country").setAttribute("required", "required")
    } else {
      stateContainer.classList.add("hidden")
      otherCountryContainer.classList.add("hidden")
      document.getElementById("other-country").removeAttribute("required")
    }
  })

  // Check if close modal button exists
  if (!closeModalBtn) {
    console.error("Close modal button not found!")
  } else {
    // Close modal button
    closeModalBtn.addEventListener("click", () => {
      console.log("Close modal button clicked")
      if (modal) {
        modal.classList.add("hidden")
      } else {
        console.error("Modal element not found!")
      }
    })
  }

  // Add info button
  if (addInfoBtn) {
    addInfoBtn.addEventListener("click", addInfoSection)
  }

  // Add video button
  if (addVideoBtn) {
    addVideoBtn.addEventListener("click", addVideoSection)
  }

  // Form submit handler
  if (spotForm) {
    spotForm.addEventListener("submit", handleFormSubmit)
  }

  console.log("Form initialization complete")
}

// Populate states dropdown
function populateStates() {
  stateSelect.innerHTML = '<option value="">Select State</option>'

  usStates.forEach((state) => {
    const option = document.createElement("option")
    option.value = state.code
    option.textContent = state.name
    stateSelect.appendChild(option)
  })
}

// Add info section
function addInfoSection() {
  const infoSections = document.getElementById("info-sections")
  const newSection = document.createElement("div")
  newSection.className = "info-section"

  newSection.innerHTML = `
        <div class="info-header">
            <select class="info-tag" name="info-tag[]" required>
                <option value="">Select Tag</option>
                <option value="description">Description</option>
                <option value="wind-direction">Wind Direction</option>
                <option value="wind-measurements">Wind Measurements</option>
                <option value="wind-predictions">Wind Predictions</option>
                <option value="conditions">Conditions</option>
                <option value="logistics">Logistics</option>
                <option value="local-contact">Local Legends & Groups</option>
                <option value="local-contact">Local Rules</option>
            </select>
            <button type="button" class="remove-info-btn small-button">Remove</button>
        </div>
        <textarea class="info-text" name="info-text[]" rows="4" required></textarea>
        <div class="user-info">
            <label for="username" class="required">Your Name</label>
            <input type="text" class="username" name="username[]" required>
            <label for="user-url">Your URL (optional)</label>
            <input type="url" class="user-url" name="user-url[]">
        </div>
    `

  infoSections.appendChild(newSection)

  // Add remove button handler
  newSection.querySelector(".remove-info-btn").addEventListener("click", () => {
    infoSections.removeChild(newSection)
  })
}

// Add video section
function addVideoSection() {
  const videoSections = document.getElementById("video-sections")
  const newSection = document.createElement("div")
  newSection.className = "video-section"

  newSection.innerHTML = `
        <input type="url" class="video-url" name="video-url[]" placeholder="YouTube or Instagram URL">
        <button type="button" class="remove-video-btn small-button">Remove</button>
    `

  videoSections.appendChild(newSection)

  // Add remove button handler
  newSection.querySelector(".remove-video-btn").addEventListener("click", () => {
    videoSections.removeChild(newSection)
  })
}

// Handle form submit
async function handleFormSubmit(event) {
  event.preventDefault();

  // Get form data
  const formData = new FormData(spotForm);
  const formType = formData.get("form-type");
  const coordinates = JSON.parse(formData.get("coordinates"));
  
  async function createSpot() {
    const spotId = await generateSpotId(formData);
    
    const spot = {
      id: spotId,
      name: formData.get("name"),
      country: formData.get("country") === "OTHER" ? formData.get("other-country") : formData.get("country"),
      kind: formData.get("kind"),
      pending: true,
      locations: coordinates.map((coord) => ({ lat: coord[0], lng: coord[1] })),
    };
    
    return spot;
  }
  
  // Create spot object
  const spot = await createSpot();
  
  // Add state for US locations
  if (formData.get("country") === "US") {
    spot.state = formData.get("state");
  }

  // Add distance for routes
  if (formType === "route" && formData.get("distance")) {
    spot.distance = Number.parseFloat(formData.get("distance"));
  }

  // Process info sections
  const infoTags = formData.getAll("info-tag[]");
  const infoTexts = formData.getAll("info-text[]");
  const usernames = formData.getAll("username[]");
  const userUrls = formData.getAll("user-url[]");

  spot.infos = infoTags.map((tag, index) => ({
    id: generateId(spot.id),
    tag,
    text: infoTexts[index],
    date: new Date().toISOString(),
    userName: usernames[index],
    userUrl: userUrls[index] || null,
  }));

  // Process video sections
  const videoUrls = formData.getAll("video-url[]").filter((url) => url.trim() !== "");

  if (videoUrls.length > 0) {
    spot.videos = videoUrls.map((url) => ({
      url,
      kind: detectVideoType(url),
      date: new Date().toISOString(),
    }));
  }

  // Submit the spot
  try {
    await submitSpot(spot);

    // Close the modal
    if (modal) {
      modal.classList.add("hidden");
    }

    // Reset the form
    spotForm.reset();

    // Cancel add mode
    const cancelAddMode = getCancelAddMode();
    cancelAddMode();

    // Show success message
    alert("Spot submitted successfully! It will appear on the map (you might need to refresh the page), but will be reviewed before being added permanently.");

    // Reload spots
    const loadSpots = getLoadSpots();
    loadSpots();
  } catch (error) {
    console.error("Error submitting spot:", error);
    alert("Error submitting spot. Please try again.");
  }
}

// Generate a unique ID
function generateId(spotId) {
  let idPrefix = spotId;
  
  // If we couldn't generate a prefix, use a timestamp
  if (!idPrefix) {
    idPrefix = "spot";
  }
  
  // Add a timestamp and random string for uniqueness
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  
  return `${idPrefix}-${timestamp}-${randomStr}`;
}

// Generate a unique URL-safe ID based on user input
async function generateSpotId(formData) {
  // Get the spot name from form data, fall back to location data if empty
  let idBase = formData.get("name")?.trim();
  
  // If no name was provided, use location data as fallback
  if (!idBase) {
    const locationData = JSON.parse(sessionStorage.getItem("lastLocationData") || "[]");
    
    if (locationData.length === 1) {
      // Single location - use short name
      idBase = locationData[0].shortName || "spot";
    } else if (locationData.length > 1) {
      // Multiple locations - use first and last location names
      const firstLocation = locationData[0];
      const lastLocation = locationData[locationData.length - 1];
      
      if (firstLocation.shortName && lastLocation.shortName) {
        idBase = `${firstLocation.shortName}-to-${lastLocation.shortName}`;
      } else {
        idBase = "spot";
      }
    } else {
      idBase = "spot";
    }
  }
  
  // Replace German umlauts and special characters
  idBase = idBase
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Replace any other non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]/g, '-')
    // Replace multiple consecutive hyphens with a single one
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-|-$/g, '');
  
  // Get existing spots from spots.json
  let spots = [];
  try {
    const response = await fetch('./spots.json');
    if (response.ok) {
      spots = await response.json();
    }
  } catch (error) {
    console.error('Error loading spots.json:', error);
  }
  
  // Get all existing IDs
  const existingIds = spots.map(spot => spot.id);
  
  // Check if ID exists and add counter if needed
  let finalId = idBase;
  let counter = 2;
  
  while (existingIds.includes(finalId)) {
    finalId = `${idBase}-${counter}`;
    counter++;
  }
  
  return finalId;
}

// Detect video type from URL
function detectVideoType(url) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "YouTube"
  } else if (url.includes("instagram.com")) {
    return "Insta"
  } else {
    return "Other"
  }
}

// Submit spot to server
async function submitSpot(spot) {
  try {
    const response = await fetch("submit-spot.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(spot),
    })

    if (!response.ok) {
      throw new Error("Failed to submit spot")
    }

    return await response.json()
  } catch (error) {
    console.error("Error submitting spot:", error)
    throw error
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing form")
  initForm()
})
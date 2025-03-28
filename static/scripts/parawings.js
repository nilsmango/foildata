// Define the data structure
class ParawingsTable {
  constructor() {
    // Data
    this.parawings = []
    this.filteredParawings = []

    // Filter states
    this.searchTerm = ""
    this.brandFilter = []
    this.minArea = ""
    this.maxArea = ""
    this.minWeight = ""
    this.maxWeight = ""
    this.minPrice = ""
    this.maxPrice = ""
    this.doubleSkinFilter = null

    // Sorting state
    this.sortConfig = {
      key: null,
      direction: "asc",
    }

    // Column visibility
    this.visibleColumns = {
      name: true,
      brandName: true,
      website: true,
      areaSqM: true,
      wingSpan: true,
      linesLengthCm: true,
      aspectRatio: true,
      weightKg: true,
      doubleSkin: true,
      listPriceUSD: true,
    }

    // Column display names
    this.columnDisplayNames = {
      name: "Name",
      brandName: "Brand",
      website: "Website",
      areaSqM: "Area (m²)",
      wingSpan: "Wing Span",
      linesLengthCm: "Lines Length (cm)",
      aspectRatio: "Aspect Ratio",
      weightKg: "Weight (kg)",
      doubleSkin: "Double Skin",
      listPriceUSD: "Price (USD)",
    }

    // DOM elements
    this.elements = {
      table: document.getElementById("parawings-table"),
      tableHead: document.querySelector("#parawings-table thead tr"),
      tableBody: document.querySelector("#parawings-table tbody"),
      searchInput: document.getElementById("search-input"),
      columnToggleBtn: document.getElementById("column-toggle-btn"),
      columnDropdown: document.getElementById("column-dropdown"),
      brandFilters: document.getElementById("brand-filters"),
      minAreaInput: document.getElementById("min-area"),
      maxAreaInput: document.getElementById("max-area"),
      weightFilter: document.getElementById("weight-filter"),
      minWeightInput: document.getElementById("min-weight"),
      maxWeightInput: document.getElementById("max-weight"),
      priceFilter: document.getElementById("price-filter"),
      minPriceInput: document.getElementById("min-price"),
      maxPriceInput: document.getElementById("max-price"),
      doubleSkinFilter: document.getElementById("double-skin-filter"),
      doubleSkinBadges: document.querySelectorAll("#double-skin-filter .badge"),
      clearDoubleSkin: document.getElementById("clear-double-skin"),
      resultsText: document.getElementById("results-text"),
    }

    // Initialize
    this.init()
  }

  async init() {
    try {
      // Fetch data
      await this.fetchData()

      // Setup event listeners
      this.setupEventListeners()

      // Initialize UI
      this.initializeUI()

      // Apply initial filters and render
      this.applyFiltersAndSort()
    } catch (error) {
      console.error("Error initializing parawings table:", error)
      this.elements.resultsText.textContent = `Error: ${error.message}`
    }
  }

  async fetchData() {
    try {
      const response = await fetch("parawings.json")
      if (!response.ok) {
        throw new Error("Failed to fetch parawings data")
      }

      const data = await response.json()

      // Flatten the data structure
      this.parawings = data.flatMap((parawing, parawingIndex) =>
        parawing.sizes.map((size, sizeIndex) => ({
          id: `${parawing.name}-${sizeIndex}`,
          name: parawing.name,
          brandName: parawing.brandName,
          imageFilename: parawing.imageFilename,
          website: parawing.website,
          ...size,
        })),
      )

      this.filteredParawings = [...this.parawings]
    } catch (error) {
      throw new Error(`Failed to load parawings data: ${error.message}`)
    }
  }

  setupEventListeners() {
    // Search input
    this.elements.searchInput.addEventListener("input", () => {
      this.searchTerm = this.elements.searchInput.value
      this.applyFiltersAndSort()
    })

    // Column toggle dropdown
    this.elements.columnToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      this.elements.columnDropdown.classList.toggle("hidden")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.elements.columnToggleBtn.contains(e.target) && !this.elements.columnDropdown.contains(e.target)) {
        this.elements.columnDropdown.classList.add("hidden")
      }
    })

    // Area filter inputs
    this.elements.minAreaInput.addEventListener("input", () => {
      this.minArea = this.elements.minAreaInput.value
      this.applyFiltersAndSort()
    })

    this.elements.maxAreaInput.addEventListener("input", () => {
      this.maxArea = this.elements.maxAreaInput.value
      this.applyFiltersAndSort()
    })

    // Weight filter inputs
    this.elements.minWeightInput.addEventListener("input", () => {
      this.minWeight = this.elements.minWeightInput.value
      this.applyFiltersAndSort()
    })

    this.elements.maxWeightInput.addEventListener("input", () => {
      this.maxWeight = this.elements.maxWeightInput.value
      this.applyFiltersAndSort()
    })

    // Price filter inputs
    this.elements.minPriceInput.addEventListener("input", () => {
      this.minPrice = this.elements.minPriceInput.value
      this.applyFiltersAndSort()
    })

    this.elements.maxPriceInput.addEventListener("input", () => {
      this.maxPrice = this.elements.maxPriceInput.value
      this.applyFiltersAndSort()
    })

    // Double skin filter badges
    this.elements.doubleSkinBadges.forEach((badge) => {
      badge.addEventListener("click", () => {
        const value = badge.dataset.value === "true"

        if (this.doubleSkinFilter === value) {
          // If already selected, clear the filter
          this.doubleSkinFilter = null
          this.elements.clearDoubleSkin.classList.add("hidden")
        } else {
          // Otherwise, set the filter
          this.doubleSkinFilter = value
          this.elements.clearDoubleSkin.classList.remove("hidden")
        }

        this.updateDoubleSkinBadges()
        this.applyFiltersAndSort()
      })
    })

    // Clear double skin filter
    this.elements.clearDoubleSkin.addEventListener("click", () => {
      this.doubleSkinFilter = null
      this.elements.clearDoubleSkin.classList.add("hidden")
      this.updateDoubleSkinBadges()
      this.applyFiltersAndSort()
    })
  }

  initializeUI() {
    // Create table headers
    this.createTableHeaders()

    // Create column visibility checkboxes
    this.createColumnVisibilityCheckboxes()

    // Create brand filters
    this.createBrandFilters()

    // Show/hide conditional filters
    this.updateConditionalFilters()
  }

  createTableHeaders() {
    this.elements.tableHead.innerHTML = ""

    Object.keys(this.visibleColumns).forEach((column) => {
      if (this.visibleColumns[column]) {
        const th = document.createElement("th")

        if (column !== "website") {
          th.addEventListener("click", () => this.requestSort(column))

          const headerContent = document.createElement("div")
          headerContent.className = "header-content"
          headerContent.style.display = "flex"
          headerContent.style.alignItems = "center"

          const headerText = document.createElement("span")
          headerText.textContent = this.columnDisplayNames[column]
          headerContent.appendChild(headerText)

          if (this.sortConfig.key === column) {
            const sortIcon = document.createElement("span")
            sortIcon.className = "sort-icon"
            sortIcon.innerHTML =
              this.sortConfig.direction === "asc"
                ? "&#9650;" // Up arrow
                : "&#9660;" // Down arrow
            headerContent.appendChild(sortIcon)
          }

          th.appendChild(headerContent)
        } else {
          th.textContent = this.columnDisplayNames[column]
        }

        this.elements.tableHead.appendChild(th)
      }
    })
  }

  createColumnVisibilityCheckboxes() {
    this.elements.columnDropdown.innerHTML = ""

    Object.keys(this.visibleColumns).forEach((column) => {
      const item = document.createElement("div")
      item.className = "table-dropdown-item"

      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.checked = this.visibleColumns[column]
      checkbox.addEventListener("change", () => {
        this.visibleColumns[column] = checkbox.checked
        this.createTableHeaders()
        this.renderTable()
      })

      const label = document.createElement("label")
      label.textContent = this.columnDisplayNames[column]

      item.appendChild(checkbox)
      item.appendChild(label)
      this.elements.columnDropdown.appendChild(item)
    })
  }

  createBrandFilters() {
    this.elements.brandFilters.innerHTML = ""

    // Get unique brands
    const uniqueBrands = [...new Set(this.parawings.map((item) => item.brandName))]

    uniqueBrands.forEach((brand) => {
      const badge = document.createElement("span")
      badge.className = "badge badge-outline"
      badge.textContent = brand
      badge.addEventListener("click", () => {
        this.toggleBrandFilter(brand)
        this.applyFiltersAndSort()
      })

      this.elements.brandFilters.appendChild(badge)
    })
  }

  updateBrandBadges() {
    const badges = this.elements.brandFilters.querySelectorAll(".badge")

    badges.forEach((badge) => {
      const brand = badge.textContent
      if (this.brandFilter.includes(brand)) {
        badge.classList.add("active")
      } else {
        badge.classList.remove("active")
      }
    })
  }

  updateDoubleSkinBadges() {
    const yesBadge = this.elements.doubleSkinFilter.querySelector('[data-value="true"]')
    const noBadge = this.elements.doubleSkinFilter.querySelector('[data-value="false"]')

    yesBadge.classList.toggle("active", this.doubleSkinFilter === true)
    noBadge.classList.toggle("active", this.doubleSkinFilter === false)
  }

  updateConditionalFilters() {
    // Check if we have weight values
    const hasWeightValues = this.parawings.some((item) => item.weightKg !== null)
    this.elements.weightFilter.classList.toggle("hidden", !hasWeightValues)

    // Check if we have price values
    const hasPriceValues = this.parawings.some((item) => item.listPriceUSD !== null)
    this.elements.priceFilter.classList.toggle("hidden", !hasPriceValues)

    // Check if we have double skin variety
    const hasDoubleSkinVariety = new Set(this.parawings.map((item) => item.doubleSkin)).size > 1
    this.elements.doubleSkinFilter.classList.toggle("hidden", !hasDoubleSkinVariety)
  }

  toggleBrandFilter(brand) {
    if (this.brandFilter.includes(brand)) {
      this.brandFilter = this.brandFilter.filter((b) => b !== brand)
    } else {
      this.brandFilter.push(brand)
    }

    this.updateBrandBadges()
  }

  requestSort(key) {
    let direction = "asc"
    if (this.sortConfig.key === key && this.sortConfig.direction === "asc") {
      direction = "desc"
    }

    this.sortConfig = { key, direction }
    this.applyFiltersAndSort()
  }

  applyFiltersAndSort() {
    let result = [...this.parawings]

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(term) || item.brandName.toLowerCase().includes(term),
      )
    }

    // Apply brand filter
    if (this.brandFilter.length > 0) {
      result = result.filter((item) => this.brandFilter.includes(item.brandName))
    }

    // Apply area range filter
    if (this.minArea !== "") {
      result = result.filter((item) => item.areaSqM >= Number(this.minArea))
    }

    if (this.maxArea !== "") {
      result = result.filter((item) => item.areaSqM <= Number(this.maxArea))
    }

    // Apply weight range filter
    if (this.minWeight !== "") {
      result = result.filter((item) => item.weightKg !== null && item.weightKg >= Number(this.minWeight))
    }

    if (this.maxWeight !== "") {
      result = result.filter((item) => item.weightKg !== null && item.weightKg <= Number(this.maxWeight))
    }

    // Apply price range filter
    if (this.minPrice !== "") {
      result = result.filter((item) => item.listPriceUSD !== null && item.listPriceUSD >= Number(this.minPrice))
    }

    if (this.maxPrice !== "") {
      result = result.filter((item) => item.listPriceUSD !== null && item.listPriceUSD <= Number(this.maxPrice))
    }

    // Apply double skin filter
    if (this.doubleSkinFilter !== null) {
      result = result.filter((item) => item.doubleSkin === this.doubleSkinFilter)
    }

    // Apply sorting
    if (this.sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[this.sortConfig.key]
        const bValue = b[this.sortConfig.key]

        if (aValue === null && bValue === null) return 0
        if (aValue === null) return 1
        if (bValue === null) return -1

        if (typeof aValue === "string" && typeof bValue === "string") {
          return this.sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return this.sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return this.sortConfig.direction === "asc"
            ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
            : (bValue ? 1 : 0) - (aValue ? 1 : 0)
        }

        return 0
      })
    }

    this.filteredParawings = result
    this.renderTable()
    this.updateResultsCount()
  }

  renderTable() {
    this.elements.tableBody.innerHTML = ""

    if (this.filteredParawings.length === 0) {
      const row = document.createElement("tr")
      const cell = document.createElement("td")

      const visibleColumnsCount = Object.values(this.visibleColumns).filter(Boolean).length
      cell.setAttribute("colspan", visibleColumnsCount)
      cell.className = "empty-message"
      cell.textContent = "No parawings found matching your criteria"
      cell.style.textAlign = "center"
      cell.style.padding = "2rem"

      row.appendChild(cell)
      this.elements.tableBody.appendChild(row)
      return
    }

    this.filteredParawings.forEach((parawing) => {
      const row = document.createElement("tr")

      Object.keys(this.visibleColumns).forEach((column) => {
        if (this.visibleColumns[column]) {
          const cell = document.createElement("td")

          if (column === "name") {
            cell.className = "font-medium"
            cell.textContent = parawing.name
          } else if (column === "doubleSkin") {
            cell.textContent = parawing.doubleSkin ? "Yes" : "No"
          } else if (column === "listPriceUSD") {
            cell.textContent = parawing.listPriceUSD ? `$${parawing.listPriceUSD}` : "-"
          } else if (column === "website") {
            if (parawing.website) {
              const link = document.createElement("a")
              link.href = parawing.website
              link.target = "_blank"
              link.rel = "noopener noreferrer"
              link.textContent = "Visit"
              cell.appendChild(link)
            } else {
              cell.textContent = "-"
            }
          } else {
            cell.textContent = parawing[column] !== null ? parawing[column] : "-"
          }

          row.appendChild(cell)
        }
      })

      this.elements.tableBody.appendChild(row)
    })
  }

  updateResultsCount() {
    this.elements.resultsText.textContent = `Showing ${this.filteredParawings.length} of ${this.parawings.length} parawings`
  }
}

// Initialize the parawings table when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ParawingsTable()
})


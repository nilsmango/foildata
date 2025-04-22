// Function to add a new size section
function addSizeSection(sizeData = null) {
  const container = document.getElementById("sizes-container");
  const template = document.getElementById("size-template");
  const newSize = template.content.cloneNode(true);

  // Add remove button functionality
  const removeButton = newSize.querySelector(".remove-size");
  removeButton.addEventListener("click", function () {
    this.closest(".size-section").remove();
  });

  // If we have size data, populate the fields
  if (sizeData) {
    const inputs = newSize.querySelectorAll("input, select");
    inputs.forEach((input) => {
      const name = input.name.replace("[]", "");
      if (sizeData[name] !== null && sizeData[name] !== undefined) {
        if (input.type === "select-one") {
          input.value = sizeData[name].toString();
        } else {
          input.value = sizeData[name];
        }
      }
    });
  }

  container.appendChild(newSize);
}

// Function to get URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    brand: params.get("brand"),
    parawing: params.get("parawing"),
  };
}

// Function to load parawing data
async function loadParawingData() {
  const params = getUrlParams();
  if (!params.brand || !params.parawing) {
    alert("Missing required parameters");
    window.location.href = "parawings.html";
    return;
  }

  try {
    const response = await fetch("parawings.json");
    const parawings = await response.json();

    const parawing = parawings.find(
      (p) =>
        p.brandName.toLowerCase() === params.brand.toLowerCase() &&
        p.name.toLowerCase() === params.parawing.toLowerCase(),
    );

    if (!parawing) {
      alert("Parawing not found");
      window.location.href = "parawings.html";
      return;
    }

    // Populate the form with existing data
    document.getElementById("original-parawing-name").value = parawing.name;
    document.getElementById("original-brand-name").value = parawing.brandName;
    document.getElementById("brand-name").value = parawing.brandName;
    document.getElementById("parawing-name").value = parawing.name;

    if (parawing.discontinued) {
      document.getElementById("discontinued").checked = true;
    }

    if (parawing.website) {
      document.getElementById("website").value = parawing.website;
    }

    if (parawing.imageFilename) {
      document.getElementById("current-image-name").textContent =
        parawing.imageFilename;
    } else {
      document.getElementById("current-image-container").style.display = "none";
    }

    // Clear existing sizes
    document.getElementById("sizes-container").innerHTML = "";

    // Add size sections for each existing size
    parawing.sizes.forEach((size) => {
      addSizeSection(size);
    });

    // Set the back link to return to the parawing details page
    document.getElementById("back-link").href =
      `brands/${parawing.brandName.replace(/\s+/g, "-").toLowerCase()}/parawings/${parawing.name.replace(/\s+/g, "-").toLowerCase()}.html`;
  } catch (error) {
    console.error("Failed to load parawing data:", error);
    alert("Unable to load parawing data. Please try again later.");
  }
}

// Initialize the form when the page loads
document.addEventListener("DOMContentLoaded", async function () {
  await loadParawingData();

  // Add size button functionality
  document
    .getElementById("add-size")
    .addEventListener("click", () => addSizeSection());

  // Form submission handler
  document
    .getElementById("edit-parawing-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      const originalParawingName = formData.get("originalParawingName");
      const originalBrandName = formData.get("originalBrandName");
      const newParawingName = formData.get("parawing");
      const brandName = formData.get("brand");

      // Check if name was changed and already exists
      if (originalParawingName !== newParawingName) {
        try {
          const response = await fetch("parawings.json");
          const parawings = await response.json();

          const nameExists = parawings.some(
            (p) =>
              p.brandName.toLowerCase() === brandName.toLowerCase() &&
              p.name.toLowerCase() === newParawingName.toLowerCase() &&
              !(
                p.brandName.toLowerCase() === originalBrandName.toLowerCase() &&
                p.name.toLowerCase() === originalParawingName.toLowerCase()
              ),
          );

          if (nameExists) {
            const errorElement = document.getElementById("parawing-name-error");
            errorElement.textContent =
              "This parawing name already exists for this brand. Please choose a different name.";
            errorElement.style.display = "block";
            return;
          }
        } catch (error) {
          console.error("Failed to check parawing names:", error);
        }
      }

      // Create data object from form
      const sizeSections = document.querySelectorAll(".size-section");
      const sizes = Array.from(sizeSections).map((section) => {
        const sizeData = {};
        section.querySelectorAll("input, select").forEach((input) => {
          const name = input.name.replace("[]", "");
          if (input.value.trim() === "") {
            sizeData[name] = null;
          } else if (input.type === "number") {
            sizeData[name] = parseFloat(input.value);
          } else if (input.name.includes("doubleSkin")) {
            sizeData[name] = input.value === "true";
          } else {
            sizeData[name] = input.value;
          }
        });
        return sizeData;
      });

      const editData = {
        originalParawingName: originalParawingName,
        originalBrandName: originalBrandName,
        parawingName: newParawingName,
        brandName: brandName,
        discontinued: document.getElementById("discontinued").checked,
        website: document.getElementById("website").value || null,
        sizes: sizes,
        // We don't modify videos or reviews
        timestamp: new Date().toISOString(),
      };

      // Handle image if provided
      const imageFile = document.getElementById("parawing-image").files[0];
      if (imageFile) {
        editData.newImage = imageFile.name;
        // Create FormData object to send the file
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        // Send file to server using fetch API
        fetch("upload-image.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              console.log("Upload successful:", data.message);
            } else {
              console.error("Upload failed:", data.message);
              // You might want to handle the error here (show a message, etc.)
            }
          })
          .catch((error) => {
            console.error("Error during upload:", error);
          });
      } else {
        // Keep the existing image
        editData.newImage =
          document.getElementById("current-image-name").textContent || null;
      }

      try {
        // Save edits to parawing-edits.json
        const response = await fetch("submit-parawing-edit.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        });

        if (response.ok) {
          alert("Parawing edits submitted for review!");
          // Redirect back to parawing details page
          window.location.href = `parawings.html`;
        } else {
          const result = await response.json();
          alert(result.error || "Failed to submit edits");
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("Failed to submit parawing edits");
      }
    });
});

// Get the input element by its ID
const priceInput = document.getElementById("list-price-input");

// Add an event listener that triggers when the input field loses focus ('blur')
priceInput.addEventListener("blur", function () {
  let value = this.value;

  // Find the index of the last comma (in case of thousands separators, though unlikely in type="number")
  const lastCommaIndex = value.lastIndexOf(",");

  // Proceed only if a comma is found
  if (lastCommaIndex !== -1) {
    // Get the part of the string after the last comma
    const decimalPart = value.substring(lastCommaIndex + 1);

    // Regular expression to check if the decimal part consists ONLY of digits
    const digitsOnlyRegex = /^\d+$/;
    // Check if the decimal part has 3 or more digits AND contains only digits
    if (decimalPart.length >= 3 && digitsOnlyRegex.test(decimalPart)) {
      // If yes, truncate the decimal part to the first 2 digits
      const truncatedDecimal = decimalPart.substring(0, 2);
      // Reconstruct the value with the truncated decimal part
      const newValue =
        value.substring(0, lastCommaIndex + 1) + truncatedDecimal;
      // Update the input field's value
      this.value = newValue;
      // Optional: You could add feedback here, e.g., console.log or an alert
      // console.log('Input automatically formatted to two decimal places.');
    }
  }
  // Optional: Add similar logic for periods (.) if needed, as type="number" often uses periods
  const lastPeriodIndex = value.lastIndexOf(".");
  if (lastPeriodIndex !== -1) {
    const decimalPart = value.substring(lastPeriodIndex + 1);
    const digitsOnlyRegex = /^\d+$/;
    if (decimalPart.length >= 3 && digitsOnlyRegex.test(decimalPart)) {
      const truncatedDecimal = decimalPart.substring(0, 2);
      const newValue =
        value.substring(0, lastPeriodIndex + 1) + truncatedDecimal;
      this.value = newValue;
    }
  }
});

// Function to add a new size section
function addSizeSection(sizeData = null) {
  const container = document.getElementById("sizes-container");
  const template = document.getElementById("size-template");
  const newSize = template.content.cloneNode(true);

  // Add remove button functionality
  const removeButton = newSize.querySelector(".remove-size");
  removeButton.addEventListener("click", function () {
    this.closest(".size-section").remove();
  });

  // If we have size data, populate the fields
  if (sizeData) {
    const inputs = newSize.querySelectorAll("input, select");
    inputs.forEach((input) => {
      const name = input.name.replace("[]", "");
      if (sizeData[name] !== null && sizeData[name] !== undefined) {
        if (input.type === "select-one") {
          input.value = sizeData[name].toString();
        } else {
          input.value = sizeData[name];
        }
      }
    });
  }

  container.appendChild(newSize);
}

// Function to get URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    brand: params.get("brand"),
    parawing: params.get("parawing"),
  };
}

// Function to load parawing data
async function loadParawingData() {
  const params = getUrlParams();
  if (!params.brand || !params.parawing) {
    alert("Missing required parameters");
    window.location.href = "parawings.html";
    return;
  }

  try {
    const response = await fetch("parawings.json");
    const parawings = await response.json();

    const parawing = parawings.find(
      (p) =>
        p.brandName.toLowerCase() === params.brand.toLowerCase() &&
        p.name.toLowerCase() === params.parawing.toLowerCase(),
    );

    if (!parawing) {
      alert("Parawing not found");
      window.location.href = "parawings.html";
      return;
    }

    // Populate the form with existing data
    document.getElementById("original-parawing-name").value = parawing.name;
    document.getElementById("original-brand-name").value = parawing.brandName;
    document.getElementById("brand-name").value = parawing.brandName;
    document.getElementById("parawing-name").value = parawing.name;

    if (parawing.discontinued) {
      document.getElementById("discontinued").checked = true;
    }

    if (parawing.website) {
      document.getElementById("website").value = parawing.website;
    }

    if (parawing.imageFilename) {
      document.getElementById("current-image-name").textContent =
        parawing.imageFilename;
    } else {
      document.getElementById("current-image-container").style.display = "none";
    }

    // Clear existing sizes
    document.getElementById("sizes-container").innerHTML = "";

    // Add size sections for each existing size
    parawing.sizes.forEach((size) => {
      addSizeSection(size);
    });

    // Set the back link to return to the parawing details page
    document.getElementById("back-link").href =
      `brands/${parawing.brandName.replace(/\s+/g, "-").toLowerCase()}/parawings/${parawing.name.replace(/\s+/g, "-").toLowerCase()}.html`;
  } catch (error) {
    console.error("Failed to load parawing data:", error);
    alert("Unable to load parawing data. Please try again later.");
  }
}

// Initialize the form when the page loads
document.addEventListener("DOMContentLoaded", async function () {
  await loadParawingData();

  // Add size button functionality
  document
    .getElementById("add-size")
    .addEventListener("click", () => addSizeSection());

  // Form submission handler
  document
    .getElementById("edit-parawing-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      const originalParawingName = formData.get("originalParawingName");
      const originalBrandName = formData.get("originalBrandName");
      const newParawingName = formData.get("parawing");
      const brandName = formData.get("brand");

      // Check if name was changed and already exists
      if (originalParawingName !== newParawingName) {
        try {
          const response = await fetch("parawings.json");
          const parawings = await response.json();

          const nameExists = parawings.some(
            (p) =>
              p.brandName.toLowerCase() === brandName.toLowerCase() &&
              p.name.toLowerCase() === newParawingName.toLowerCase() &&
              !(
                p.brandName.toLowerCase() === originalBrandName.toLowerCase() &&
                p.name.toLowerCase() === originalParawingName.toLowerCase()
              ),
          );

          if (nameExists) {
            const errorElement = document.getElementById("parawing-name-error");
            errorElement.textContent =
              "This parawing name already exists for this brand. Please choose a different name.";
            errorElement.style.display = "block";
            return;
          }
        } catch (error) {
          console.error("Failed to check parawing names:", error);
        }
      }

      // Create data object from form
      const sizeSections = document.querySelectorAll(".size-section");
      const sizes = Array.from(sizeSections).map((section) => {
        const sizeData = {};
        section.querySelectorAll("input, select").forEach((input) => {
          const name = input.name.replace("[]", "");
          if (input.value.trim() === "") {
            sizeData[name] = null;
          } else if (input.type === "number") {
            sizeData[name] = parseFloat(input.value);
          } else if (input.name.includes("doubleSkin")) {
            sizeData[name] = input.value === "true";
          } else {
            sizeData[name] = input.value;
          }
        });
        return sizeData;
      });

      const editData = {
        originalParawingName: originalParawingName,
        originalBrandName: originalBrandName,
        parawingName: newParawingName,
        brandName: brandName,
        discontinued: document.getElementById("discontinued").checked,
        website: document.getElementById("website").value || null,
        sizes: sizes,
        // We don't modify videos or reviews
        timestamp: new Date().toISOString(),
      };

      // Handle image if provided
      const imageFile = document.getElementById("parawing-image").files[0];
      if (imageFile) {
        editData.newImage = imageFile.name;
        // Create FormData object to send the file
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        // Send file to server using fetch API
        fetch("upload-image.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              console.log("Upload successful:", data.message);
            } else {
              console.error("Upload failed:", data.message);
              // You might want to handle the error here (show a message, etc.)
            }
          })
          .catch((error) => {
            console.error("Error during upload:", error);
          });
      } else {
        // Keep the existing image
        editData.newImage =
          document.getElementById("current-image-name").textContent || null;
      }

      try {
        // Save edits to parawing-edits.json
        const response = await fetch("submit-parawing-edit.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        });

        if (response.ok) {
          alert("Parawing edits submitted for review!");
          // Redirect back to parawing details page
          window.location.href = `parawings.html`;
        } else {
          const result = await response.json();
          alert(result.error || "Failed to submit edits");
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("Failed to submit parawing edits");
      }
    });
});



// Function to add a new size section
function addSizeSection() {
    const container = document.getElementById('sizes-container');
    const template = document.getElementById('size-template');
    const newSize = template.content.cloneNode(true);
    
    // Add remove button functionality
    const removeButton = newSize.querySelector('.remove-size');
    removeButton.addEventListener('click', function() {
        this.closest('.size-section').remove();
    });
    
    container.prepend(newSize);
}

// Function to fetch existing brands and set up form functionality
async function initializeParawingForm() {
    // Add initial size section
    addSizeSection();

    // Store existing parawings data
    let existingParawings = [];

    try {
        // Fetch existing brands from brands.json
        const brandsResponse = await fetch('brands.json');
        const brands = await brandsResponse.json();
        
        // Create a Set of existing brand names (normalized)
        const existingBrands = new Set(
            brands.map(brand => brand.name.toLowerCase().replace(/\s/g, ''))
        );
        
        // Fetch existing parawings from parawings.json
        const parawingsResponse = await fetch('parawings.json');
        existingParawings = await parawingsResponse.json();

        const brandInput = document.getElementById('brand-name');
        const parawingInput = document.getElementById('parawing-name');
        const brandDropdown = document.getElementById('brand-dropdown');
        
        // Create error message element for parawing name
        const parawingInputParent = parawingInput.parentElement;
        const errorMessageElement = document.createElement('div');
        errorMessageElement.className = 'error-message';
        errorMessageElement.style.color = 'red';
        errorMessageElement.style.fontSize = '0.8rem';
        errorMessageElement.style.marginTop = '5px';
        errorMessageElement.style.display = 'none';
        parawingInputParent.appendChild(errorMessageElement);
        
        // Add size button functionality
        document.getElementById('add-size').addEventListener('click', addSizeSection);
        
        // Brand name input event listener for filtering and dropdown
        brandInput.addEventListener('input', function() {
            const inputValue = this.value.toLowerCase();
            
            // Filter brands based on input
            const filteredBrands = brands.filter(brand => 
                brand.name.toLowerCase().includes(inputValue)
            );
            
            // Clear previous dropdown content
            brandDropdown.innerHTML = '';
            
            // Populate dropdown
            filteredBrands.forEach(brand => {
                const div = document.createElement('div');
                div.textContent = brand.name;
                div.addEventListener('click', () => {
                    brandInput.value = brand.name;
                    brandDropdown.classList.remove('show');
                    validateParawingName(); // Check for duplicates when brand is selected
                });
                brandDropdown.appendChild(div);
            });
            
            // Show/hide dropdown
            brandDropdown.classList.toggle('show', filteredBrands.length > 0);
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!brandInput.contains(event.target) && !brandDropdown.contains(event.target)) {
                brandDropdown.classList.remove('show');
            }
        });

        // Function to check if parawing name already exists for the selected brand
        function validateParawingName() {
            const brandName = brandInput.value.trim();
            const parawingName = parawingInput.value.trim();
            
            if (brandName && parawingName) {
                const isDuplicate = existingParawings.some(parawing => 
                    parawing.brandName.toLowerCase() === brandName.toLowerCase() && 
                    parawing.name.toLowerCase() === parawingName.toLowerCase()
                );
                
                if (isDuplicate) {
                    parawingInput.setCustomValidity('A parawing with this name already exists for this brand.');
                    parawingInput.classList.add('error');
                    errorMessageElement.textContent = 'This parawing name already exists for this brand. Please edit the existing one or choose a different name.';
                    errorMessageElement.style.display = 'block';
                } else {
                    parawingInput.setCustomValidity('');
                    parawingInput.classList.remove('error');
                    errorMessageElement.style.display = 'none';
                }
            } else {
                // Clear error state if fields are empty
                parawingInput.setCustomValidity('');
                parawingInput.classList.remove('error');
                errorMessageElement.style.display = 'none';
            }
        }

        // Add event listeners to check for duplicate parawing names
        parawingInput.addEventListener('input', validateParawingName);
        brandInput.addEventListener('change', validateParawingName);
        
        // Form submission handler
        document.getElementById('parawing-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Validate parawing name before submission
            validateParawingName();
            
            // Check if the form is valid (including our custom validation)
            if (!this.checkValidity()) {
                // If the form has validation errors, show them and stop submission
                this.reportValidity();
                return;
            }

            const inputName = brandInput.value.toLowerCase().replace(/\s/g, '');
            const formData = new FormData(this);
            
            try {
                // Post to submit-parawing.php
                const parawingResponse = await fetch('submit-parawing.php', {
                    method: 'POST',
                    body: formData
                });
                
                // If brand does not exist, also post to submit-brand.php
                if (!existingBrands.has(inputName)) {
                    const brandFormData = new FormData();
                    brandFormData.append('name', brandInput.value);
                    
                    await fetch('submit-brand.php', {
                        method: 'POST',
                        body: brandFormData
                    });
                }
                
                const result = await parawingResponse.json();
                if (parawingResponse.ok) {
                    alert('Parawing added successfully!');
                    this.reset();
                    window.location.href = 'parawings.html';
                } else {
                    alert(result.error || 'Failed to add parawing');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Failed to submit parawing');
            }
        });
    } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Unable to load existing data. Please try again later.');
    }
}

// Initialize the form when the page loads
document.addEventListener('DOMContentLoaded', initializeParawingForm);
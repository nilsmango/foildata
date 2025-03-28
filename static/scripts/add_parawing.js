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
    
    container.appendChild(newSize);
}

// Function to fetch existing brands and set up form functionality
async function initializeParawingForm() {
    // Add initial size section
    addSizeSection();

    try {
        // Fetch existing brands from brands.json
        const response = await fetch('brands.json');
        const brands = await response.json();
        
        // Create a Set of existing brand names (normalized)
        const existingBrands = new Set(
            brands.map(brand => brand.name.toLowerCase().replace(/\s/g, ''))
        );
        
        const brandInput = document.getElementById('brand-name');
        const brandDropdown = document.getElementById('brand-dropdown');
        
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
        
        // Form submission handler
        document.getElementById('parawing-form').addEventListener('submit', async function(event) {
            event.preventDefault();
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
        console.error('Failed to fetch brands:', error);
        alert('Unable to load existing brands. Please try again later.');
    }
}

// Initialize the form when the page loads
document.addEventListener('DOMContentLoaded', initializeParawingForm);
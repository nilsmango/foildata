// Function to fetch existing brands and set up form validation
async function initializeBrandForm() {
    try {
        // Fetch existing brands from brands.json
        const response = await fetch('brands.json');
        const brands = await response.json();
        
        // Create a Set of existing brand names (normalized)
        const existingBrands = new Set(
            brands.map(brand => brand.name.toLowerCase().replace(/\s/g, ''))
        );

        // Form submission handler (no longer prevents submission)
        document.getElementById('brand-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            const inputName = document.getElementById('brand-name').value.toLowerCase().replace(/\s/g, '');
            const nameWarning = document.getElementById('name-warning');
            
            // Show warning if brand exists, but allow submission
            if (existingBrands.has(inputName)) {
                nameWarning.style.display = 'block';
            } else {
                nameWarning.style.display = 'none';
            }
            
            const formData = new FormData(this);
            try {
                const response = await fetch('submit-brand.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (response.ok) {
                    alert('Brand added successfully!');
                    this.reset();
                    // Optionally redirect or update page
                    window.location.href = 'brands';
                } else {
                    alert(result.error || 'Failed to add brand');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Failed to submit brand');
            }
        });

        // Live duplicate brand name checking
        document.getElementById('brand-name').addEventListener('input', function() {
            const inputName = this.value.toLowerCase().replace(/\s/g, '');
            const nameWarning = document.getElementById('name-warning');
            
            if (existingBrands.has(inputName)) {
                nameWarning.style.display = 'block';
            } else {
                nameWarning.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Failed to fetch brands:', error);
        alert('Unable to load existing brands. Please try again later.');
        // Optionally redirect or update page
        window.location.href = 'brands';
    }
}

// Initialize the form when the page loads
document.addEventListener('DOMContentLoaded', initializeBrandForm);
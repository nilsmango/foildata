document.addEventListener('DOMContentLoaded', function() {
  const reviewBtn = document.getElementById('add-review-btn');
  const formContainer = document.getElementById('review-form-container');
  const form = document.getElementById('review-form');
  const productReviews = document.querySelector('.product-reviews');
  
  // Set the hidden fields with the data attributes from the product-reviews div
  document.getElementById('brandName').value = productReviews.dataset.brand;
  document.getElementById('productName').value = productReviews.dataset.product;
  
  // Show the form when the button is clicked
  reviewBtn.addEventListener('click', function() {
    reviewBtn.style.display = 'none';
    formContainer.style.display = 'block';
  });
  
  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    
    fetch('__PREFIX__/submit-review.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show success message
        alert('Review submitted successfully!');
        
        // Hide the form and show the button again
        formContainer.style.display = 'none';
        reviewBtn.style.display = 'inline-block';
        
        // Optionally, refresh the page to show the new review
        location.reload();
      } else {
        alert('Error submitting review: ' + data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while submitting your review.');
    });
  });
});
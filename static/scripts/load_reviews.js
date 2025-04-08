// Function to load and display dynamic reviews
async function loadDynamicReviews() {
  try {
    // Fetch the JSON data
    const jsonFile = "__JSON_FILE__";
    const response = await fetch(jsonFile);
    if (!response.ok) {
      throw new Error('Failed to load product data');
    }
    const parawings = await response.json();
    
    // Get the current page's product information
    const reviewsContainer = document.querySelector('.product-reviews');
    if (!reviewsContainer) return;
    
    const brandName = reviewsContainer.getAttribute('data-brand');
    const productName = reviewsContainer.getAttribute('data-product');
    
    // Find the matching parawing
    const parawing = parawings.find(p => p.brandName === brandName && p.name === productName);
    if (!parawing || !parawing.reviews) return;
    
    // Get the dynamic reviews container
    const dynamicReviewsContainer = document.getElementById('dynamic-reviews');
    if (!dynamicReviewsContainer) return;
    
    // Sort reviews by date, newest first
    const sortedReviews = parawing.reviews.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Calculate the total number of reviews (both static and dynamic)
    const staticReviewsCount = document.querySelectorAll('.review-container .review').length;
    const totalReviewsCount = staticReviewsCount + sortedReviews.length;
    
    // Calculate the average rating
    let totalStars = 0;
    
    // Count stars from dynamic reviews
    sortedReviews.forEach(review => {
      totalStars += review.stars;
    });
    
    // Count stars from static reviews
    document.querySelectorAll('.review-container .review').forEach(reviewElement => {
      const starsElement = reviewElement.querySelector('.stars');
      if (starsElement) {
        const rating = parseFloat(getComputedStyle(starsElement).getPropertyValue('--rating'));
        if (!isNaN(rating)) {
          totalStars += rating;
        }
      }
    });
    
    const averageRating = totalReviewsCount > 0 ? totalStars / totalReviewsCount : 0;
    
    // Update the rating text and stars
    const ratingTextElement = document.querySelector('.rating-text');
    const starsElement = document.querySelector('.rating-link .stars');
    const reviewCountElement = document.querySelector('.review-count');
    
    if (ratingTextElement) {
      ratingTextElement.textContent = averageRating.toFixed(1);
    }
    
    if (starsElement) {
      starsElement.style.setProperty('--rating', averageRating);
    }
    
    if (reviewCountElement) {
      reviewCountElement.textContent = `(${totalReviewsCount})`;
    }
    
    // Generate HTML for each review
    let reviewsHTML = '';
    
    sortedReviews.forEach(review => {
      // Format the date
      const formattedDate = formatReviewDate(review.date);
      
      // Create stars string
      const stars = `<div class="stars small" style="--rating: ${review.stars};"></div>`;
      
      // Website link
      const websiteLinkStart = review.website ? 
        `<a href="${review.website}" class="user-website" target="_blank">` : 
        '';
      const websiteLinkEnd = review.website ? '</a>' : '';
      
      // Format text with line breaks
      const textHTML = review.text.replace(/\n/g, '<br>');
      
      reviewsHTML += `
        <div class="review" data-user="${review.userName}">
          <div class="review-header">
            <p>${websiteLinkStart}<span class="user-name">${review.userName}</span>${websiteLinkEnd}</p>
            <p>${stars}</p>
            <div class="review-date">${formattedDate}</div>
          </div>
          <p class="review-text">${textHTML}</p>
        </div>
      `;
    });
    
    // Add the reviews to the dynamic reviews container
    dynamicReviewsContainer.innerHTML = reviewsHTML;
    
  } catch (error) {
    console.error('Error loading dynamic reviews:', error);
  }
}

// Helper function to format the date string to "April 3, 2025" format
function formatReviewDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  // Use en-US locale to get "Month Day, Year" format
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Load reviews when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadDynamicReviews);
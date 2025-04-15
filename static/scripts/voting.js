document.addEventListener('DOMContentLoaded', function() {
    // Initialize vote counts from server
    let voteCounts = {
        'boards': 0,
        'foils': 0,
        'map': 0
    };
    
    // Check if user has already voted in this session
    let hasVoted = sessionStorage.getItem('hasVoted');
    
    // Fetch initial vote counts from server
    fetchVoteCounts();
    
    // If user already voted, show the voted state
    if (hasVoted) {
        const votedOption = sessionStorage.getItem('votedOption');
        if (votedOption) {
            const votedButton = document.querySelector(`.vote-btn[data-option="${votedOption}"]`);
            if (votedButton) {
                votedButton.classList.add('voted');
            }
            
            const messageEl = document.getElementById('message');
            messageEl.textContent = "Thanks for your vote!";
            messageEl.classList.add('success');
            messageEl.style.display = 'block';
        }
    }
    
    // Add click event listeners to vote buttons
    document.querySelectorAll('.vote-btn').forEach(button => {
        button.addEventListener('click', function() {
            const option = this.getAttribute('data-option');
            
            // Check if user already voted
            if (hasVoted) {
                showMessage("You've already voted!");
                return;
            }
            
            // Send vote to server
            sendVoteToServer(option);
        });
    });
    
    function fetchVoteCounts() {
        fetch('get-votes.php')
            .then(response => response.json())
            .then(data => {
                // Update local vote counts
                voteCounts = data;
                updateVoteCounts();
            })
            .catch(error => {
                console.error('Error fetching vote counts:', error);
            });
    }
    
    function updateVoteCounts() {
        document.getElementById('boards-count').textContent = voteCounts.boards;
        document.getElementById('foils-count').textContent = voteCounts.foils;
        document.getElementById('map-count').textContent = voteCounts.map;
    }
    
    function showMessage(text) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.classList.add('success');
        messageEl.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
    
    function sendVoteToServer(option) {
        fetch('vote.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                option: option 
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Update vote counts
                voteCounts = data.votes;
                updateVoteCounts();
                
                // Mark user's vote
                const votedButton = document.querySelector(`.vote-btn[data-option="${option}"]`);
                votedButton.classList.add('voted');
                
                // Save vote in session storage
                sessionStorage.setItem('hasVoted', 'true');
                sessionStorage.setItem('votedOption', option);
                
                // Show success message
                showMessage("Thanks for your vote!");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.error) {
                showMessage("Error: " + error.error);
            } else {
                showMessage("An error occurred while recording your vote.");
            }
        });
    }
});
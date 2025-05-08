/**
 * EmoDetc - Feed JavaScript
 * Handles team feed functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Setup form submission
    setupFeedForm();
    
    // Display feed entries
    displayFeedEntries();
});

// Setup feed form submission
function setupFeedForm() {
    const feedForm = document.getElementById('feed-form');
    if (feedForm) {
        feedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addFeed();
        });
    }
}

// Add a new feed entry
function addFeed() {
    const content = document.getElementById('feed-content').value;
    
    // Validate form
    if (!content) {
        alert('Mohon masukkan konten feed');
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    
    // Get existing feed data
    let feedData = JSON.parse(localStorage.getItem('feedData')) || [];
    
    // Create new feed entry
    const newFeed = {
        id: generateId(),
        userId: user.id,
        userName: user.name,
        content,
        timestamp: new Date().toISOString()
    };
    
    // Add new feed to data
    feedData.push(newFeed);
    
    // Save to local storage
    localStorage.setItem('feedData', JSON.stringify(feedData));
    
    // Reset form
    document.getElementById('feed-form').reset();
    
    // Reload and display feed
    displayFeedEntries();
}

// Get feeds by session
function getFeedsBySession() {
    const feedData = JSON.parse(localStorage.getItem('feedData')) || [];
    
    // Sort by timestamp, newest first
    return [...feedData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Display feed entries
function displayFeedEntries() {
    const feedData = getFeedsBySession();
    const feedContainer = document.getElementById('feed-container');
    
    if (!feedContainer) return;
    
    // Check if there are any feed entries
    if (feedData.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <p><i class="fas fa-stream"></i></p>
                <p>Belum ada feed</p>
                <p>Mulai berbagi dengan tim Anda</p>
            </div>
        `;
        return;
    }
    
    // Clear empty state if there are entries
    feedContainer.classList.remove('empty-state');
    
    // Clear existing content
    feedContainer.innerHTML = '';
    
    // Add feed entries
    feedData.forEach(feed => {
        const feedElement = document.createElement('div');
        feedElement.className = 'feed-item';
        
        // Format timestamp
        const timestamp = new Date(feed.timestamp);
        const formattedTime = formatDate(timestamp) + ' ' + formatTime(timestamp);
        
        feedElement.innerHTML = `
            <div class="header">
                <span>${feed.userName}</span>
                <span class="time">${formattedTime}</span>
            </div>
            <div class="content">${feed.content}</div>
        `;
        
        feedContainer.appendChild(feedElement);
    });
}

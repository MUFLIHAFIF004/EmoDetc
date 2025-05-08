/**
 * EmoDetc - Common JavaScript functions
 * Shared functionality across all pages
 */

// Get current user information (in a real app, this would come from authentication)
function getCurrentUser() {
    // For demo purposes, return a fixed user
    return {
        id: 'user1',
        name: 'User'
    };
}

// Format date to readable string
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time to readable string
function formatTime(dateString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Navigate to another page with data
function navigateTo(url, data = null) {
    if (data) {
        // Store temporary data in sessionStorage
        sessionStorage.setItem('tempData', JSON.stringify(data));
    }
    window.location.href = url;
}

// Get temporary data from navigation
function getNavigationData() {
    const data = sessionStorage.getItem('tempData');
    if (data) {
        sessionStorage.removeItem('tempData');
        return JSON.parse(data);
    }
    return null;
}

// Get emoji for mood word
function getMoodEmoji(moodWord) {
    switch (moodWord.toLowerCase()) {
        case 'senang': return '😊';
        case 'cemas': return '😔';
        case 'marah': return '😡';
        case 'netral': return '😐';
        default: return '😐';
    }
}

// Get numeric value for mood word (for charts)
function getMoodValue(moodWord) {
    switch (moodWord.toLowerCase()) {
        case 'senang': return 5;
        case 'netral': return 3;
        case 'cemas': return 2;
        case 'marah': return 1;
        default: return 3;
    }
}

// Convert numeric mood value to word
function getMoodWord(value) {
    if (value >= 4.5) return 'senang';
    if (value >= 3.5) return 'netral';
    if (value >= 2) return 'cemas';
    return 'marah';
}

// Check if there's data in localStorage
function hasData(key) {
    const data = localStorage.getItem(key);
    return data && JSON.parse(data).length > 0;
}

// Show or hide empty state based on data presence
function toggleEmptyState(containerId, dataKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (hasData(dataKey)) {
        container.classList.remove('empty-state');
    } else {
        container.classList.add('empty-state');
    }
}

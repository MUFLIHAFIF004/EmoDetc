/**
 * EmoDetc - Mood Check JavaScript
 * Handles mood submission functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('mood-date').valueAsDate = new Date();
    
    // Setup emoji selector
    setupEmojiSelector();
    
    // Setup form submission
    setupFormSubmission();
});

// Setup emoji selector functionality
function setupEmojiSelector() {
    const emojis = document.querySelectorAll('.emoji');
    const moodEmojiInput = document.getElementById('mood-emoji');
    
    emojis.forEach(emoji => {
        emoji.addEventListener('click', function() {
            // Remove selected class from all emojis
            emojis.forEach(e => e.classList.remove('selected'));
            
            // Add selected class to clicked emoji
            this.classList.add('selected');
            
            // Update hidden input value
            moodEmojiInput.value = this.getAttribute('data-emoji');
        });
    });
}

// Setup form submission
function setupFormSubmission() {
    const moodForm = document.getElementById('mood-form');
    if (moodForm) {
        moodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitMood();
        });
    }
}

// Submit mood data
function submitMood() {
    const moodEmoji = document.getElementById('mood-emoji').value;
    const moodWord = document.getElementById('mood-word').value;
    const date = document.getElementById('mood-date').value;
    const note = document.getElementById('mood-note').value;
    
    // Validate form
    if (!moodEmoji || !moodWord || !date) {
        alert('Mohon isi semua field yang diperlukan');
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    
    // Get existing mood data
    let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // Create new mood entry
    const newMood = {
        id: generateId(),
        userId: user.id,
        userName: user.name,
        moodEmoji,
        moodWord,
        date,
        note,
        timestamp: new Date().toISOString()
    };
    
    // Add new mood to data
    moodData.push(newMood);
    
    // Save to local storage
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
    // Navigate to chat page
    navigateTo('chat.html');
}

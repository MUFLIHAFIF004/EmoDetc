/**
 * EmoDetc - Chat JavaScript
 * Handles team discussion functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Setup form submission
    setupChatForm();
    
    // Display chat messages
    displayChatMessages();
});

// Setup chat form submission
function setupChatForm() {
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            postMessage();
        });
    }
}

// Post a new chat message
function postMessage() {
    const message = document.getElementById('chat-message').value;
    const mood = document.getElementById('chat-mood').value;
    
    // Validate form
    if (!message) {
        alert('Mohon masukkan pesan');
        return;
    }
    
    // Get current user
    const user = getCurrentUser();
    
    // Get existing chat log
    let chatLog = JSON.parse(localStorage.getItem('chatLog')) || [];
    
    // Create new chat entry
    const newChat = {
        id: generateId(),
        userId: user.id,
        userName: user.name,
        message,
        mood,
        timestamp: new Date().toISOString()
    };
    
    // Add new chat to log
    chatLog.push(newChat);
    
    // Save to local storage
    localStorage.setItem('chatLog', JSON.stringify(chatLog));
    
    // Reset form
    document.getElementById('chat-form').reset();
    
    // Reload and display chat
    displayChatMessages();
}

// Display chat messages
function displayChatMessages() {
    const chatLog = JSON.parse(localStorage.getItem('chatLog')) || [];
    const chatContainer = document.getElementById('chat-messages');
    
    if (!chatContainer) return;
    
    // Check if there are any messages
    if (chatLog.length === 0) {
        chatContainer.innerHTML = `
            <div class="empty-state">
                <p><i class="fas fa-comments"></i></p>
                <p>Belum ada pesan</p>
                <p>Mulai diskusi dengan tim Anda</p>
            </div>
        `;
        return;
    }
    
    // Clear empty state if there are messages
    chatContainer.classList.remove('empty-state');
    
    // Sort by timestamp
    const sortedChat = [...chatLog].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Clear existing content
    chatContainer.innerHTML = '';
    
    // Add chat messages
    sortedChat.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        // Get emoji for mood
        let moodEmoji = '😐';
        switch (message.mood) {
            case 'happy': moodEmoji = '😊'; break;
            case 'sad': moodEmoji = '😔'; break;
            case 'angry': moodEmoji = '😡'; break;
            default: moodEmoji = '😐';
        }
        
        // Format timestamp
        const timestamp = new Date(message.timestamp);
        const formattedTime = formatTime(timestamp);
        
        messageElement.innerHTML = `
            <div class="header">
                <span>${message.userName} ${moodEmoji}</span>
                <span class="time">${formattedTime}</span>
            </div>
            <div class="content">${message.message}</div>
        `;
        
        chatContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

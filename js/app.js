/**
 * Main Application Script for EmoDetc
 * Handles global state and initialization of components
 */

// Global application state
const appState = {
    user: {
        id: 'user1',
        name: 'Pengguna',
        currentMood: 'neutral'
    },
    chat: {
        messages: []
    },
    moodHistory: [],
    faceDetection: {
        isActive: false,
        lastDetectedMood: null
    }
};

// Core functionality
const core = {
    // Save mood data to app state
    saveMoodData: function(moodData) {
        return new Promise((resolve, reject) => {
            try {
                // Add timestamp and user info
                const data = {
                    ...moodData,
                    timestamp: new Date().toISOString(),
                    userId: appState.user.id,
                    userName: appState.user.name
                };
                
                // Update current user mood
                appState.user.currentMood = moodData.mood;
                
                // Add to mood history
                appState.moodHistory.unshift(data);
                
                // In a real app, this would send data to a server
                console.log('Mood data saved:', data);
                resolve(data);
            } catch (error) {
                console.error('Error saving mood data:', error);
                reject(error);
            }
        });
    },
    
    // Save chat message
    saveChatMessage: function(messageData) {
        return new Promise((resolve, reject) => {
            try {
                // Add message ID, timestamp, and user info if not provided
                const data = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    sender: appState.user.id,
                    senderName: appState.user.name,
                    mood: appState.user.currentMood,
                    ...messageData
                };
                
                // Add to chat messages
                appState.chat.messages.unshift(data);
                
                // In a real app, this would send data to a server
                console.log('Chat message saved:', data);
                resolve(data);
            } catch (error) {
                console.error('Error saving chat message:', error);
                reject(error);
            }
        });
    },
    
    // Get mood history
    getMoodHistory: function(days = 7) {
        return new Promise((resolve) => {
            // Filter mood history by date range
            const now = new Date();
            const startDate = new Date(now.setDate(now.getDate() - days));
            
            const filteredHistory = appState.moodHistory.filter(item => {
                const itemDate = new Date(item.timestamp);
                return itemDate >= startDate;
            });
            
            resolve(filteredHistory);
        });
    },
    
    // Get chat history
    getChatHistory: function() {
        return new Promise((resolve) => {
            resolve(appState.chat.messages);
        });
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('EmoDetc application initialized');
    
    // Setup mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Initialize page-specific components based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'index.html':
        case '':
            // Initialize dashboard components
            if (typeof DashboardComponent !== 'undefined') {
                const container = document.querySelector('.dashboard-container');
                if (container) DashboardComponent.init(container);
            }
            break;
            
        case 'mood-check.html':
            // Initialize mood check component
            if (typeof MoodCheckComponent !== 'undefined') {
                const container = document.querySelector('.mood-check-container');
                if (container) MoodCheckComponent.init(container);
            }
            break;
            
        case 'discussion.html':
            // Initialize discussion component
            if (typeof DiscussionComponent !== 'undefined') {
                const container = document.querySelector('.discussion-container');
                if (container) DiscussionComponent.init(container);
            }
            break;
            
        case 'dashboard.html':
            // Initialize emotion dashboard component
            if (typeof EmotionDashboardComponent !== 'undefined') {
                const container = document.querySelector('.emotion-dashboard-container');
                if (container) EmotionDashboardComponent.init(container);
            }
            break;
            
        case 'chat-history.html':
            // Initialize chat history component
            if (typeof ChatHistoryComponent !== 'undefined') {
                const container = document.querySelector('.chat-history-container');
                if (container) ChatHistoryComponent.init(container);
            }
            break;
            
        case 'weekly-report.html':
            // Initialize weekly report component
            if (typeof WeeklyReportComponent !== 'undefined') {
                const container = document.querySelector('.weekly-report-container');
                if (container) WeeklyReportComponent.init(container);
            }
            break;
            
        case 'team-feed.html':
            // Initialize team feed component
            if (typeof TeamFeedComponent !== 'undefined') {
                const container = document.querySelector('.team-feed-container');
                if (container) TeamFeedComponent.init(container);
            }
            break;
    }
});

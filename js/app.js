/**
 * EmoDetc - Main Application Script
 * Arsitektur 3 lapisan: Input → Core → Output
 */

// Global state untuk aplikasi
const appState = {
    currentPage: 'mood-check',
    user: {
        id: 'user1', // Simulasi user ID
        name: 'Pengguna',
        currentMood: null,
        moodHistory: []
    },
    team: {
        members: ['user1', 'user2', 'user3', 'user4'],
        moodData: {} // Data mood tim
    },
    chat: {
        messages: []
    },
    feedbacks: []
};

// Core layer - Handlers utama
const core = {
    // Inisialisasi aplikasi
    init: function() {
        // Setup event listeners
        this.setupNavigation();
        this.setupMobileMenu();
        
        // Load default page
        this.loadPage(appState.currentPage);
        
        console.log('EmoDetc Application initialized');
    },
    
    // Setup navigasi
    setupNavigation: function() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Get page name from data attribute
                const pageName = link.getAttribute('data-page');
                
                // Load page
                this.loadPage(pageName);
            });
        });
    },
    
    // Setup mobile menu
    setupMobileMenu: function() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when a link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    },
    
    // Load page content
    loadPage: function(pageName) {
        appState.currentPage = pageName;
        const pageContent = document.getElementById('page-content');
        
        // Clear current content
        pageContent.innerHTML = '';
        
        // Load new content based on page name
        switch(pageName) {
            case 'mood-check':
                this.loadMoodCheckPage(pageContent);
                break;
            case 'discussion':
                this.loadDiscussionPage(pageContent);
                break;
            case 'dashboard':
                this.loadDashboardPage(pageContent);
                break;
            case 'weekly-report':
                this.loadWeeklyReportPage(pageContent);
                break;
            case 'team-feed':
                this.loadTeamFeedPage(pageContent);
                break;
            default:
                this.loadMoodCheckPage(pageContent);
        }
    },
    
    // Load Mood Check page
    loadMoodCheckPage: function(container) {
        // This will be implemented in mood-check.js
        if (typeof MoodCheckComponent !== 'undefined') {
            MoodCheckComponent.init(container);
        }
    },
    
    // Load Discussion page
    loadDiscussionPage: function(container) {
        // This will be implemented in discussion.js
        if (typeof DiscussionComponent !== 'undefined') {
            DiscussionComponent.init(container);
        }
    },
    
    // Load Dashboard page
    loadDashboardPage: function(container) {
        // This will be implemented in dashboard.js
        if (typeof DashboardComponent !== 'undefined') {
            DashboardComponent.init(container);
        }
    },
    
    // Load Weekly Report page
    loadWeeklyReportPage: function(container) {
        // This will be implemented in weekly-report.js
        if (typeof WeeklyReportComponent !== 'undefined') {
            WeeklyReportComponent.init(container);
        }
    },
    
    // Load Team Feed page
    loadTeamFeedPage: function(container) {
        // This will be implemented in team-feed.js
        if (typeof TeamFeedComponent !== 'undefined') {
            TeamFeedComponent.init(container);
        }
    },
    
    // Utility functions for data processing
    saveMoodData: function(moodData) {
        // Simulasi penyimpanan data mood
        const timestamp = new Date().toISOString();
        const newMoodEntry = {
            timestamp: timestamp,
            mood: moodData.mood,
            note: moodData.note || '',
            context: moodData.context || ''
        };
        
        // Simpan ke history
        appState.user.moodHistory.push(newMoodEntry);
        appState.user.currentMood = moodData.mood;
        
        // Simulasi penyimpanan ke database
        console.log('Mood data saved:', newMoodEntry);
        
        // Return promise untuk simulasi async operation
        return Promise.resolve(newMoodEntry);
    },
    
    // Analisis tren mood (simulasi)
    analyzeTrend: function() {
        // Simulasi analisis tren
        const moodCounts = {
            'happy': 0,
            'neutral': 0,
            'angry': 0,
            'sad': 0
        };
        
        // Hitung frekuensi mood
        appState.user.moodHistory.forEach(entry => {
            if (moodCounts[entry.mood] !== undefined) {
                moodCounts[entry.mood]++;
            }
        });
        
        return moodCounts;
    },
    
    // Simpan pesan chat
    saveMessage: function(messageData) {
        // Simulasi penyimpanan pesan
        const timestamp = new Date().toISOString();
        const newMessage = {
            id: 'msg_' + Date.now(),
            timestamp: timestamp,
            sender: appState.user.id,
            senderName: appState.user.name,
            content: messageData.content,
            mood: messageData.mood || appState.user.currentMood
        };
        
        // Simpan ke history
        appState.chat.messages.push(newMessage);
        
        // Simulasi penyimpanan ke database
        console.log('Message saved:', newMessage);
        
        return Promise.resolve(newMessage);
    },
    
    // Simpan feedback
    saveFeedback: function(feedbackData) {
        // Simulasi penyimpanan feedback
        const timestamp = new Date().toISOString();
        const newFeedback = {
            id: 'feed_' + Date.now(),
            timestamp: timestamp,
            sender: appState.user.id,
            senderName: appState.user.name,
            content: feedbackData.content,
            sentiment: feedbackData.sentiment,
            targetUser: feedbackData.targetUser || null
        };
        
        // Simpan ke history
        appState.feedbacks.push(newFeedback);
        
        // Simulasi penyimpanan ke database
        console.log('Feedback saved:', newFeedback);
        
        return Promise.resolve(newFeedback);
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    core.init();
});

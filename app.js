// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize local storage if needed
    initializeLocalStorage();
    
    // Set default date to today
    document.getElementById('mood-date').valueAsDate = new Date();
    
    // Setup emoji selector
    setupEmojiSelector();
    
    // Setup form submissions
    setupFormSubmissions();
    
    // Load and display data
    loadAndDisplayData();
    
    // Setup export PDF button
    document.getElementById('export-pdf').addEventListener('click', exportPDF);
});

// Initialize local storage with sample data if empty
function initializeLocalStorage() {
    // Check if mood data exists
    if (!localStorage.getItem('moodData')) {
        // Create sample mood data
        const today = new Date();
        const sampleMoodData = [
            {
                id: 1,
                userId: 'user1',
                userName: 'John Doe',
                moodEmoji: '😊',
                moodWord: 'senang',
                date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                note: 'Project milestone completed successfully!'
            },
            {
                id: 2,
                userId: 'user1',
                userName: 'John Doe',
                moodEmoji: '😐',
                moodWord: 'netral',
                date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                note: 'Regular work day'
            },
            {
                id: 3,
                userId: 'user1',
                userName: 'John Doe',
                moodEmoji: '😔',
                moodWord: 'cemas',
                date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                note: 'Deadline approaching'
            },
            {
                id: 4,
                userId: 'user1',
                userName: 'John Doe',
                moodEmoji: '😔',
                moodWord: 'frustrasi',
                date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                note: 'Technical issues with the server'
            },
            {
                id: 5,
                userId: 'user1',
                userName: 'John Doe',
                moodEmoji: '😡',
                moodWord: 'frustrasi',
                date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                note: 'Client changed requirements again'
            },
            {
                id: 6,
                userId: 'user1',
                userName: 'John Doe',
                moodEmoji: '😔',
                moodWord: 'cemas',
                date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                note: 'Worried about meeting the deadline'
            }
        ];
        localStorage.setItem('moodData', JSON.stringify(sampleMoodData));
    }
    
    // Check if chat log exists
    if (!localStorage.getItem('chatLog')) {
        // Create sample chat data
        const sampleChatLog = [
            {
                id: 1,
                userId: 'user2',
                userName: 'Jane Smith',
                message: 'How is everyone feeling about the project deadline?',
                mood: 'neutral',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                userId: 'user3',
                userName: 'Mike Johnson',
                message: 'I\'m a bit stressed, but we\'re making good progress!',
                mood: 'sad',
                timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                userId: 'user1',
                userName: 'John Doe',
                message: 'Let\'s have a quick meeting to discuss the remaining tasks.',
                mood: 'neutral',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('chatLog', JSON.stringify(sampleChatLog));
    }
    
    // Check if feed data exists
    if (!localStorage.getItem('feedData')) {
        // Create sample feed data
        const sampleFeedData = [
            {
                id: 1,
                userId: 'user1',
                userName: 'John Doe',
                content: 'Just completed the frontend design for our project!',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                userId: 'user2',
                userName: 'Jane Smith',
                content: 'Team meeting scheduled for tomorrow at 10 AM to discuss project progress.',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('feedData', JSON.stringify(sampleFeedData));
    }
}

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

// Setup form submissions
function setupFormSubmissions() {
    // Mood form submission
    const moodForm = document.getElementById('mood-form');
    if (moodForm) {
        moodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitMood();
        });
    }
    
    // Chat form submission
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitChat();
        });
    }
    
    // Feed form submission
    const feedForm = document.getElementById('feed-form');
    if (feedForm) {
        feedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addFeed();
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
        alert('Please fill in all required fields');
        return;
    }
    
    // Get existing mood data
    let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // Create new mood entry
    const newMood = {
        id: Date.now(),
        userId: 'user1', // In a real app, this would be the logged-in user's ID
        userName: 'John Doe', // In a real app, this would be the logged-in user's name
        moodEmoji,
        moodWord,
        date,
        note
    };
    
    // Add new mood to data
    moodData.push(newMood);
    
    // Save to local storage
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
    // Reset form
    document.getElementById('mood-form').reset();
    document.getElementById('mood-date').valueAsDate = new Date();
    document.querySelectorAll('.emoji').forEach(e => e.classList.remove('selected'));
    
    // Reload and display data
    loadAndDisplayData();
    
    // Show success message
    alert('Mood submitted successfully!');
}

// Submit chat message
function submitChat() {
    const message = document.getElementById('chat-message').value;
    const mood = document.getElementById('chat-mood').value;
    
    // Validate form
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    // Get existing chat log
    let chatLog = JSON.parse(localStorage.getItem('chatLog')) || [];
    
    // Create new chat entry
    const newChat = {
        id: Date.now(),
        userId: 'user1', // In a real app, this would be the logged-in user's ID
        userName: 'John Doe', // In a real app, this would be the logged-in user's name
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

// Add feed entry
function addFeed() {
    const content = document.getElementById('feed-content').value;
    
    // Validate form
    if (!content) {
        alert('Please enter feed content');
        return;
    }
    
    // Get existing feed data
    let feedData = JSON.parse(localStorage.getItem('feedData')) || [];
    
    // Create new feed entry
    const newFeed = {
        id: Date.now(),
        userId: 'user1', // In a real app, this would be the logged-in user's ID
        userName: 'John Doe', // In a real app, this would be the logged-in user's name
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

// Load and display all data
function loadAndDisplayData() {
    generateChart();
    displayWeeklySummary();
    displayMoodHistory();
    detectConflict();
    displayChatMessages();
    displayFeedEntries();
    displayWeeklyReport();
}

// Generate mood chart
function generateChart() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // Sort data by date
    moodData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Prepare data for chart
    const dates = moodData.map(entry => entry.date);
    const moodValues = moodData.map(entry => {
        // Convert mood to numeric value for chart
        switch (entry.moodWord) {
            case 'senang': return 5;
            case 'netral': return 3;
            case 'cemas': return 2;
            case 'frustrasi': return 1;
            default: return 3;
        }
    });
    
    // Get chart context
    const ctx = document.getElementById('mood-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.moodChart) {
        window.moodChart.destroy();
    }
    
    // Create new chart
    window.moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Mood Level',
                data: moodValues,
                backgroundColor: 'rgba(79, 195, 247, 0.2)',
                borderColor: 'rgba(79, 195, 247, 1)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            switch (value) {
                                case 5: return 'Senang';
                                case 4: return 'Baik';
                                case 3: return 'Netral';
                                case 2: return 'Cemas';
                                case 1: return 'Frustrasi';
                                case 0: return '';
                                default: return '';
                            }
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const entry = moodData[index];
                            return `${entry.moodEmoji} ${entry.moodWord}: ${entry.note}`;
                        }
                    }
                }
            }
        }
    });
}

// Get weekly summary
function getWeeklySummary() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // Get data from the last 7 days
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyData = moodData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo && entryDate <= today;
    });
    
    // Count occurrences of each mood
    const moodCounts = {
        senang: 0,
        netral: 0,
        cemas: 0,
        frustrasi: 0
    };
    
    weeklyData.forEach(entry => {
        if (moodCounts.hasOwnProperty(entry.moodWord)) {
            moodCounts[entry.moodWord]++;
        }
    });
    
    // Determine dominant mood
    let dominantMood = 'netral';
    let maxCount = 0;
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            dominantMood = mood;
        }
    }
    
    // Calculate average mood value
    const moodValues = weeklyData.map(entry => {
        switch (entry.moodWord) {
            case 'senang': return 5;
            case 'netral': return 3;
            case 'cemas': return 2;
            case 'frustrasi': return 1;
            default: return 3;
        }
    });
    
    const averageMood = moodValues.length > 0 
        ? moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length 
        : 0;
    
    // Determine trend
    let trend = 'stable';
    if (moodValues.length >= 2) {
        const firstHalf = moodValues.slice(0, Math.floor(moodValues.length / 2));
        const secondHalf = moodValues.slice(Math.floor(moodValues.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
        
        if (secondHalfAvg > firstHalfAvg + 0.5) {
            trend = 'improving';
        } else if (secondHalfAvg < firstHalfAvg - 0.5) {
            trend = 'declining';
        }
    }
    
    return {
        totalEntries: weeklyData.length,
        moodCounts,
        dominantMood,
        averageMood,
        trend
    };
}

// Display weekly summary
function displayWeeklySummary() {
    const summary = getWeeklySummary();
    const summaryContainer = document.getElementById('weekly-summary');
    
    if (!summaryContainer) return;
    
    let trendIcon = '';
    let trendClass = '';
    
    switch (summary.trend) {
        case 'improving':
            trendIcon = '<i class="fas fa-arrow-up"></i>';
            trendClass = 'trend-up';
            break;
        case 'declining':
            trendIcon = '<i class="fas fa-arrow-down"></i>';
            trendClass = 'trend-down';
            break;
        default:
            trendIcon = '<i class="fas fa-arrows-alt-h"></i>';
            trendClass = 'trend-stable';
    }
    
    let dominantMoodEmoji = '';
    switch (summary.dominantMood) {
        case 'senang': dominantMoodEmoji = '😊'; break;
        case 'netral': dominantMoodEmoji = '😐'; break;
        case 'cemas': dominantMoodEmoji = '😔'; break;
        case 'frustrasi': dominantMoodEmoji = '😡'; break;
        default: dominantMoodEmoji = '😐';
    }
    
    summaryContainer.innerHTML = `
        <div class="summary-stats">
            <div class="stat">
                <span class="stat-value">${summary.totalEntries}</span>
                <span class="stat-label">Entries</span>
            </div>
            <div class="stat">
                <span class="stat-value">${dominantMoodEmoji}</span>
                <span class="stat-label">Dominant Mood</span>
            </div>
            <div class="stat">
                <span class="stat-value ${trendClass}">${trendIcon}</span>
                <span class="stat-label">Trend</span>
            </div>
        </div>
        <div class="summary-text">
            <p>This week, the team's mood has been predominantly <strong>${summary.dominantMood}</strong> 
            and is <strong>${summary.trend}</strong>.</p>
            <p>Mood breakdown: 
                Senang (${summary.moodCounts.senang}), 
                Netral (${summary.moodCounts.netral}), 
                Cemas (${summary.moodCounts.cemas}), 
                Frustrasi (${summary.moodCounts.frustrasi})
            </p>
        </div>
    `;
}

// Get mood history by user
function getHistoryByUser(userId = 'user1') {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // Filter by user ID if provided
    const userMoodData = userId 
        ? moodData.filter(entry => entry.userId === userId) 
        : moodData;
    
    // Sort by date, newest first
    return userMoodData.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Display mood history
function displayMoodHistory() {
    const historyData = getHistoryByUser();
    const historyBody = document.getElementById('history-body');
    
    if (!historyBody) return;
    
    // Clear existing content
    historyBody.innerHTML = '';
    
    // Add history entries
    if (historyData.length === 0) {
        historyBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">No mood history available</td>
            </tr>
        `;
    } else {
        historyData.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.moodEmoji}</td>
                <td>${entry.moodWord}</td>
                <td>${entry.note}</td>
            `;
            historyBody.appendChild(row);
        });
    }
}

// Detect potential conflicts or issues
function detectConflict() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // Sort by date
    const sortedData = [...moodData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Check for declining mood over the last few days
    if (sortedData.length >= 3) {
        const recentMoods = sortedData.slice(-3);
        
        // Convert moods to numeric values
        const moodValues = recentMoods.map(entry => {
            switch (entry.moodWord) {
                case 'senang': return 5;
                case 'netral': return 3;
                case 'cemas': return 2;
                case 'frustrasi': return 1;
                default: return 3;
            }
        });
        
        // Check if mood is consistently declining
        if (moodValues[0] > moodValues[1] && moodValues[1] > moodValues[2] && 
            moodValues[0] - moodValues[2] >= 2) {
            notifyLeader(recentMoods);
        }
    }
}

// Notify team leader about potential issues
function notifyLeader(recentMoods) {
    const alertContainer = document.getElementById('alert-container');
    
    if (!alertContainer) return;
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = 'alert danger';
    
    const latestMood = recentMoods[recentMoods.length - 1];
    
    alert.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <div>
            <strong>Mood Alert:</strong> Team mood has been declining over the past few days.
            <p>Latest mood: ${latestMood.moodEmoji} ${latestMood.moodWord} - "${latestMood.note}"</p>
            <p>Consider scheduling a team check-in to address any issues.</p>
        </div>
    `;
    
    // Add alert to container
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
}

// Display chat messages
function displayChatMessages() {
    const chatLog = JSON.parse(localStorage.getItem('chatLog')) || [];
    const chatContainer = document.getElementById('chat-messages');
    
    if (!chatContainer) return;
    
    // Sort by timestamp
    const sortedChat = [...chatLog].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Clear existing content
    chatContainer.innerHTML = '';
    
    // Add chat messages
    if (sortedChat.length === 0) {
        chatContainer.innerHTML = '<p class="text-center">No messages yet</p>';
    } else {
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
            const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
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
    
    // Clear existing content
    feedContainer.innerHTML = '';
    
    // Add feed entries
    if (feedData.length === 0) {
        feedContainer.innerHTML = '<p class="text-center">No feed entries yet</p>';
    } else {
        feedData.forEach(feed => {
            const feedElement = document.createElement('div');
            feedElement.className = 'feed-item';
            
            // Format timestamp
            const timestamp = new Date(feed.timestamp);
            const formattedTime = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
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
}

// Display weekly report
function displayWeeklyReport() {
    const summary = getWeeklySummary();
    const reportContainer = document.getElementById('report-content');
    
    if (!reportContainer) return;
    
    // Get current date range for the report
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startDate = oneWeekAgo.toLocaleDateString();
    const endDate = today.toLocaleDateString();
    
    // Create report content
    let moodDescription = '';
    switch (summary.dominantMood) {
        case 'senang':
            moodDescription = 'The team is generally happy and productive.';
            break;
        case 'netral':
            moodDescription = 'The team is maintaining a balanced mood.';
            break;
        case 'cemas':
            moodDescription = 'The team is experiencing some anxiety that should be addressed.';
            break;
        case 'frustrasi':
            moodDescription = 'The team is facing frustration that requires immediate attention.';
            break;
        default:
            moodDescription = 'The team mood is mixed.';
    }
    
    let trendDescription = '';
    switch (summary.trend) {
        case 'improving':
            trendDescription = 'Team mood is improving, which is a positive sign.';
            break;
        case 'declining':
            trendDescription = 'Team mood is declining, which may require intervention.';
            break;
        default:
            trendDescription = 'Team mood is stable.';
    }
    
    reportContainer.innerHTML = `
        <h3>Weekly Mood Report: ${startDate} to ${endDate}</h3>
        <p><strong>Summary:</strong> ${moodDescription} ${trendDescription}</p>
        <p><strong>Mood Distribution:</strong></p>
        <ul>
            <li>Senang: ${summary.moodCounts.senang} entries</li>
            <li>Netral: ${summary.moodCounts.netral} entries</li>
            <li>Cemas: ${summary.moodCounts.cemas} entries</li>
            <li>Frustrasi: ${summary.moodCounts.frustrasi} entries</li>
        </ul>
        <p><strong>Recommendations:</strong></p>
        <ul>
            ${summary.trend === 'declining' ? '<li>Schedule a team meeting to address concerns</li>' : ''}
            ${summary.dominantMood === 'frustrasi' ? '<li>Identify and resolve sources of frustration</li>' : ''}
            ${summary.dominantMood === 'cemas' ? '<li>Provide additional support and resources</li>' : ''}
            ${summary.dominantMood === 'senang' ? '<li>Maintain current positive environment</li>' : ''}
            <li>Continue monitoring team mood</li>
        </ul>
    `;
}

// Export PDF (dummy function)
function exportPDF() {
    alert('PDF export functionality would be implemented here. In a real application, this would generate a PDF report of the weekly mood data.');
}

// Add some CSS for the summary stats
const style = document.createElement('style');
style.textContent = `
    .summary-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 15px;
    }
    
    .stat {
        text-align: center;
    }
    
    .stat-value {
        display: block;
        font-size: 24px;
        font-weight: bold;
    }
    
    .stat-label {
        font-size: 14px;
        color: #777;
    }
    
    .trend-up {
        color: var(--success-color);
    }
    
    .trend-down {
        color: var(--danger-color);
    }
    
    .trend-stable {
        color: var(--warning-color);
    }
`;
document.head.appendChild(style);

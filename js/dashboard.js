/**
 * EmoDetc - Dashboard JavaScript
 * Handles mood dashboard and visualization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if there's mood data and update UI accordingly
    updateDashboardUI();
});

// Update dashboard UI based on data availability
function updateDashboardUI() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    if (moodData.length > 0) {
        // Update mood stats
        displayMoodStats();
        
        // Display simple chart
        displaySimpleChart();
        
        // Display weekly summary
        displayWeeklySummary();
    }
}

// Display mood stats (counts for each mood type)
function displayMoodStats() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    const statsContainer = document.getElementById('mood-stats');
    
    if (!statsContainer || moodData.length === 0) return;
    
    // Clear empty state
    statsContainer.innerHTML = '';
    
    // Count mood occurrences
    const moodCounts = {
        senang: 0,
        netral: 0,
        cemas: 0,
        marah: 0
    };
    
    moodData.forEach(entry => {
        if (moodCounts.hasOwnProperty(entry.moodWord)) {
            moodCounts[entry.moodWord]++;
        }
    });
    
    // Create mood stat items
    Object.keys(moodCounts).forEach(mood => {
        // Skip moods with 0 count
        if (moodCounts[mood] === 0) return;
        
        const moodEmoji = getMoodEmoji(mood);
        const statItem = document.createElement('div');
        statItem.className = 'mood-stat-item';
        
        statItem.innerHTML = `
            <div class="mood-emoji">${moodEmoji}</div>
            <div class="mood-count">${moodCounts[mood]}</div>
            <div class="mood-label">${mood.charAt(0).toUpperCase() + mood.slice(1)}</div>
        `;
        
        statsContainer.appendChild(statItem);
    });
    
    // Add total count
    const totalItem = document.createElement('div');
    totalItem.className = 'mood-stat-item';
    const totalCount = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    totalItem.innerHTML = `
        <div class="mood-emoji"><i class="fas fa-calculator"></i></div>
        <div class="mood-count">${totalCount}</div>
        <div class="mood-label">Total</div>
    `;
    
    statsContainer.appendChild(totalItem);
}

// Display simple chart visualization
function displaySimpleChart() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    const chartContainer = document.getElementById('simple-chart');
    
    if (!chartContainer || moodData.length === 0) return;
    
    // Clear empty state
    chartContainer.innerHTML = '';
    
    // Sort data by date
    const sortedData = [...moodData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Limit to last 7 entries for simplicity
    const recentData = sortedData.slice(-7);
    
    // Create simple chart container
    const chartElement = document.createElement('div');
    chartElement.className = 'simple-mood-chart';
    
    // Create bars for each mood entry
    recentData.forEach(entry => {
        const moodValue = getMoodValue(entry.moodWord);
        const heightPercentage = (moodValue / 5) * 100;
        
        // Choose color based on mood
        let barColor;
        if (moodValue >= 4) barColor = 'rgba(102, 187, 106, 0.8)'; // Green for happy
        else if (moodValue >= 3) barColor = 'rgba(79, 195, 247, 0.8)'; // Blue for neutral
        else if (moodValue >= 2) barColor = 'rgba(255, 167, 38, 0.8)'; // Orange for anxious
        else barColor = 'rgba(239, 83, 80, 0.8)'; // Red for angry
        
        // Format date
        const date = new Date(entry.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
        
        // Create bar element
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${heightPercentage}%`;
        bar.style.backgroundColor = barColor;
        bar.title = `${entry.moodWord}: ${entry.note || ''}`;
        
        // Add date label
        const label = document.createElement('div');
        label.className = 'chart-bar-label';
        label.textContent = formattedDate;
        bar.appendChild(label);
        
        // Add emoji on top
        const emoji = document.createElement('div');
        emoji.className = 'chart-bar-emoji';
        emoji.textContent = entry.moodEmoji;
        bar.appendChild(emoji);
        
        chartElement.appendChild(bar);
    });
    
    chartContainer.appendChild(chartElement);
}

// Get weekly summary data
function getWeeklySummary() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // If no data, return empty summary
    if (moodData.length === 0) {
        return {
            totalEntries: 0,
            moodCounts: { senang: 0, netral: 0, cemas: 0, marah: 0 },
            dominantMood: 'netral',
            averageMood: 0,
            trend: 'stable'
        };
    }
    
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
        marah: 0
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
    const moodValues = weeklyData.map(entry => getMoodValue(entry.moodWord));
    
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
    
    // If no entries, keep empty state
    if (summary.totalEntries === 0) return;
    
    // Remove empty state
    summaryContainer.classList.remove('empty-state');
    
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
    
    let dominantMoodEmoji = getMoodEmoji(summary.dominantMood);
    
    summaryContainer.innerHTML = `
        <div class="summary-stats">
            <div class="stat">
                <span class="stat-value">${summary.totalEntries}</span>
                <span class="stat-label">Entri</span>
            </div>
            <div class="stat">
                <span class="stat-value">${dominantMoodEmoji}</span>
                <span class="stat-label">Mood Dominan</span>
            </div>
            <div class="stat">
                <span class="stat-value ${trendClass}">${trendIcon}</span>
                <span class="stat-label">Tren</span>
            </div>
        </div>
        <div class="summary-text">
            <p>Minggu ini, mood tim dominan <strong>${summary.dominantMood}</strong> 
            dan sedang <strong>${summary.trend === 'improving' ? 'membaik' : summary.trend === 'declining' ? 'menurun' : 'stabil'}</strong>.</p>
            <p>Distribusi mood: 
                Senang (${summary.moodCounts.senang}), 
                Netral (${summary.moodCounts.netral}), 
                Cemas (${summary.moodCounts.cemas}), 
                Marah (${summary.moodCounts.marah})
            </p>
        </div>
    `;
}

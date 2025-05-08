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
        // Hide empty state
        document.getElementById('chart-container').classList.remove('empty-state');
        document.getElementById('mood-chart').style.display = 'block';
        
        // Generate chart
        generateChart();
        
        // Display weekly summary
        displayWeeklySummary();
    }
}

// Generate mood chart
function generateChart() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // If no data, don't generate chart
    if (moodData.length === 0) return;
    
    // Sort data by date
    moodData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Prepare data for chart
    const dates = moodData.map(entry => entry.date);
    const moodValues = moodData.map(entry => getMoodValue(entry.moodWord));
    
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
                                case 1: return 'Marah';
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

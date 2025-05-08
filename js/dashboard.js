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
    const dates = moodData.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });
    
    const moodValues = moodData.map(entry => getMoodValue(entry.moodWord));
    const moodEmojis = moodData.map(entry => entry.moodEmoji);
    
    // Create color gradients based on mood values
    const gradientColors = moodValues.map(value => {
        if (value >= 4) return 'rgba(102, 187, 106, 0.8)'; // Green for happy
        if (value >= 3) return 'rgba(79, 195, 247, 0.8)'; // Blue for neutral
        if (value >= 2) return 'rgba(255, 167, 38, 0.8)'; // Orange for anxious
        return 'rgba(239, 83, 80, 0.8)'; // Red for angry
    });
    
    // Get chart context
    const ctx = document.getElementById('mood-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.moodChart) {
        window.moodChart.destroy();
    }
    
    // Create new chart
    window.moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Mood Level',
                    data: moodValues,
                    backgroundColor: gradientColors,
                    borderColor: gradientColors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1,
                    borderRadius: 6,
                    barThickness: 20,
                    maxBarThickness: 30
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#333',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12,
                    borderColor: '#ddd',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        title: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            return formatDate(moodData[index].date);
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const entry = moodData[index];
                            return `${entry.moodEmoji} ${entry.moodWord}${entry.note ? ': ' + entry.note : ''}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    grid: {
                        display: true,
                        color: 'rgba(200, 200, 200, 0.2)'
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12
                        },
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
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        },
        plugins: [{
            id: 'emojisOnTop',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if (!meta.hidden) {
                        meta.data.forEach((element, index) => {
                            // Draw emoji on top of each bar
                            ctx.font = '16px Arial';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'bottom';
                            const emoji = moodEmojis[index];
                            const position = element.getCenterPoint();
                            ctx.fillText(emoji, position.x, position.y - 5);
                        });
                    }
                });
            }
        }]
    });
    
    // Add a second chart showing mood distribution
    createMoodDistributionChart();
}

// Create a pie chart showing mood distribution
function createMoodDistributionChart() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // If no data, don't generate chart
    if (moodData.length === 0) return;
    
    // Create a new canvas for the pie chart
    const container = document.getElementById('chart-container');
    if (!document.getElementById('mood-distribution-chart')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'mood-distribution-chart';
        canvas.style.marginTop = '20px';
        canvas.style.height = '180px';
        container.appendChild(canvas);
    }
    
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
    
    // Prepare data for chart
    const labels = Object.keys(moodCounts).map(mood => {
        const count = moodCounts[mood];
        return count > 0 ? mood.charAt(0).toUpperCase() + mood.slice(1) : null;
    }).filter(Boolean);
    
    const data = Object.values(moodCounts).filter(count => count > 0);
    
    // Colors for each mood
    const backgroundColors = [
        'rgba(102, 187, 106, 0.8)', // Green for senang
        'rgba(79, 195, 247, 0.8)',  // Blue for netral
        'rgba(255, 167, 38, 0.8)',  // Orange for cemas
        'rgba(239, 83, 80, 0.8)'    // Red for marah
    ];
    
    // Get chart context
    const ctx = document.getElementById('mood-distribution-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.moodDistributionChart) {
        window.moodDistributionChart.destroy();
    }
    
    // Create new chart
    window.moodDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: 'Distribusi Mood',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#333',
                    bodyFont: {
                        size: 14
                    },
                    padding: 12,
                    borderColor: '#ddd',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
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

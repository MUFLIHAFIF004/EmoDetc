/**
 * Dashboard Component
 * Parte da camada de saída (Output Layer) na arquitetura de 3 camadas
 */

const DashboardComponent = {
    container: null,
    teamMoodChart: null,
    moodTrendChart: null,
    
    init: function(container) {
        this.container = container;
        this.setupEventListeners();
        this.renderTeamMembersTable();
        this.renderMoodInsights();
        this.initCharts();
    },
    
    setupEventListeners: function() {
        // Setup time range selector
        const timeRangeSelect = document.getElementById('time-range');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', () => {
                this.updateCharts(timeRangeSelect.value);
            });
        }
        
        // Setup refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                const timeRange = document.getElementById('time-range').value;
                this.updateCharts(timeRange);
                this.renderTeamMembersTable();
                this.renderMoodInsights();
            });
        }
    },
    
    initCharts: function() {
        // Initialize Team Mood Distribution Chart
        const teamMoodCtx = document.getElementById('team-mood-chart').getContext('2d');
        this.teamMoodChart = new Chart(teamMoodCtx, {
            type: 'doughnut',
            data: {
                labels: ['Senang', 'Netral', 'Marah', 'Sedih'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: [
                        '#10B981', // green-500
                        '#F59E0B', // yellow-500
                        '#EF4444', // red-500
                        '#3B82F6'  // blue-500
                    ],
                    borderWidth: 1
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
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${percentage}% (${value} anggota)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Initialize Mood Trend Chart
        const moodTrendCtx = document.getElementById('mood-trend-chart').getContext('2d');
        this.moodTrendChart = new Chart(moodTrendCtx, {
            type: 'line',
            data: {
                labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
                datasets: [
                    {
                        label: 'Senang',
                        data: [30, 35, 40, 50, 45, 40, 50],
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Netral',
                        data: [45, 40, 35, 30, 35, 40, 30],
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Marah',
                        data: [15, 20, 15, 10, 15, 10, 5],
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Sedih',
                        data: [10, 5, 10, 10, 5, 10, 15],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Persentase (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    },
    
    updateCharts: function(timeRange) {
        // Simulate data update based on time range
        let teamMoodData, moodTrendLabels, moodTrendData;
        
        switch(timeRange) {
            case 'day':
                teamMoodData = [45, 35, 15, 5];
                moodTrendLabels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
                moodTrendData = [
                    [40, 45, 50, 55, 50, 45], // Senang
                    [35, 30, 25, 20, 25, 30], // Netral
                    [15, 20, 15, 15, 20, 15], // Marah
                    [10, 5, 10, 10, 5, 10]    // Sedih
                ];
                break;
            case 'month':
                teamMoodData = [35, 40, 15, 10];
                moodTrendLabels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
                moodTrendData = [
                    [30, 35, 40, 35], // Senang
                    [40, 35, 30, 35], // Netral
                    [20, 15, 20, 15], // Marah
                    [10, 15, 10, 15]  // Sedih
                ];
                break;
            default: // week
                teamMoodData = [40, 30, 20, 10];
                moodTrendLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
                moodTrendData = [
                    [30, 35, 40, 50, 45, 40, 50], // Senang
                    [45, 40, 35, 30, 35, 40, 30], // Netral
                    [15, 20, 15, 10, 15, 10, 5],  // Marah
                    [10, 5, 10, 10, 5, 10, 15]    // Sedih
                ];
        }
        
        // Update Team Mood Chart
        this.teamMoodChart.data.datasets[0].data = teamMoodData;
        this.teamMoodChart.update();
        
        // Update Mood Trend Chart
        this.moodTrendChart.data.labels = moodTrendLabels;
        this.moodTrendChart.data.datasets.forEach((dataset, index) => {
            dataset.data = moodTrendData[index];
        });
        this.moodTrendChart.update();
    },
    
    renderTeamMembersTable: function() {
        const tableBody = document.getElementById('team-members-table');
        if (!tableBody) return;
        
        // Simulasi data anggota tim
        const teamMembers = [
            { name: 'Pengguna', currentMood: 'happy', dominantMood: 'happy', change: 'stable' },
            { name: 'Budi', currentMood: 'happy', dominantMood: 'happy', change: 'improved' },
            { name: 'Citra', currentMood: 'neutral', dominantMood: 'neutral', change: 'stable' },
            { name: 'Deni', currentMood: 'angry', dominantMood: 'neutral', change: 'declined' },
            { name: 'Eka', currentMood: 'sad', dominantMood: 'sad', change: 'stable' }
        ];
        
        // Mapping mood ke warna dan emoji
        const moodColors = {
            'happy': 'bg-green-500',
            'neutral': 'bg-yellow-500',
            'angry': 'bg-red-500',
            'sad': 'bg-blue-500'
        };
        
        const moodEmojis = {
            'happy': '😊',
            'neutral': '😐',
            'angry': '😠',
            'sad': '😢'
        };
        
        const changeIcons = {
            'improved': '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>',
            'declined': '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>',
            'stable': '<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"></path></svg>'
        };
        
        // Render table rows
        let tableHTML = '';
        teamMembers.forEach(member => {
            tableHTML += `
                <tr>
                    <td class="py-3 px-4 border-b border-gray-200">
                        <div class="font-medium">${member.name}</div>
                    </td>
                    <td class="py-3 px-4 border-b border-gray-200">
                        <div class="flex items-center">
                            <div class="mood-indicator ${moodColors[member.currentMood]} mr-2"></div>
                            <span>${moodEmojis[member.currentMood]}</span>
                        </div>
                    </td>
                    <td class="py-3 px-4 border-b border-gray-200">
                        <div class="flex items-center">
                            <div class="mood-indicator ${moodColors[member.dominantMood]} mr-2"></div>
                            <span>${moodEmojis[member.dominantMood]}</span>
                        </div>
                    </td>
                    <td class="py-3 px-4 border-b border-gray-200">
                        <div class="flex items-center">
                            ${changeIcons[member.change]}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    },
    
    renderMoodInsights: function() {
        const insightsContainer = document.getElementById('mood-insights');
        if (!insightsContainer) return;
        
        // Simulasi data insight
        const insights = [
            {
                title: 'Tren Positif',
                description: 'Mood tim secara keseluruhan menunjukkan peningkatan sebesar 15% dibandingkan minggu lalu.',
                type: 'positive'
            },
            {
                title: 'Perhatian',
                description: 'Terdapat peningkatan mood "Marah" pada hari Selasa, mungkin terkait dengan deadline proyek.',
                type: 'warning'
            },
            {
                title: 'Rekomendasi',
                description: 'Pertimbangkan untuk mengadakan sesi team building untuk meningkatkan mood tim.',
                type: 'info'
            }
        ];
        
        // Mapping tipe insight ke warna
        const insightColors = {
            'positive': 'bg-green-100 text-green-800 border-green-200',
            'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'negative': 'bg-red-100 text-red-800 border-red-200',
            'info': 'bg-blue-100 text-blue-800 border-blue-200'
        };
        
        // Render insights
        let insightsHTML = '';
        insights.forEach(insight => {
            insightsHTML += `
                <div class="p-4 rounded-lg border ${insightColors[insight.type]}">
                    <h3 class="font-bold mb-2">${insight.title}</h3>
                    <p>${insight.description}</p>
                </div>
            `;
        });
        
        insightsContainer.innerHTML = insightsHTML;
    }
};

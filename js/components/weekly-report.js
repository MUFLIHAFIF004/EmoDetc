/**
 * Weekly Report Component
 * Parte da camada de saída (Output Layer) na arquitetura de 3 camadas
 */

const WeeklyReportComponent = {
    container: null,
    weeklyMoodChart: null,
    weeklyDistributionChart: null,
    
    init: function(container) {
        this.container = container;
        this.setupEventListeners();
        this.initCharts();
    },
    
    setupEventListeners: function() {
        // Setup week selector
        const weekSelector = document.getElementById('week-selector');
        if (weekSelector) {
            weekSelector.addEventListener('change', () => {
                this.updateReportData(weekSelector.value);
            });
        }
        
        // Setup export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }
    },
    
    initCharts: function() {
        // Initialize Weekly Mood Trend Chart
        const weeklyMoodCtx = document.getElementById('weekly-mood-chart').getContext('2d');
        this.weeklyMoodChart = new Chart(weeklyMoodCtx, {
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
        
        // Initialize Weekly Distribution Chart
        const weeklyDistributionCtx = document.getElementById('weekly-distribution-chart').getContext('2d');
        this.weeklyDistributionChart = new Chart(weeklyDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Senang', 'Netral', 'Marah', 'Sedih'],
                datasets: [{
                    data: [45, 30, 15, 10],
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
    },
    
    updateReportData: function(weekValue) {
        // Simulate data update based on selected week
        let weeklyMoodData, weeklyDistributionData;
        
        switch(weekValue) {
            case 'previous':
                weeklyMoodData = [
                    [25, 30, 35, 40, 35, 30, 35], // Senang
                    [50, 45, 40, 35, 40, 45, 40], // Netral
                    [15, 15, 15, 15, 15, 15, 15], // Marah
                    [10, 10, 10, 10, 10, 10, 10]  // Sedih
                ];
                weeklyDistributionData = [35, 40, 15, 10];
                this.updateSummaryData('previous');
                break;
            case 'twoWeeksAgo':
                weeklyMoodData = [
                    [20, 25, 30, 35, 30, 25, 30], // Senang
                    [55, 50, 45, 40, 45, 50, 45], // Netral
                    [15, 15, 15, 15, 15, 15, 15], // Marah
                    [10, 10, 10, 10, 10, 10, 10]  // Sedih
                ];
                weeklyDistributionData = [30, 45, 15, 10];
                this.updateSummaryData('twoWeeksAgo');
                break;
            default: // current
                weeklyMoodData = [
                    [30, 35, 40, 50, 45, 40, 50], // Senang
                    [45, 40, 35, 30, 35, 40, 30], // Netral
                    [15, 20, 15, 10, 15, 10, 5],  // Marah
                    [10, 5, 10, 10, 5, 10, 15]    // Sedih
                ];
                weeklyDistributionData = [45, 30, 15, 10];
                this.updateSummaryData('current');
        }
        
        // Update Weekly Mood Chart
        this.weeklyMoodChart.data.datasets.forEach((dataset, index) => {
            dataset.data = weeklyMoodData[index];
        });
        this.weeklyMoodChart.update();
        
        // Update Weekly Distribution Chart
        this.weeklyDistributionChart.data.datasets[0].data = weeklyDistributionData;
        this.weeklyDistributionChart.update();
    },
    
    updateSummaryData: function(weekValue) {
        // Update summary data based on selected week
        const dominantMoodElement = document.querySelector('.bg-indigo-50:nth-child(1) .font-bold');
        const moodChangeElement = document.querySelector('.bg-indigo-50:nth-child(2) .text-2xl');
        const discussionsElement = document.querySelector('.bg-indigo-50:nth-child(3) .text-2xl');
        const participationElement = document.querySelector('.bg-indigo-50:nth-child(4) .text-2xl');
        
        if (!dominantMoodElement || !moodChangeElement || !discussionsElement || !participationElement) return;
        
        switch(weekValue) {
            case 'previous':
                dominantMoodElement.innerHTML = 'Netral (40%)';
                moodChangeElement.innerHTML = '<span class="text-yellow-600">0%</span>';
                discussionsElement.innerHTML = '10 Diskusi';
                participationElement.innerHTML = '80%';
                break;
            case 'twoWeeksAgo':
                dominantMoodElement.innerHTML = 'Netral (45%)';
                moodChangeElement.innerHTML = '<span class="text-red-600">-5%</span>';
                discussionsElement.innerHTML = '8 Diskusi';
                participationElement.innerHTML = '75%';
                break;
            default: // current
                dominantMoodElement.innerHTML = 'Senang (45%)';
                moodChangeElement.innerHTML = '<span class="text-green-600">+10%</span>';
                discussionsElement.innerHTML = '12 Diskusi';
                participationElement.innerHTML = '85%';
        }
    },
    
    exportReport: function() {
        // In a real application, this would generate a PDF report
        alert('Fitur export laporan akan mengunduh laporan dalam format PDF. Fitur ini belum diimplementasikan sepenuhnya.');
        console.log('Export report requested');
    }
};

/**
 * Dashboard Component
 * Bagian dari lapisan Output dalam arsitektur 3 lapisan
 */

const DashboardComponent = {
    init: function(container) {
        this.container = container;
        this.render();
        this.setupCharts();
    },
    
    render: function() {
        const html = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold mb-2 text-indigo-700">Dashboard Emosi</h2>
                <p class="text-gray-600 mb-6">Visualisasi tren emosi Anda dan tim secara real-time</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Personal Mood Trends -->
                    <div class="chart-container">
                        <h3 class="text-lg font-semibold mb-4">Tren Mood Personal</h3>
                        <canvas id="personal-mood-chart"></canvas>
                    </div>
                    
                    <!-- Team Mood Distribution -->
                    <div class="chart-container">
                        <h3 class="text-lg font-semibold mb-4">Distribusi Mood Tim</h3>
                        <canvas id="team-mood-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <!-- Mood Stats Cards -->
                <div class="bg-white p-4 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-2">Mood Dominan</h3>
                    <div class="flex items-center">
                        <div id="dominant-mood-emoji" class="text-4xl mr-3">😊</div>
                        <div>
                            <p id="dominant-mood-text" class="font-bold text-xl">Senang</p>
                            <p class="text-gray-600">Minggu ini</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-2">Stabilitas Mood</h3>
                    <div class="flex items-center">
                        <div id="mood-stability-icon" class="text-4xl mr-3">📊</div>
                        <div>
                            <p id="mood-stability-text" class="font-bold text-xl">Stabil</p>
                            <p class="text-gray-600">Perubahan minimal</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold mb-2">Mood Tim</h3>
                    <div class="flex items-center">
                        <div id="team-mood-emoji" class="text-4xl mr-3">🙂</div>
                        <div>
                            <p id="team-mood-text" class="font-bold text-xl">Positif</p>
                            <p class="text-gray-600">Rata-rata tim</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 class="text-lg font-semibold mb-4">Riwayat Mood Terbaru</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="py-2 px-4 text-left">Tanggal</th>
                                <th class="py-2 px-4 text-left">Waktu</th>
                                <th class="py-2 px-4 text-left">Mood</th>
                                <th class="py-2 px-4 text-left">Catatan</th>
                            </tr>
                        </thead>
                        <tbody id="mood-history-table">
                            <!-- Data akan diisi melalui JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-lg font-semibold mb-4">Rekomendasi</h3>
                <div id="recommendations" class="space-y-3">
                    <!-- Rekomendasi akan diisi melalui JavaScript -->
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    },
    
    setupCharts: function() {
        this.createPersonalMoodChart();
        this.createTeamMoodChart();
        this.populateMoodHistory();
        this.updateMoodStats();
        this.generateRecommendations();
    },
    
    createPersonalMoodChart: function() {
        const ctx = document.getElementById('personal-mood-chart').getContext('2d');
        
        // Simulasi data untuk 7 hari terakhir
        const dates = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
        }
        
        // Simulasi nilai mood (0-3, di mana 0=sedih, 1=marah, 2=netral, 3=senang)
        const moodData = [1, 2, 2, 3, 3, 2, 3];
        
        // Buat chart
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Mood Harian',
                    data: moodData,
                    borderColor: '#6366F1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 3,
                        ticks: {
                            callback: function(value) {
                                const labels = ['Sedih', 'Marah', 'Netral', 'Senang'];
                                return labels[value];
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const labels = ['Sedih', 'Marah', 'Netral', 'Senang'];
                                return labels[context.raw];
                            }
                        }
                    }
                }
            }
        });
    },
    
    createTeamMoodChart: function() {
        const ctx = document.getElementById('team-mood-chart').getContext('2d');
        
        // Simulasi data distribusi mood tim
        const data = {
            labels: ['Senang', 'Netral', 'Marah', 'Sedih'],
            datasets: [{
                data: [8, 4, 2, 1],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.7)',  // Hijau untuk Senang
                    'rgba(234, 179, 8, 0.7)',   // Kuning untuk Netral
                    'rgba(239, 68, 68, 0.7)',   // Merah untuk Marah
                    'rgba(59, 130, 246, 0.7)'   // Biru untuk Sedih
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(234, 179, 8)',
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 1
            }]
        };
        
        // Buat chart
        const chart = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    },
    
    populateMoodHistory: function() {
        const tableBody = document.getElementById('mood-history-table');
        
        // Simulasi data riwayat mood
        const moodHistory = [
            { date: '2025-05-20', time: '09:30', mood: 'happy', note: 'Memulai hari dengan semangat' },
            { date: '2025-05-19', time: '14:15', mood: 'neutral', note: 'Rapat tim berjalan lancar' },
            { date: '2025-05-19', time: '10:00', mood: 'happy', note: 'Berhasil menyelesaikan tugas tepat waktu' },
            { date: '2025-05-18', time: '16:45', mood: 'angry', note: 'Deadline yang mendadak' },
            { date: '2025-05-18', time: '09:15', mood: 'neutral', note: 'Hari biasa' }
        ];
        
        // Mapping mood ke emoji
        const moodEmojis = {
            'happy': '😊',
            'neutral': '😐',
            'angry': '😠',
            'sad': '😢'
        };
        
        // Populate table
        let tableContent = '';
        moodHistory.forEach(entry => {
            const dateObj = new Date(entry.date);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            
            tableContent += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-2 px-4">${formattedDate}</td>
                    <td class="py-2 px-4">${entry.time}</td>
                    <td class="py-2 px-4">${moodEmojis[entry.mood]} ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</td>
                    <td class="py-2 px-4">${entry.note}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableContent;
    },
    
    updateMoodStats: function() {
        // Update dominant mood
        document.getElementById('dominant-mood-emoji').textContent = '😊';
        document.getElementById('dominant-mood-text').textContent = 'Senang';
        
        // Update mood stability
        document.getElementById('mood-stability-icon').textContent = '📊';
        document.getElementById('mood-stability-text').textContent = 'Stabil';
        
        // Update team mood
        document.getElementById('team-mood-emoji').textContent = '🙂';
        document.getElementById('team-mood-text').textContent = 'Positif';
    },
    
    generateRecommendations: function() {
        const recommendationsContainer = document.getElementById('recommendations');
        
        // Simulasi rekomendasi berdasarkan analisis mood
        const recommendations = [
            {
                title: 'Jaga Momentum Positif',
                description: 'Tim Anda memiliki tren mood positif. Pertahankan dengan memberikan apresiasi rutin dan feedback konstruktif.',
                icon: '🌟'
            },
            {
                title: 'Perhatikan Anggota Tim',
                description: 'Beberapa anggota tim menunjukkan fluktuasi mood. Jadwalkan one-on-one meeting untuk mendengarkan keluhan mereka.',
                icon: '👥'
            },
            {
                title: 'Rencanakan Aktivitas Tim',
                description: 'Mood tim cenderung meningkat setelah aktivitas bersama. Pertimbangkan untuk mengadakan team building atau outing.',
                icon: '🎯'
            }
        ];
        
        // Populate recommendations
        let recommendationsContent = '';
        recommendations.forEach(rec => {
            recommendationsContent += `
                <div class="flex items-start p-3 bg-indigo-50 rounded-lg">
                    <div class="text-2xl mr-3">${rec.icon}</div>
                    <div>
                        <h4 class="font-semibold">${rec.title}</h4>
                        <p class="text-gray-600">${rec.description}</p>
                    </div>
                </div>
            `;
        });
        
        recommendationsContainer.innerHTML = recommendationsContent;
    }
};

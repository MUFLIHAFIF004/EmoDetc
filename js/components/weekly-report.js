/**
 * Weekly Report Component
 * Bagian dari lapisan Output dalam arsitektur 3 lapisan
 */

const WeeklyReportComponent = {
    init: function(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
        this.loadReportData();
    },
    
    render: function() {
        const html = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-4 bg-indigo-600 text-white">
                    <h2 class="text-xl font-bold">Laporan Mingguan</h2>
                    <p class="text-sm text-indigo-200">Ringkasan mood, tren, dan interaksi tim</p>
                </div>
                
                <div class="p-6">
                    <!-- Report Header -->
                    <div class="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                            <h3 class="text-lg font-semibold" id="report-week">Minggu 20 - 26 Mei 2025</h3>
                            <p class="text-gray-600">Laporan otomatis dibuat setiap hari Senin</p>
                        </div>
                        
                        <div class="mt-4 md:mt-0">
                            <select id="week-selector" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="current">Minggu Ini</option>
                                <option value="previous">Minggu Lalu</option>
                                <option value="previous2">2 Minggu Lalu</option>
                            </select>
                            
                            <button id="download-report" class="ml-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                                Unduh PDF
                            </button>
                        </div>
                    </div>
                    
                    <!-- Report Summary -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="report-card">
                            <h4 class="font-semibold text-lg mb-2">Mood Dominan</h4>
                            <div class="flex items-center">
                                <div class="text-4xl mr-3">😊</div>
                                <div>
                                    <p class="font-bold text-xl">Senang (65%)</p>
                                    <p class="text-gray-600">Meningkat 5% dari minggu lalu</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="report-card">
                            <h4 class="font-semibold text-lg mb-2">Aktivitas Tim</h4>
                            <div class="flex items-center">
                                <div class="text-4xl mr-3">💬</div>
                                <div>
                                    <p class="font-bold text-xl">124 Pesan</p>
                                    <p class="text-gray-600">Rata-rata 17.7 per hari</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="report-card">
                            <h4 class="font-semibold text-lg mb-2">Partisipasi</h4>
                            <div class="flex items-center">
                                <div class="text-4xl mr-3">👥</div>
                                <div>
                                    <p class="font-bold text-xl">100%</p>
                                    <p class="text-gray-600">Semua anggota aktif</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mood Trends -->
                    <div class="report-card mb-6">
                        <h4 class="font-semibold text-lg mb-4">Tren Mood Mingguan</h4>
                        <canvas id="weekly-mood-chart" height="200"></canvas>
                    </div>
                    
                    <!-- Mood Distribution by Team Member -->
                    <div class="report-card mb-6">
                        <h4 class="font-semibold text-lg mb-4">Distribusi Mood per Anggota Tim</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full bg-white">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="py-2 px-4 text-left">Anggota Tim</th>
                                        <th class="py-2 px-4 text-center">Senang</th>
                                        <th class="py-2 px-4 text-center">Netral</th>
                                        <th class="py-2 px-4 text-center">Marah</th>
                                        <th class="py-2 px-4 text-center">Sedih</th>
                                        <th class="py-2 px-4 text-left">Mood Dominan</th>
                                    </tr>
                                </thead>
                                <tbody id="team-mood-table">
                                    <!-- Data akan diisi melalui JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Key Discussions -->
                    <div class="report-card mb-6">
                        <h4 class="font-semibold text-lg mb-4">Diskusi Penting</h4>
                        <div id="key-discussions">
                            <!-- Data akan diisi melalui JavaScript -->
                        </div>
                    </div>
                    
                    <!-- Recommendations -->
                    <div class="report-card">
                        <h4 class="font-semibold text-lg mb-4">Rekomendasi untuk Minggu Depan</h4>
                        <ul class="list-disc pl-5 space-y-2" id="recommendations">
                            <!-- Data akan diisi melalui JavaScript -->
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    },
    
    setupEventListeners: function() {
        const weekSelector = document.getElementById('week-selector');
        const downloadButton = document.getElementById('download-report');
        
        // Change week
        weekSelector.addEventListener('change', () => {
            this.loadReportData(weekSelector.value);
        });
        
        // Download report
        downloadButton.addEventListener('click', () => {
            this.downloadReport();
        });
    },
    
    loadReportData: function(weekOption = 'current') {
        // Update report title
        const reportWeek = document.getElementById('report-week');
        
        if (weekOption === 'current') {
            reportWeek.textContent = 'Minggu 20 - 26 Mei 2025';
        } else if (weekOption === 'previous') {
            reportWeek.textContent = 'Minggu 13 - 19 Mei 2025';
        } else if (weekOption === 'previous2') {
            reportWeek.textContent = 'Minggu 6 - 12 Mei 2025';
        }
        
        // Load mood distribution table
        this.loadTeamMoodTable();
        
        // Load key discussions
        this.loadKeyDiscussions();
        
        // Load recommendations
        this.loadRecommendations();
        
        // Create weekly mood chart
        this.createWeeklyMoodChart();
    },
    
    loadTeamMoodTable: function() {
        const tableBody = document.getElementById('team-mood-table');
        
        // Simulasi data distribusi mood tim
        const teamMoodData = [
            { name: 'Pengguna', happy: 70, neutral: 20, angry: 5, sad: 5, dominant: 'happy' },
            { name: 'Budi', happy: 60, neutral: 30, angry: 10, sad: 0, dominant: 'happy' },
            { name: 'Citra', happy: 40, neutral: 50, angry: 5, sad: 5, dominant: 'neutral' },
            { name: 'Deni', happy: 30, neutral: 30, angry: 35, sad: 5, dominant: 'angry' },
            { name: 'Eka', happy: 20, neutral: 30, angry: 10, sad: 40, dominant: 'sad' }
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
        teamMoodData.forEach(member => {
            tableContent += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-2 px-4 font-medium">${member.name}</td>
                    <td class="py-2 px-4 text-center">${member.happy}%</td>
                    <td class="py-2 px-4 text-center">${member.neutral}%</td>
                    <td class="py-2 px-4 text-center">${member.angry}%</td>
                    <td class="py-2 px-4 text-center">${member.sad}%</td>
                    <td class="py-2 px-4">
                        <div class="flex items-center">
                            <span class="mr-2">${moodEmojis[member.dominant]}</span>
                            <span>${member.dominant.charAt(0).toUpperCase() + member.dominant.slice(1)}</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableContent;
    },
    
    loadKeyDiscussions: function() {
        const keyDiscussions = document.getElementById('key-discussions');
        
        // Simulasi data diskusi penting
        const discussions = [
            {
                topic: 'Sprint Planning',
                date: '2025-05-20',
                participants: 5,
                summary: 'Diskusi tentang rencana sprint untuk minggu depan. Prioritas diberikan pada fitur dashboard dan integrasi API.',
                mood: 'neutral'
            },
            {
                topic: 'UI/UX Feedback',
                date: '2025-05-22',
                participants: 4,
                summary: 'Review desain UI baru. Beberapa perubahan minor diperlukan pada halaman profil pengguna.',
                mood: 'happy'
            },
            {
                topic: 'Bug Triage',
                date: '2025-05-23',
                participants: 3,
                summary: 'Identifikasi dan prioritas bug yang ditemukan selama pengujian. 3 bug kritis perlu diperbaiki segera.',
                mood: 'angry'
            }
        ];
        
        // Mapping mood ke warna
        const moodColors = {
            'happy': 'border-green-500',
            'neutral': 'border-yellow-500',
            'angry': 'border-red-500',
            'sad': 'border-blue-500'
        };
        
        // Populate discussions
        let discussionsContent = '';
        discussions.forEach(discussion => {
            const date = new Date(discussion.date);
            const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            
            discussionsContent += `
                <div class="p-3 mb-3 border-l-4 ${moodColors[discussion.mood]} bg-gray-50 rounded-r-lg">
                    <div class="flex justify-between items-start">
                        <h5 class="font-semibold">${discussion.topic}</h5>
                        <span class="text-sm text-gray-500">${formattedDate}</span>
                    </div>
                    <p class="text-gray-700 mt-1">${discussion.summary}</p>
                    <p class="text-sm text-gray-500 mt-2">${discussion.participants} peserta</p>
                </div>
            `;
        });
        
        keyDiscussions.innerHTML = discussionsContent;
    },
    
    loadRecommendations: function() {
        const recommendations = document.getElementById('recommendations');
        
        // Simulasi data rekomendasi
        const recommendationData = [
            'Adakan sesi one-on-one dengan Eka untuk membahas mood yang cenderung sedih',
            'Tingkatkan komunikasi tim dengan daily standup yang lebih terstruktur',
            'Rencanakan team building activity untuk meningkatkan mood tim secara keseluruhan',
            'Berikan apresiasi lebih sering untuk pekerjaan yang diselesaikan dengan baik'
        ];
        
        // Populate recommendations
        let recommendationsContent = '';
        recommendationData.forEach(recommendation => {
            recommendationsContent += `<li>${recommendation}</li>`;
        });
        
        recommendations.innerHTML = recommendationsContent;
    },
    
    createWeeklyMoodChart: function() {
        const ctx = document.getElementById('weekly-mood-chart').getContext('2d');
        
        // Simulasi data untuk 7 hari dalam seminggu
        const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        
        // Simulasi data mood (persentase)
        const happyData = [60, 65, 70, 65, 75, 60, 65];
        const neutralData = [25, 20, 15, 20, 15, 30, 25];
        const angryData = [10, 10, 10, 10, 5, 5, 5];
        const sadData = [5, 5, 5, 5, 5, 5, 5];
        
        // Buat chart
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Senang',
                        data: happyData,
                        backgroundColor: 'rgba(34, 197, 94, 0.7)'
                    },
                    {
                        label: 'Netral',
                        data: neutralData,
                        backgroundColor: 'rgba(234, 179, 8, 0.7)'
                    },
                    {
                        label: 'Marah',
                        data: angryData,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)'
                    },
                    {
                        label: 'Sedih',
                        data: sadData,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)'
                    }
                ]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribusi Mood Harian (%)'
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        max: 100
                    }
                }
            }
        });
    },
    
    downloadReport: function() {
        // Simulasi unduh laporan
        alert('Mengunduh laporan dalam format PDF...');
        console.log('Report download initiated');
        
        // In a real application, this would generate a PDF for download
    }
};

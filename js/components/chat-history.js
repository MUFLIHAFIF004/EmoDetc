/**
 * Chat History Component
 * Bagian dari lapisan Output dalam arsitektur 3 lapisan
 */

const ChatHistoryComponent = {
    init: function(container) {
        this.container = container;
        this.currentDate = new Date();
        this.render();
        this.setupEventListeners();
        this.loadChatHistory();
    },
    
    render: function() {
        const html = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-4 bg-indigo-600 text-white">
                    <h2 class="text-xl font-bold">Riwayat Chat</h2>
                    <p class="text-sm text-indigo-200">Lihat riwayat diskusi dan mood yang terkait</p>
                </div>
                
                <div class="p-4">
                    <!-- Filter Controls -->
                    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-gray-700 mb-2" for="date-filter">Filter Tanggal:</label>
                            <input type="date" id="date-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 mb-2" for="mood-filter">Filter Mood:</label>
                            <select id="mood-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Semua Mood</option>
                                <option value="happy">Senang</option>
                                <option value="neutral">Netral</option>
                                <option value="angry">Marah</option>
                                <option value="sad">Sedih</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 mb-2" for="user-filter">Filter Pengguna:</label>
                            <select id="user-filter" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Semua Pengguna</option>
                                <option value="user1">Pengguna</option>
                                <option value="user2">Budi</option>
                                <option value="user3">Citra</option>
                                <option value="user4">Deni</option>
                                <option value="user5">Eka</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Chat History Timeline -->
                    <div id="chat-history-timeline" class="space-y-6">
                        <!-- Chat history will be populated here -->
                    </div>
                    
                    <!-- Export Controls -->
                    <div class="mt-6 flex justify-end">
                        <button id="export-chat" class="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                            Ekspor Riwayat Chat
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    },
    
    setupEventListeners: function() {
        const dateFilter = document.getElementById('date-filter');
        const moodFilter = document.getElementById('mood-filter');
        const userFilter = document.getElementById('user-filter');
        const exportButton = document.getElementById('export-chat');
        
        // Set default date to today
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dateFilter.value = formattedDate;
        
        // Apply filters when changed
        dateFilter.addEventListener('change', () => {
            this.loadChatHistory();
        });
        
        moodFilter.addEventListener('change', () => {
            this.loadChatHistory();
        });
        
        userFilter.addEventListener('change', () => {
            this.loadChatHistory();
        });
        
        // Export chat history
        exportButton.addEventListener('click', () => {
            this.exportChatHistory();
        });
    },
    
    loadChatHistory: function() {
        const chatHistoryTimeline = document.getElementById('chat-history-timeline');
        const dateFilter = document.getElementById('date-filter');
        const moodFilter = document.getElementById('mood-filter');
        const userFilter = document.getElementById('user-filter');
        
        // Get filter values
        const selectedDate = dateFilter.value;
        const selectedMood = moodFilter.value;
        const selectedUser = userFilter.value;
        
        // Simulasi data pesan chat dari beberapa hari
        const chatHistory = [
            // Hari ini
            {
                date: '2025-05-20',
                messages: [
                    { id: 1, sender: 'user2', senderName: 'Budi', content: 'Selamat pagi semua! Bagaimana progress proyek kita?', timestamp: '2025-05-20T08:30:00', mood: 'happy' },
                    { id: 2, sender: 'user3', senderName: 'Citra', content: 'Saya sudah menyelesaikan desain UI untuk halaman utama.', timestamp: '2025-05-20T08:32:00', mood: 'neutral' },
                    { id: 3, sender: 'user4', senderName: 'Deni', content: 'Masih ada beberapa bug yang perlu diperbaiki di backend.', timestamp: '2025-05-20T08:35:00', mood: 'angry' },
                    { id: 4, sender: 'user1', senderName: 'Pengguna', content: 'Saya akan membantu memperbaiki bug tersebut.', timestamp: '2025-05-20T08:37:00', mood: 'neutral' }
                ]
            },
            // Kemarin
            {
                date: '2025-05-19',
                messages: [
                    { id: 5, sender: 'user5', senderName: 'Eka', content: 'Apakah ada yang bisa membantu saya dengan integrasi API?', timestamp: '2025-05-19T14:20:00', mood: 'sad' },
                    { id: 6, sender: 'user1', senderName: 'Pengguna', content: 'Saya bisa membantu, Eka. Mari kita diskusikan setelah meeting.', timestamp: '2025-05-19T14:22:00', mood: 'happy' },
                    { id: 7, sender: 'user3', senderName: 'Citra', content: 'Meeting dengan klien jam 3 sore, jangan lupa ya semua.', timestamp: '2025-05-19T14:25:00', mood: 'neutral' }
                ]
            },
            // Dua hari yang lalu
            {
                date: '2025-05-18',
                messages: [
                    { id: 8, sender: 'user2', senderName: 'Budi', content: 'Deadline proyek dipercepat menjadi minggu depan.', timestamp: '2025-05-18T10:15:00', mood: 'angry' },
                    { id: 9, sender: 'user4', senderName: 'Deni', content: 'Kita perlu mengadakan sprint planning ulang kalau begitu.', timestamp: '2025-05-18T10:18:00', mood: 'neutral' },
                    { id: 10, sender: 'user1', senderName: 'Pengguna', content: 'Setuju, mari kita atur jadwalnya.', timestamp: '2025-05-18T10:20:00', mood: 'neutral' }
                ]
            }
        ];
        
        // Filter chat history
        let filteredHistory = chatHistory;
        
        // Filter by date
        if (selectedDate) {
            filteredHistory = filteredHistory.filter(day => day.date === selectedDate);
        }
        
        // Apply additional filters to messages
        filteredHistory = filteredHistory.map(day => {
            let filteredMessages = day.messages;
            
            // Filter by mood
            if (selectedMood) {
                filteredMessages = filteredMessages.filter(msg => msg.mood === selectedMood);
            }
            
            // Filter by user
            if (selectedUser) {
                filteredMessages = filteredMessages.filter(msg => msg.sender === selectedUser);
            }
            
            return {
                date: day.date,
                messages: filteredMessages
            };
        });
        
        // Remove days with no messages after filtering
        filteredHistory = filteredHistory.filter(day => day.messages.length > 0);
        
        // Mapping mood ke warna
        const moodColors = {
            'happy': 'bg-green-500',
            'neutral': 'bg-yellow-500',
            'angry': 'bg-red-500',
            'sad': 'bg-blue-500'
        };
        
        // Render chat history
        let timelineHTML = '';
        
        if (filteredHistory.length === 0) {
            timelineHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>Tidak ada riwayat chat yang sesuai dengan filter.</p>
                </div>
            `;
        } else {
            filteredHistory.forEach(day => {
                const date = new Date(day.date);
                const formattedDate = date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                
                timelineHTML += `
                    <div class="chat-day">
                        <h3 class="text-lg font-semibold mb-3">${formattedDate}</h3>
                        <div class="space-y-4">
                `;
                
                day.messages.forEach(message => {
                    const messageTime = new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    
                    timelineHTML += `
                        <div class="p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center mb-1">
                                <span class="mood-indicator ${moodColors[message.mood]}" title="${message.mood}"></span>
                                <span class="font-semibold">${message.senderName}</span>
                                <span class="text-xs text-gray-500 ml-2">${messageTime}</span>
                            </div>
                            <p class="ml-6">${message.content}</p>
                        </div>
                    `;
                });
                
                timelineHTML += `
                        </div>
                    </div>
                `;
            });
        }
        
        chatHistoryTimeline.innerHTML = timelineHTML;
    },
    
    exportChatHistory: function() {
        // Simulasi ekspor chat history
        const dateFilter = document.getElementById('date-filter');
        const moodFilter = document.getElementById('mood-filter');
        const userFilter = document.getElementById('user-filter');
        
        // Get filter values for report
        const selectedDate = dateFilter.value ? new Date(dateFilter.value).toLocaleDateString('id-ID') : 'Semua tanggal';
        const selectedMood = moodFilter.value ? moodFilter.options[moodFilter.selectedIndex].text : 'Semua mood';
        const selectedUser = userFilter.value ? userFilter.options[userFilter.selectedIndex].text : 'Semua pengguna';
        
        alert(`Mengekspor riwayat chat dengan filter:\nTanggal: ${selectedDate}\nMood: ${selectedMood}\nPengguna: ${selectedUser}`);
        
        // In a real application, this would generate a file for download
        console.log('Chat history exported');
    }
};

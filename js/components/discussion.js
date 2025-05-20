/**
 * Discussion Component
 * Bagian dari lapisan Input dan Output dalam arsitektur 3 lapisan
 */

const DiscussionComponent = {
    init: function(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
        this.loadChatHistory();
    },
    
    render: function() {
        const html = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Chat Area - Takes 2/3 of the space on larger screens -->
                <div class="md:col-span-2">
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <div class="p-4 bg-indigo-600 text-white">
                            <h2 class="text-xl font-bold">Diskusi Grup</h2>
                            <p class="text-sm text-indigo-200">Diskusikan ide dan perasaan dengan tim Anda</p>
                        </div>
                        
                        <div class="chat-container">
                            <div id="chat-messages" class="chat-messages">
                                <!-- Chat messages will be populated here -->
                            </div>
                            
                            <div class="chat-input">
                                <form id="message-form" class="flex flex-col space-y-3">
                                    <div class="flex items-center space-x-2 mb-2">
                                        <span class="text-gray-700">Mood saat ini:</span>
                                        <div class="flex space-x-2">
                                            <div class="mood-selector cursor-pointer p-1 rounded-full" data-mood="happy">😊</div>
                                            <div class="mood-selector cursor-pointer p-1 rounded-full" data-mood="neutral">😐</div>
                                            <div class="mood-selector cursor-pointer p-1 rounded-full" data-mood="angry">😠</div>
                                            <div class="mood-selector cursor-pointer p-1 rounded-full" data-mood="sad">😢</div>
                                        </div>
                                    </div>
                                    
                                    <textarea id="message-input" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                        rows="3" placeholder="Ketik pesan Anda di sini..."></textarea>
                                    
                                    <button type="submit" class="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                                        Kirim Pesan
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Sidebar - Takes 1/3 of the space on larger screens -->
                <div>
                    <!-- Active Participants -->
                    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
                        <h3 class="text-lg font-semibold mb-3">Peserta Aktif</h3>
                        <ul id="active-participants" class="space-y-2">
                            <!-- Participants will be populated here -->
                        </ul>
                    </div>
                    
                    <!-- Discussion Topics -->
                    <div class="bg-white p-4 rounded-lg shadow-md">
                        <h3 class="text-lg font-semibold mb-3">Topik Diskusi</h3>
                        <ul class="space-y-2">
                            <li class="p-2 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100">
                                <span class="font-medium">Sprint Planning</span>
                            </li>
                            <li class="p-2 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100">
                                <span class="font-medium">UI/UX Feedback</span>
                            </li>
                            <li class="p-2 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100">
                                <span class="font-medium">Bug Triage</span>
                            </li>
                            <li class="p-2 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100">
                                <span class="font-medium">Team Building</span>
                            </li>
                        </ul>
                        
                        <div class="mt-4">
                            <button id="new-topic-btn" class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                + Topik Baru
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    },
    
    setupEventListeners: function() {
        const messageForm = document.getElementById('message-form');
        const moodSelectors = document.querySelectorAll('.mood-selector');
        const newTopicBtn = document.getElementById('new-topic-btn');
        
        // Set default mood
        this.selectedMood = appState.user.currentMood || 'neutral';
        this.highlightSelectedMood();
        
        // Mood selection
        moodSelectors.forEach(selector => {
            selector.addEventListener('click', () => {
                // Update selected mood
                this.selectedMood = selector.getAttribute('data-mood');
                
                // Update UI
                this.highlightSelectedMood();
            });
        });
        
        // Message submission
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const messageInput = document.getElementById('message-input');
            const messageContent = messageInput.value.trim();
            
            if (messageContent) {
                // Prepare message data
                const messageData = {
                    content: messageContent,
                    mood: this.selectedMood
                };
                
                // Save message using core function
                core.saveMessage(messageData)
                    .then(response => {
                        // Clear input
                        messageInput.value = '';
                        
                        // Reload chat
                        this.loadChatHistory();
                    })
                    .catch(error => {
                        console.error('Error sending message:', error);
                        alert('Gagal mengirim pesan. Silakan coba lagi.');
                    });
            }
        });
        
        // New topic button
        newTopicBtn.addEventListener('click', () => {
            const topicName = prompt('Masukkan nama topik baru:');
            if (topicName && topicName.trim()) {
                alert(`Topik baru "${topicName}" telah dibuat!`);
                // In a real app, this would save the new topic to the database
            }
        });
    },
    
    highlightSelectedMood: function() {
        const moodSelectors = document.querySelectorAll('.mood-selector');
        
        // Remove highlight from all selectors
        moodSelectors.forEach(selector => {
            selector.classList.remove('ring-2', 'ring-indigo-500');
        });
        
        // Add highlight to selected mood
        const selectedSelector = document.querySelector(`.mood-selector[data-mood="${this.selectedMood}"]`);
        if (selectedSelector) {
            selectedSelector.classList.add('ring-2', 'ring-indigo-500');
        }
    },
    
    loadChatHistory: function() {
        const chatMessages = document.getElementById('chat-messages');
        const activeParticipants = document.getElementById('active-participants');
        
        // Simulasi data pesan chat
        const messages = appState.chat.messages.length > 0 ? appState.chat.messages : [
            { id: 1, sender: 'user2', senderName: 'Budi', content: 'Selamat pagi semua! Bagaimana progress proyek kita?', timestamp: '2025-05-20T08:30:00', mood: 'happy' },
            { id: 2, sender: 'user3', senderName: 'Citra', content: 'Saya sudah menyelesaikan desain UI untuk halaman utama.', timestamp: '2025-05-20T08:32:00', mood: 'neutral' },
            { id: 3, sender: 'user4', senderName: 'Deni', content: 'Masih ada beberapa bug yang perlu diperbaiki di backend.', timestamp: '2025-05-20T08:35:00', mood: 'angry' },
            { id: 4, sender: 'user1', senderName: 'Pengguna', content: 'Saya akan membantu memperbaiki bug tersebut.', timestamp: '2025-05-20T08:37:00', mood: 'neutral' }
        ];
        
        // Simulasi data peserta aktif
        const participants = [
            { id: 'user1', name: 'Pengguna', mood: 'neutral', isOnline: true },
            { id: 'user2', name: 'Budi', mood: 'happy', isOnline: true },
            { id: 'user3', name: 'Citra', mood: 'neutral', isOnline: true },
            { id: 'user4', name: 'Deni', mood: 'angry', isOnline: true },
            { id: 'user5', name: 'Eka', mood: 'sad', isOnline: false }
        ];
        
        // Mapping mood ke emoji dan warna
        const moodEmojis = {
            'happy': '😊',
            'neutral': '😐',
            'angry': '😠',
            'sad': '😢'
        };
        
        const moodColors = {
            'happy': 'bg-green-500',
            'neutral': 'bg-yellow-500',
            'angry': 'bg-red-500',
            'sad': 'bg-blue-500'
        };
        
        // Render chat messages
        let messagesHTML = '';
        messages.forEach(message => {
            const isCurrentUser = message.sender === appState.user.id;
            const messageClass = isCurrentUser ? 'sent' : 'received';
            const messageTime = new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            messagesHTML += `
                <div class="message ${messageClass}">
                    <div class="flex items-center mb-1">
                        <span class="mood-indicator ${moodColors[message.mood]}" title="${message.mood}"></span>
                        <span class="font-semibold">${isCurrentUser ? 'Anda' : message.senderName}</span>
                        <span class="text-xs text-gray-500 ml-2">${messageTime}</span>
                    </div>
                    <p>${message.content}</p>
                </div>
            `;
        });
        
        chatMessages.innerHTML = messagesHTML;
        
        // Auto-scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Render active participants
        let participantsHTML = '';
        participants.forEach(participant => {
            participantsHTML += `
                <li class="flex items-center justify-between">
                    <div class="flex items-center">
                        <span class="mood-indicator ${moodColors[participant.mood]}" title="${participant.mood}"></span>
                        <span>${participant.name}</span>
                    </div>
                    <span class="text-xs ${participant.isOnline ? 'text-green-500' : 'text-gray-400'}">
                        ${participant.isOnline ? 'Online' : 'Offline'}
                    </span>
                </li>
            `;
        });
        
        activeParticipants.innerHTML = participantsHTML;
    }
};

/**
 * Discussion Component
 * Parte da camada de entrada (Input Layer) e saída (Output Layer) na arquitetura de 3 camadas
 */

const DiscussionComponent = {
    container: null,
    selectedMood: 'neutral', // Default mood
    
    init: function(container) {
        this.container = container;
        this.selectedMood = appState.user.currentMood || 'neutral';
        this.setupEventListeners();
        this.loadChatHistory();
        this.highlightSelectedMood();
    },
    
    setupEventListeners: function() {
        // Setup mood selectors
        const moodSelectors = document.querySelectorAll('.mood-selector');
        moodSelectors.forEach(selector => {
            selector.addEventListener('click', () => {
                const mood = selector.getAttribute('data-mood');
                this.selectedMood = mood;
                this.highlightSelectedMood();
                
                // Update app state
                appState.user.currentMood = mood;
            });
        });
        
        // Setup message form
        const messageForm = document.getElementById('message-form');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
        
        // Setup new topic button
        const newTopicBtn = document.getElementById('new-topic-btn');
        if (newTopicBtn) {
            newTopicBtn.addEventListener('click', () => {
                const topic = prompt('Masukkan topik diskusi baru:');
                if (topic && topic.trim() !== '') {
                    this.addNewTopic(topic);
                }
            });
        }
    },
    
    highlightSelectedMood: function() {
        // Remove highlight from all selectors
        const moodSelectors = document.querySelectorAll('.mood-selector');
        const moodOptions = document.querySelectorAll('.mood-option');
        
        moodSelectors.forEach(selector => {
            selector.classList.remove('ring-2', 'ring-indigo-500');
            selector.classList.remove('scale-110');
        });
        
        moodOptions.forEach(option => {
            option.classList.remove('font-bold');
        });
        
        // Add highlight to selected selector
        const selectedSelector = document.querySelector(`.mood-selector[data-mood="${this.selectedMood}"]`);
        if (selectedSelector) {
            selectedSelector.classList.add('ring-2', 'ring-indigo-500');
            selectedSelector.classList.add('scale-110');
            
            // Also highlight the parent mood option
            const parentOption = selectedSelector.closest('.mood-option');
            if (parentOption) {
                parentOption.classList.add('font-bold');
            }
        }
    },
    
    sendMessage: function() {
        const messageInput = document.getElementById('message-input');
        const content = messageInput.value.trim();
        
        if (content === '') return;
        
        // Clear input
        messageInput.value = '';
        
        // Save message to app state
        core.saveChatMessage({
            content: content,
            mood: this.selectedMood
        })
        .then(() => {
            // Reload chat history
            this.loadChatHistory();
        })
        .catch(error => {
            console.error('Error sending message:', error);
            alert('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
        });
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
        
        // Mapping mood ke warna
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
                    <div class="flex items-center mb-2">
                        <div class="flex items-center">
                            <span class="mood-indicator ${moodColors[message.mood]}"></span>
                            <span class="font-semibold text-${isCurrentUser ? 'white' : 'gray-800'}">${isCurrentUser ? 'Anda' : message.senderName}</span>
                        </div>
                        <span class="text-xs ${isCurrentUser ? 'text-indigo-100' : 'text-gray-500'} ml-2">${messageTime}</span>
                    </div>
                    <p class="${isCurrentUser ? 'text-white' : 'text-gray-800'} text-base">${message.content}</p>
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
                <li class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <span class="mood-indicator ${moodColors[participant.mood]} mr-2"></span>
                        <span class="font-medium">${participant.name}</span>
                    </div>
                    <span class="text-sm px-2 py-1 rounded-full ${participant.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                        ${participant.isOnline ? 'Online' : 'Offline'}
                    </span>
                </li>
            `;
        });
        
        activeParticipants.innerHTML = participantsHTML;
    },
    
    addNewTopic: function(topic) {
        const topicsList = document.querySelector('.bg-white:nth-of-type(2) ul');
        if (!topicsList) return;
        
        // Add new topic to the list
        const topicItem = document.createElement('li');
        topicItem.className = 'p-2 bg-gray-100 rounded-lg';
        topicItem.textContent = topic;
        
        // Add click event to select topic
        topicItem.addEventListener('click', () => {
            // Remove active class from all topics
            const topics = topicsList.querySelectorAll('li');
            topics.forEach(t => t.className = 'p-2 bg-gray-100 rounded-lg');
            
            // Add active class to selected topic
            topicItem.className = 'p-2 bg-indigo-100 rounded-lg';
        });
        
        topicsList.appendChild(topicItem);
    }
};

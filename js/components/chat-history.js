/**
 * Chat History Component
 * Parte da camada de saída (Output Layer) na arquitetura de 3 camadas
 */

const ChatHistoryComponent = {
    container: null,
    
    init: function(container) {
        this.container = container;
        this.setupEventListeners();
        this.loadChatHistory();
    },
    
    setupEventListeners: function() {
        // Setup filter button
        const applyFilterBtn = document.getElementById('apply-filter-btn');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        // Setup export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportChatHistory();
            });
        }
        
        // Setup history item click events
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                this.showMessageDetails(item);
            });
        });
    },
    
    loadChatHistory: function() {
        // Get chat history from app state
        core.getChatHistory()
            .then(messages => {
                if (messages.length === 0) {
                    // If no messages, show empty state
                    this.showEmptyState();
                    return;
                }
                
                // Render messages
                this.renderChatHistory(messages);
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
                this.showErrorState();
            });
    },
    
    renderChatHistory: function(messages) {
        const historyList = document.getElementById('chat-history-list');
        if (!historyList) return;
        
        // Clear existing items
        historyList.innerHTML = '';
        
        // Mapping mood ke warna
        const moodColors = {
            'happy': 'bg-green-500',
            'neutral': 'bg-yellow-500',
            'angry': 'bg-red-500',
            'sad': 'bg-blue-500'
        };
        
        // Sort messages by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Render each message
        messages.forEach(message => {
            const date = new Date(message.timestamp);
            const dateStr = date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            const timeStr = date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Format date for data attribute (YYYY-MM-DD)
            const dateFormatted = date.toISOString().split('T')[0];
            
            const messageHTML = `
                <div class="p-4 history-item" data-mood="${message.mood}" data-user="${message.sender}" data-date="${dateFormatted}">
                    <div class="flex items-start">
                        <div class="mood-indicator ${moodColors[message.mood]} mt-1 mr-3"></div>
                        <div class="flex-grow">
                            <div class="flex items-center text-sm text-gray-500 mb-1">
                                <span class="font-medium mr-2">${message.senderName}</span>
                                <span>${dateStr}, ${timeStr}</span>
                            </div>
                            <p class="text-gray-800">${message.content}</p>
                        </div>
                    </div>
                </div>
            `;
            
            historyList.insertAdjacentHTML('beforeend', messageHTML);
        });
        
        // Add click events to new items
        const historyItems = historyList.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                this.showMessageDetails(item);
            });
        });
    },
    
    showEmptyState: function() {
        const historyList = document.getElementById('chat-history-list');
        if (!historyList) return;
        
        historyList.innerHTML = `
            <div class="p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Belum ada riwayat chat</h3>
                <p class="mt-2 text-gray-500">Mulai diskusi untuk melihat riwayat chat di sini.</p>
                <a href="discussion.html" class="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Mulai Diskusi
                </a>
            </div>
        `;
    },
    
    showErrorState: function() {
        const historyList = document.getElementById('chat-history-list');
        if (!historyList) return;
        
        historyList.innerHTML = `
            <div class="p-8 text-center">
                <svg class="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Terjadi kesalahan</h3>
                <p class="mt-2 text-gray-500">Tidak dapat memuat riwayat chat. Silakan coba lagi nanti.</p>
                <button id="retry-btn" class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Coba Lagi
                </button>
            </div>
        `;
        
        // Setup retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadChatHistory();
            });
        }
    },
    
    applyFilters: function() {
        const dateFilter = document.getElementById('date-filter').value;
        const moodFilter = document.getElementById('mood-filter').value;
        const userFilter = document.getElementById('user-filter').value;
        
        const historyItems = document.querySelectorAll('.history-item');
        
        historyItems.forEach(item => {
            const itemMood = item.getAttribute('data-mood');
            const itemUser = item.getAttribute('data-user');
            const itemDate = item.getAttribute('data-date');
            
            let showItem = true;
            
            // Apply date filter
            if (dateFilter !== 'all') {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                
                if (dateFilter === 'today' && itemDate !== today) {
                    showItem = false;
                } else if (dateFilter === 'yesterday' && itemDate !== yesterday) {
                    showItem = false;
                } else if (dateFilter === 'week') {
                    // Check if date is within the last 7 days
                    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
                    if (itemDate < weekAgo) {
                        showItem = false;
                    }
                } else if (dateFilter === 'month') {
                    // Check if date is within the last 30 days
                    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
                    if (itemDate < monthAgo) {
                        showItem = false;
                    }
                }
            }
            
            // Apply mood filter
            if (moodFilter !== 'all' && itemMood !== moodFilter) {
                showItem = false;
            }
            
            // Apply user filter
            if (userFilter !== 'all' && itemUser !== userFilter) {
                showItem = false;
            }
            
            // Show or hide item
            item.style.display = showItem ? 'block' : 'none';
        });
        
        // Show message if no results
        const visibleItems = Array.from(historyItems).filter(item => item.style.display !== 'none');
        const historyList = document.getElementById('chat-history-list');
        
        if (visibleItems.length === 0 && historyList) {
            // Check if no results message already exists
            if (!document.getElementById('no-results-message')) {
                const noResultsMessage = document.createElement('div');
                noResultsMessage.id = 'no-results-message';
                noResultsMessage.className = 'p-8 text-center';
                noResultsMessage.innerHTML = `
                    <h3 class="text-lg font-medium text-gray-900">Tidak ada hasil</h3>
                    <p class="mt-2 text-gray-500">Tidak ada pesan yang cocok dengan filter yang dipilih.</p>
                    <button id="reset-filter-btn" class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                        Reset Filter
                    </button>
                `;
                
                historyList.appendChild(noResultsMessage);
                
                // Setup reset filter button
                const resetFilterBtn = document.getElementById('reset-filter-btn');
                if (resetFilterBtn) {
                    resetFilterBtn.addEventListener('click', () => {
                        document.getElementById('date-filter').value = 'all';
                        document.getElementById('mood-filter').value = 'all';
                        document.getElementById('user-filter').value = 'all';
                        this.applyFilters();
                    });
                }
            }
        } else {
            // Remove no results message if it exists
            const noResultsMessage = document.getElementById('no-results-message');
            if (noResultsMessage) {
                noResultsMessage.remove();
            }
        }
    },
    
    showMessageDetails: function(item) {
        // Get message data
        const mood = item.getAttribute('data-mood');
        const user = item.getAttribute('data-user');
        const date = item.getAttribute('data-date');
        const content = item.querySelector('p').textContent;
        const senderName = item.querySelector('.font-medium').textContent;
        const timestamp = item.querySelector('.text-gray-500 span:last-child').textContent;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'message-detail-modal';
        
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
        
        const moodTexts = {
            'happy': 'Senang',
            'neutral': 'Netral',
            'angry': 'Marah',
            'sad': 'Sedih'
        };
        
        // Create modal content
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-900">Detail Pesan</h3>
                    <button id="close-modal-btn" class="text-gray-400 hover:text-gray-500">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-4">
                    <div class="mb-4">
                        <div class="text-sm text-gray-500 mb-1">Pengirim</div>
                        <div class="font-medium">${senderName}</div>
                    </div>
                    <div class="mb-4">
                        <div class="text-sm text-gray-500 mb-1">Waktu</div>
                        <div>${timestamp}</div>
                    </div>
                    <div class="mb-4">
                        <div class="text-sm text-gray-500 mb-1">Mood</div>
                        <div class="flex items-center">
                            <div class="mood-indicator ${moodColors[mood]} mr-2"></div>
                            <span>${moodEmojis[mood]} ${moodTexts[mood]}</span>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-sm text-gray-500 mb-1">Pesan</div>
                        <div class="p-3 bg-gray-50 rounded-lg">${content}</div>
                    </div>
                </div>
                <div class="p-4 border-t border-gray-200 flex justify-end">
                    <button id="close-btn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors mr-2">
                        Tutup
                    </button>
                    <button id="reply-btn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                        Balas
                    </button>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Setup close buttons
        const closeModalBtn = document.getElementById('close-modal-btn');
        const closeBtn = document.getElementById('close-btn');
        
        const closeModal = () => {
            modal.remove();
        };
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        
        // Setup reply button
        const replyBtn = document.getElementById('reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                closeModal();
                window.location.href = 'discussion.html';
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    },
    
    exportChatHistory: function() {
        // In a real application, this would generate a CSV file
        alert('Fitur export akan mengunduh riwayat chat dalam format CSV. Fitur ini belum diimplementasikan sepenuhnya.');
        console.log('Export chat history requested');
    }
};

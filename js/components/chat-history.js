/**
 * Chat History Component
 * Bagian dari lapisan output (Output Layer) dalam arsitektur 3 lapis
 */

const ChatHistoryComponent = {
    container: null,
    
    /**
     * Initialize the chat history component
     * @param {HTMLElement} container - The container element for the chat history
     */
    init: function(container) {
        this.container = container || document;
        this.setupEventListeners();
        this.loadChatHistory();
    },
    
    /**
     * Set up event listeners for the component
     */
    setupEventListeners: function() {
        // Setup filter button
        const applyFilterBtn = this.container.getElementById('apply-filter-btn');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => this.applyFilters());
        }
        
        // Setup export button
        const exportBtn = this.container.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportChatHistory());
        }
        
        // Setup retry button if error state is shown
        const retryBtn = this.container.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadChatHistory());
        }
    },
    
    /**
     * Load chat history from the mock data service
     */
    loadChatHistory: function() {
        // Show loading state
        const historyList = document.getElementById('chat-history-list');
        if (historyList) {
            historyList.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Memuat riwayat chat...</p>
                </div>`;
        }
        
        // Load chat history from mock data service
        MockDataService.getChatHistory()
            .then(messages => {
                if (messages && messages.length > 0) {
                    this.renderChatHistory(messages);
                } else {
                    this.showEmptyState();
                }
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
                this.showErrorState();
            });
    },
    
    /**
     * Render chat history messages
     * @param {Array} messages - Array of message objects
     */
    renderChatHistory: function(messages) {
        const historyList = document.getElementById('chat-history-list');
        if (!historyList) return;
        
        if (!messages || messages.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Sort messages by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Group messages by date
        const groupedMessages = {};
        messages.forEach(message => {
            const date = new Date(message.timestamp).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!groupedMessages[date]) {
                groupedMessages[date] = [];
            }
            
            groupedMessages[date].push(message);
        });
        
        // Render messages by date
        let html = '';
        for (const [date, dateMessages] of Object.entries(groupedMessages)) {
            html += `
                <div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <span class="text-sm font-medium text-gray-500">${date}</span>
                </div>`;
                
            dateMessages.forEach(message => {
                const time = new Date(message.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const moodClass = `mood-${message.mood || 'neutral'}`;
                const moodLabel = {
                    'happy': 'Senang',
                    'sad': 'Sedih',
                    'angry': 'Marah',
                    'neutral': 'Biasa saja'
                }[message.mood] || 'Tidak diketahui';
                
                // Get user info
                const user = MockDataService.users.find(u => u.id === message.sender) || { name: 'Unknown', avatar: '?' };
                const userInitial = user.name.charAt(0).toUpperCase();
                
                html += `
                <div class="history-item" data-mood="${message.mood}" data-user="${message.sender}" data-date="${message.timestamp.split('T')[0]}">
                    <div class="history-header">
                        <div class="history-user">
                            <div class="user-avatar" style="background-color: ${this.getUserColor(user.id)}">
                                ${userInitial}
                            </div>
                            <div class="user-info">
                                <h4>${user.name}</h4>
                                <p>
                                    <span class="mood-indicator ${moodClass}" title="${moodLabel}"></span>
                                    ${moodLabel}
                                </p>
                            </div>
                        </div>
                        <div class="history-time">${time}</div>
                    </div>
                    <div class="history-content">
                        ${message.content}
                    </div>
                </div>`;
            });
        }
        
        historyList.innerHTML = html;
        
        // Add click handlers to history items
        const historyItems = historyList.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => this.showMessageDetails(item));
        });
    },
    
    /**
     * Generate a consistent color for a user based on their ID
     * @param {string} userId - The user ID
     * @returns {string} HSL color string
     */
    getUserColor: function(userId) {
        // Simple hash function to generate a color from user ID
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Generate a pastel color
        const hue = hash % 360;
        return `hsl(${hue}, 90%, 85%)`;
    },
    
    /**
     * Show details of a specific message in a modal
     * @param {HTMLElement} item - The clicked message element
     */
    showMessageDetails: function(item) {
        const mood = item.getAttribute('data-mood');
        const userId = item.getAttribute('data-user');
        const date = item.getAttribute('data-date');
        const content = item.querySelector('.history-content')?.textContent || '';
        
        // Get user info
        const user = MockDataService.users.find(u => u.id === userId) || { name: 'Unknown', avatar: '?' };
        const userInitial = user.name.charAt(0).toUpperCase();
        
        // Mood info
        const moodInfo = {
            'happy': { label: 'Senang', color: 'text-green-600 bg-green-100' },
            'neutral': { label: 'Biasa saja', color: 'text-yellow-600 bg-yellow-100' },
            'sad': { label: 'Sedih', color: 'text-blue-600 bg-blue-100' },
            'angry': { label: 'Marah', color: 'text-red-600 bg-red-100' }
        }[mood] || { label: 'Tidak diketahui', color: 'text-gray-600 bg-gray-100' };
        
        // Create modal HTML
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                    <div class="p-6">
                        <div class="flex justify-between items-start">
                            <div class="flex items-center space-x-4">
                                <div class="user-avatar text-xl" style="background-color: ${this.getUserColor(userId)}; width: 3rem; height: 3rem;">
                                    ${userInitial}
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">${user.name}</h3>
                                    <div class="flex items-center mt-1">
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${moodInfo.color}">
                                            ${moodInfo.label}
                                        </span>
                                        <span class="ml-2 text-sm text-gray-500">${new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                            <button id="close-modal-btn" class="text-gray-400 hover:text-gray-500">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div class="mt-6 text-gray-700">
                            <p>${content}</p>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                        <button id="close-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Tutup
                        </button>
                        <button id="reply-btn" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Balas
                        </button>
                    </div>
                </div>
            </div>`;
        
        // Add modal to the page
        const modal = document.createElement('div');
        modal.id = 'message-modal';
        modal.innerHTML = modalHTML;
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButtons = modal.querySelectorAll('#close-modal-btn, #close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
        
        // Setup reply button
        const replyBtn = modal.querySelector('#reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                window.location.href = 'discussion.html';
            });
        }
        
        // Close when clicking outside the modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    },
    
    /**
     * Apply filters to the chat history
     */
    applyFilters: function() {
        const dateFilter = document.getElementById('date-filter')?.value || 'all';
        const moodFilter = document.getElementById('mood-filter')?.value || 'all';
        const userFilter = document.getElementById('user-filter')?.value || 'all';
        
        // Show loading state
        const historyList = document.getElementById('chat-history-list');
        if (historyList) {
            historyList.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Menerapkan filter...</p>
                </div>`;
        }
        
        // Get filtered messages from mock data service
        MockDataService.getFilteredChatHistory({
            date: dateFilter,
            mood: moodFilter,
            user: userFilter
        })
        .then(messages => {
            if (messages && messages.length > 0) {
                this.renderChatHistory(messages);
            } else {
                this.showEmptyState();
            }
        })
        .catch(error => {
            console.error('Error applying filters:', error);
            this.showErrorState();
        });
    },
    
    /**
     * Show empty state when no messages are found
     */
    showEmptyState: function() {
        const historyList = document.getElementById('chat-history-list');
        if (!historyList) return;
        
        historyList.innerHTML = `
            <div class="empty-state">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Belum ada riwayat chat</h3>
                <p class="mt-2 text-gray-500">Mulai diskusi untuk melihat riwayat chat di sini.</p>
                <a href="discussion.html" class="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Mulai Diskusi
                </a>
            </div>`;
    },
    
    /**
     * Show error state when loading chat history fails
     */
    showErrorState: function() {
        const historyList = document.getElementById('chat-history-list');
        if (!historyList) return;
        
        historyList.innerHTML = `
            <div class="empty-state">
                <svg class="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Terjadi kesalahan</h3>
                <p class="mt-2 text-gray-500">Tidak dapat memuat riwayat chat. Silakan coba lagi nanti.</p>
                <button id="retry-btn" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Coba Lagi
                </button>
            </div>`;
        
        // Setup retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadChatHistory();
            });
        }
    },
    
    /**
     * Export chat history to CSV
     */
    exportChatHistory: function() {
        // In a real application, this would generate a CSV file
        alert('Fitur export akan mengunduh riwayat chat dalam format CSV. Fitur ini belum diimplementasikan sepenuhnya.');
        console.log('Export chat history requested');
    }
};

// Initialize the chat history component when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    ChatHistoryComponent.init(document);
});

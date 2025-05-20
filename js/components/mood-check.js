/**
 * Mood Check Component
 * Parte da camada de entrada (Input Layer) na arquitetura de 3 camadas
 */

const MoodCheckComponent = {
    container: null,
    
    init: function(container) {
        this.container = container;
        this.setupEventListeners();
        this.loadMoodHistory();
    },
    
    setupEventListeners: function() {
        // Setup mood selectors
        const moodSelectors = document.querySelectorAll('.mood-color-large');
        
        moodSelectors.forEach(selector => {
            selector.addEventListener('click', (e) => {
                e.preventDefault();
                
                const mood = selector.getAttribute('data-mood');
                
                // Save mood data
                core.saveMoodData({
                    mood: mood,
                    source: 'manual'
                })
                .then(() => {
                    // Reload mood history
                    this.loadMoodHistory();
                    
                    // Show success message
                    this.showNotification('Mood berhasil disimpan!', 'success');
                    
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                })
                .catch(error => {
                    console.error('Error saving mood:', error);
                    this.showNotification('Terjadi kesalahan saat menyimpan mood. Silakan coba lagi.', 'error');
                });
            });
        });
    },
    
    loadMoodHistory: function() {
        const historyTable = document.getElementById('mood-history-table');
        if (!historyTable) return;
        
        // Get mood history from app state
        core.getMoodHistory(7)
            .then(history => {
                if (history.length === 0) {
                    historyTable.innerHTML = `
                        <tr>
                            <td colspan="3" class="py-4 text-center text-gray-500">
                                Belum ada riwayat mood.
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                // Mapping mood ke warna
                const moodColors = {
                    'happy': 'bg-green-500',
                    'neutral': 'bg-yellow-500',
                    'angry': 'bg-red-500',
                    'sad': 'bg-blue-500'
                };
                
                // Mapping mood ke teks
                const moodTexts = {
                    'happy': 'Senang',
                    'neutral': 'Netral',
                    'angry': 'Marah',
                    'sad': 'Sedih'
                };
                
                // Render mood history
                let historyHTML = '';
                
                history.forEach(item => {
                    const date = new Date(item.timestamp);
                    const dateStr = date.toLocaleDateString('id-ID', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                    });
                    const timeStr = date.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    historyHTML += `
                        <tr>
                            <td class="py-2 px-4 border-b border-gray-200">${dateStr}</td>
                            <td class="py-2 px-4 border-b border-gray-200">${timeStr}</td>
                            <td class="py-2 px-4 border-b border-gray-200">
                                <div class="flex items-center">
                                    <div class="mood-indicator ${moodColors[item.mood]} mr-2"></div>
                                    <span>${moodTexts[item.mood]}</span>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                
                historyTable.innerHTML = historyHTML;
            })
            .catch(error => {
                console.error('Error loading mood history:', error);
                historyTable.innerHTML = `
                    <tr>
                        <td colspan="3" class="py-4 text-center text-red-500">
                            Terjadi kesalahan saat memuat riwayat mood.
                        </td>
                    </tr>
                `;
            });
    },
    
    showNotification: function(message, type = 'info') {
        // Check if notification container exists
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            // Create notification container
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container fixed top-4 right-4 z-50';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification p-4 rounded-lg shadow-lg mb-4 flex items-center justify-between ${
            type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
            type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
            'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="mr-3">
                    ${type === 'success' ? 
                        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
                        type === 'error' ?
                        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' :
                        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                    }
                </div>
                <p>${message}</p>
            </div>
            <button class="ml-4 text-gray-500 hover:text-gray-800">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        
        // Add notification to container
        notificationContainer.appendChild(notification);
        
        // Setup close button
        const closeButton = notification.querySelector('button');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

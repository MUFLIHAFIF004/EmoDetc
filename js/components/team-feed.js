/**
 * Team Feed Component
 * Bagian dari lapisan Input dan Output dalam arsitektur 3 lapisan
 */

const TeamFeedComponent = {
    init: function(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
        this.loadFeedItems();
    },
    
    render: function() {
        const html = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Feed Form - Takes 1/3 of the space on larger screens -->
                <div>
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <h2 class="text-2xl font-bold mb-6 text-indigo-700">Berikan Feedback</h2>
                        
                        <form id="feedback-form" class="space-y-4">
                            <div>
                                <label class="block text-gray-700 mb-2" for="feedback-target">Untuk Anggota Tim:</label>
                                <select id="feedback-target" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Seluruh Tim</option>
                                    <option value="user2">Budi</option>
                                    <option value="user3">Citra</option>
                                    <option value="user4">Deni</option>
                                    <option value="user5">Eka</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 mb-2" for="feedback-content">Pesan Feedback:</label>
                                <textarea id="feedback-content" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    rows="5" placeholder="Berikan feedback yang konstruktif..."></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-gray-700 mb-2">Sentimen Feedback:</label>
                                <div class="flex space-x-4">
                                    <label class="flex items-center">
                                        <input type="radio" name="feedback-sentiment" value="positive" class="mr-2" checked>
                                        <span class="text-green-600">Positif</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="feedback-sentiment" value="neutral" class="mr-2">
                                        <span class="text-yellow-600">Netral</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="feedback-sentiment" value="negative" class="mr-2">
                                        <span class="text-red-600">Negatif</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="feedback-anonymous" class="mr-2">
                                    <span>Kirim secara anonim</span>
                                </label>
                            </div>
                            
                            <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                                Kirim Feedback
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- Feed Timeline - Takes 2/3 of the space on larger screens -->
                <div class="md:col-span-2">
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-indigo-700">Feed Tim</h2>
                            
                            <div>
                                <select id="feed-filter" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="all">Semua Feedback</option>
                                    <option value="positive">Positif</option>
                                    <option value="neutral">Netral</option>
                                    <option value="negative">Negatif</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="feed-timeline" class="space-y-4">
                            <!-- Feed items will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    },
    
    setupEventListeners: function() {
        const feedbackForm = document.getElementById('feedback-form');
        const feedFilter = document.getElementById('feed-filter');
        
        // Submit feedback
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const targetUser = document.getElementById('feedback-target').value;
            const content = document.getElementById('feedback-content').value.trim();
            const sentimentRadios = document.getElementsByName('feedback-sentiment');
            const isAnonymous = document.getElementById('feedback-anonymous').checked;
            
            // Get selected sentiment
            let sentiment;
            for (const radio of sentimentRadios) {
                if (radio.checked) {
                    sentiment = radio.value;
                    break;
                }
            }
            
            if (!content) {
                alert('Silakan masukkan pesan feedback');
                return;
            }
            
            // Prepare feedback data
            const feedbackData = {
                targetUser: targetUser,
                content: content,
                sentiment: sentiment,
                isAnonymous: isAnonymous
            };
            
            // Save feedback using core function
            core.saveFeedback(feedbackData)
                .then(response => {
                    // Show success message
                    alert('Feedback berhasil dikirim!');
                    
                    // Reset form
                    feedbackForm.reset();
                    
                    // Reload feed items
                    this.loadFeedItems();
                })
                .catch(error => {
                    console.error('Error sending feedback:', error);
                    alert('Gagal mengirim feedback. Silakan coba lagi.');
                });
        });
        
        // Filter feed items
        feedFilter.addEventListener('change', () => {
            this.loadFeedItems(feedFilter.value);
        });
    },
    
    loadFeedItems: function(filter = 'all') {
        const feedTimeline = document.getElementById('feed-timeline');
        
        // Simulasi data feedback
        const feedItems = appState.feedbacks.length > 0 ? appState.feedbacks : [
            {
                id: 'feed_1',
                timestamp: '2025-05-20T09:45:00',
                sender: 'user2',
                senderName: 'Budi',
                content: 'Terima kasih atas bantuan dalam menyelesaikan bug di modul autentikasi. Kerjasama tim yang sangat baik!',
                sentiment: 'positive',
                targetUser: null,
                isAnonymous: false
            },
            {
                id: 'feed_2',
                timestamp: '2025-05-19T14:30:00',
                sender: 'user3',
                senderName: 'Citra',
                content: 'Meeting kemarin berjalan cukup efektif, tapi kita perlu lebih fokus pada agenda. Beberapa poin penting tidak dibahas tuntas.',
                sentiment: 'neutral',
                targetUser: null,
                isAnonymous: false
            },
            {
                id: 'feed_3',
                timestamp: '2025-05-18T16:15:00',
                sender: 'anonymous',
                senderName: 'Anonim',
                content: 'Deadline yang mendadak membuat kualitas kode menurun. Kita perlu komunikasi yang lebih baik dengan tim manajemen.',
                sentiment: 'negative',
                targetUser: null,
                isAnonymous: true
            },
            {
                id: 'feed_4',
                timestamp: '2025-05-17T11:20:00',
                sender: 'user4',
                senderName: 'Deni',
                content: 'Desain UI baru sangat intuitif dan user-friendly. Great job, Citra!',
                sentiment: 'positive',
                targetUser: 'user3',
                isAnonymous: false
            }
        ];
        
        // Filter feed items
        let filteredItems = feedItems;
        if (filter !== 'all') {
            filteredItems = feedItems.filter(item => item.sentiment === filter);
        }
        
        // Sort by timestamp (newest first)
        filteredItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Render feed items
        if (filteredItems.length === 0) {
            feedTimeline.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>Tidak ada feedback yang sesuai dengan filter.</p>
                </div>
            `;
            return;
        }
        
        let timelineHTML = '';
        filteredItems.forEach(item => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            // Determine sentiment class
            const sentimentClass = item.sentiment === 'positive' ? 'positive' : 
                                  item.sentiment === 'negative' ? 'negative' : 'neutral';
            
            // Determine sender display name
            const senderDisplay = item.isAnonymous ? 'Anonim' : item.senderName;
            
            // Determine target display
            const targetDisplay = item.targetUser ? 
                ` untuk ${item.targetUser === 'user2' ? 'Budi' : 
                           item.targetUser === 'user3' ? 'Citra' : 
                           item.targetUser === 'user4' ? 'Deni' : 
                           item.targetUser === 'user5' ? 'Eka' : 'Tim'}` : '';
            
            timelineHTML += `
                <div class="feed-item ${sentimentClass}">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="font-semibold">${senderDisplay}</span>
                            <span class="text-gray-600">${targetDisplay}</span>
                        </div>
                        <span class="text-sm text-gray-500">${formattedDate}, ${formattedTime}</span>
                    </div>
                    <p class="mt-2">${item.content}</p>
                    <div class="mt-3 flex justify-between items-center">
                        <span class="text-sm ${
                            item.sentiment === 'positive' ? 'text-green-600' : 
                            item.sentiment === 'negative' ? 'text-red-600' : 'text-yellow-600'
                        }">
                            ${item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                        </span>
                        <div class="space-x-2">
                            <button class="text-gray-500 hover:text-indigo-600 text-sm">Balas</button>
                            <button class="text-gray-500 hover:text-indigo-600 text-sm">Tandai</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        feedTimeline.innerHTML = timelineHTML;
    }
};

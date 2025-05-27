/**
 * Mock Data Service
 * Provides sample data for development and testing
 */

const MockDataService = {
    // Sample users
    users: [
        { id: 'user1', name: 'Pengguna', avatar: 'U' },
        { id: 'user2', name: 'Budi', avatar: 'B' },
        { id: 'user3', name: 'Citra', avatar: 'C' },
        { id: 'user4', name: 'Deni', avatar: 'D' },
        { id: 'user5', name: 'Eka', avatar: 'E' }
    ],
    
    // Sample chat messages with more realistic data
    messages: [
        {
            id: 'msg1',
            sender: 'user2',
            content: 'Selamat pagi semua! Bagaimana progress proyek kita?',
            mood: 'happy',
            timestamp: new Date('2025-05-27T08:30:00').toISOString()
        },
        {
            id: 'msg2',
            sender: 'user3',
            content: 'Saya sudah menyelesaikan desain UI untuk halaman utama. Ada yang mau saya perbaiki?',
            mood: 'neutral',
            timestamp: new Date('2025-05-27T08:32:00').toISOString()
        },
        {
            id: 'msg3',
            sender: 'user4',
            content: 'Masih ada beberapa bug yang perlu diperbaiki di backend. Saya butuh bantuan untuk men-debug ini.',
            mood: 'angry',
            timestamp: new Date('2025-05-27T08:35:00').toISOString()
        },
        {
            id: 'msg4',
            sender: 'user1',
            content: 'Saya akan membantu memperbaiki bug tersebut. Bisa dijelaskan lebih detail?',
            mood: 'neutral',
            timestamp: new Date('2025-05-27T08:37:00').toISOString()
        },
        {
            id: 'msg5',
            sender: 'user5',
            content: 'Saya belum bisa menyelesaikan tugas saya hari ini. Ada kendala teknis yang harus diselesaikan.',
            mood: 'sad',
            timestamp: new Date('2025-05-27T08:45:00').toISOString()
        },
        {
            id: 'msg6',
            sender: 'user2',
            content: 'Tidak masalah, Eka. Fokus dulu menyelesaikan kendala teknisnya. Kalau butuh bantuan, beri tahu saja.',
            mood: 'happy',
            timestamp: new Date('2025-05-27T08:47:00').toISOString()
        },
        {
            id: 'msg7',
            sender: 'user3',
            content: 'Saya sudah update design system-nya. Silakan dicek dan beri masukan ya!',
            mood: 'happy',
            timestamp: new Date('2025-05-26T14:20:00').toISOString()
        },
        {
            id: 'msg8',
            sender: 'user4',
            content: 'Ada yang bisa bantu saya dengan error \'TypeError: Cannot read property "map" of undefined\' di komponen Chart?',
            mood: 'angry',
            timestamp: new Date('2025-05-26T11:15:00').toISOString()
        },
        {
            id: 'msg9',
            sender: 'user1',
            content: 'Saya sudah periksa kodenya. Sepertinya datanya belum di-initialize dengan benar. Saya bantu perbaiki ya.',
            mood: 'neutral',
            timestamp: new Date('2025-05-26T11:30:00').toISOString()
        },
        {
            id: 'msg10',
            sender: 'user5',
            content: 'Terima kasih atas bantuannya! Saya belajar banyak dari sini.',
            mood: 'happy',
            timestamp: new Date('2025-05-26T12:00:00').toISOString()
        }
    ],
    
    // Get all chat messages with sender details
    getChatHistory: function() {
        return new Promise((resolve) => {
            // Add sender details to each message
            const messagesWithSenders = this.messages.map(message => {
                const sender = this.users.find(u => u.id === message.sender);
                return {
                    ...message,
                    senderName: sender ? sender.name : 'Unknown',
                    senderAvatar: sender ? sender.avatar : '?'
                };
            });
            
            // Simulate API delay
            setTimeout(() => {
                resolve(messagesWithSenders);
            }, 500);
        });
    },
    
    // Get filtered chat history
    getFilteredChatHistory: function(filters) {
        return this.getChatHistory().then(messages => {
            return messages.filter(message => {
                // Apply date filter
                if (filters.date !== 'all') {
                    const messageDate = new Date(message.timestamp).toISOString().split('T')[0];
                    const today = new Date().toISOString().split('T')[0];
                    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                    
                    if (filters.date === 'today' && messageDate !== today) return false;
                    if (filters.date === 'yesterday' && messageDate !== yesterday) return false;
                    if (filters.date === 'week') {
                        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
                        if (messageDate < weekAgo) return false;
                    }
                    if (filters.date === 'month') {
                        const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
                        if (messageDate < monthAgo) return false;
                    }
                }
                
                // Apply mood filter
                if (filters.mood !== 'all' && message.mood !== filters.mood) {
                    return false;
                }
                
                // Apply user filter
                if (filters.user !== 'all' && message.sender !== filters.user) {
                    return false;
                }
                
                return true;
            });
        });
    }
};

// Make it globally available for now
// In a real app, you'd use a module system
window.MockDataService = MockDataService;

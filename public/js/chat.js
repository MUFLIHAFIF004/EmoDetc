// DOM Elements
const chatContainer = document.querySelector('.chat-container');
// Tombol keluar ruangan (akan dibuat di bawah jika belum ada)
let leaveRoomBtn = null;
// Hapus userModal, usernameInput, joinChatBtn karena tidak dipakai lagi
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const chatBox = document.getElementById('chat-box');
const currentUsernameEl = document.getElementById('currentUsername');
const userAvatar = document.getElementById('userAvatar');
const onlineCountEl = document.getElementById('onlineCount');
const userListEl = document.getElementById('userList');
const typingIndicator = document.getElementById('typing-indicator');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPickerContainer = document.getElementById('emoji-picker-container');
const toggleSidebarBtn = document.getElementById('toggleSidebar');
const sidebar = document.querySelector('.sidebar');

// Emotion data
let emotionData = {
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
    history: [] // Untuk menyimpan riwayat emosi user sendiri
};

// Simpan semua pesan untuk statistik per user dan badge emosi
let allMessages = [];
// Patch: Simpan allMessages ke sessionStorage setiap update (untuk statistik user di halaman lain)
function saveAllMessagesToSession() {
    try {
        sessionStorage.setItem('allMessages', JSON.stringify(allMessages));
    } catch (e) {}
}

// Debug helper: log every push to allMessages
function debugLogAllMessagesPush(msg, context) {
    if (!msg) return;
    // Only log if in dev mode or forced
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[DEBUG] Push to allMessages', context, msg);
    }
}

// Chart instance
let emotionChart;

// Socket.io connection
let socket;
let currentUser = {
    id: '',
    username: '',
    color: getRandomColor()
};

// Typing indicator
let typingUsers = {};
let typingTimeout;
let lastMessageTimestamp = 0;
let lastOwnMessageTimestamp = null; // Untuk anti-duplikasi bubble chat sendiri
let onlineUsers = [];

// Initialize the application
function init() {
    try {
        console.log('Initializing application...');
        // Ambil user dari localStorage (hasil login)
        const savedUser = localStorage.getItem('chatUser');
        console.log('[DEBUG] chatUser from localStorage:', savedUser);
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                console.log('[DEBUG] Parsed userData:', userData, 'typeof id:', typeof userData.id);
                // Paksa id menjadi number jika memungkinkan
                let userId = userData.id;
                if (typeof userId === 'string' && !isNaN(Number(userId))) {
                    userId = Number(userId);
                }
                currentUser = {
                    id: userId,
                    username: userData.username,
                    color: userData.color || getRandomColor()
                };
                // Validasi: id harus number dan username ada
                if (!currentUser.id || !currentUser.username || isNaN(Number(currentUser.id))) {
                    console.warn('[WARNING] User ID/username tidak valid:', currentUser);
                    alert('User ID/username tidak valid. Silakan login ulang.');
                    localStorage.removeItem('chatUser');
                    window.location.href = '/login.html';
                    return;
                }
                console.log('Loaded user from localStorage:', currentUser);
            } catch (e) {
                console.error('User data invalid, redirecting to login...', e);
                alert('Data user korup. Silakan login ulang.');
                localStorage.removeItem('chatUser');
                window.location.href = '/login.html';
                return;
            }
        } else {
            // Tidak ada user login, redirect ke login
            alert('Anda belum login. Silakan login terlebih dahulu.');
            window.location.href = '/login.html';
            return;
        }

        // Langsung masuk chat
        if (chatContainer) chatContainer.style.display = 'flex';
        if (currentUsernameEl) currentUsernameEl.textContent = currentUser.username;
        if (userAvatar) userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        if (userAvatar) userAvatar.style.backgroundColor = currentUser.color;
        if (messageInput) messageInput.disabled = false;
        if (sendMessageBtn) sendMessageBtn.disabled = false;
        // Tambahkan tombol keluar ruangan jika belum ada
        addLeaveRoomButton();

        // Initialize components
        setupEventListeners();
        initEmojiPicker();
        initEmotionChart();
        checkMobileView();
// Fungsi untuk menambahkan tombol keluar ruangan ke UI
function addLeaveRoomButton() {
    // Cek jika sudah ada, jangan tambah dua kali
    if (document.getElementById('leaveRoomBtn')) return;
    // Cari parent yang cocok (misal di atas chatBox atau di header chat)
    let parent = document.querySelector('.chat-header') || chatContainer;
    if (!parent) return;

    // Buat tombol
    leaveRoomBtn = document.createElement('button');
    leaveRoomBtn.id = 'leaveRoomBtn';
    leaveRoomBtn.textContent = 'Keluar Ruangan';
    leaveRoomBtn.setAttribute('aria-label', 'Keluar dari ruangan chat');
    leaveRoomBtn.style.background = '#e74c3c';
    leaveRoomBtn.style.color = 'white';
    leaveRoomBtn.style.border = 'none';
    leaveRoomBtn.style.borderRadius = '8px';
    leaveRoomBtn.style.padding = '8px 18px';
    leaveRoomBtn.style.fontWeight = 'bold';
    leaveRoomBtn.style.fontSize = '15px';
    leaveRoomBtn.style.margin = '10px 0 18px 0';
    leaveRoomBtn.style.cursor = 'pointer';
    leaveRoomBtn.style.boxShadow = '0 2px 8px rgba(231,76,60,0.08)';
    leaveRoomBtn.style.transition = 'background 0.2s';
    leaveRoomBtn.onmouseover = () => leaveRoomBtn.style.background = '#c0392b';
    leaveRoomBtn.onmouseout = () => leaveRoomBtn.style.background = '#e74c3c';

    // Event handler keluar ruangan
    leaveRoomBtn.addEventListener('click', function() {
        // Konfirmasi
        if (!confirm('Apakah Anda yakin ingin keluar dari ruangan?')) return;
        // Bersihkan socket dan local state jika perlu
        if (window.socket && window.socket.connected) {
            try { window.socket.emit('leave', { roomId: window.roomId, userId: currentUser.id }); } catch(e){}
            try { window.socket.disconnect(); } catch(e){}
        }
        // Redirect ke dashboard sesuai role
        const user = JSON.parse(localStorage.getItem('chatUser') || '{}');
        let dashboard = '/user-dashboard.html';
        if (user && user.role) {
            if (user.role === 'admin') dashboard = '/dashboard-admin.html';
            else if (user.role === 'leader') dashboard = '/leader-dashboard.html';
        }
        window.location.href = dashboard;
    });

    // Sisipkan tombol di parent (paling atas)
    if (parent.firstChild) {
        parent.insertBefore(leaveRoomBtn, parent.firstChild);
    } else {
        parent.appendChild(leaveRoomBtn);
    }
}

        // Initialize emotion data if not exists
        if (!window.emotionData) {
            window.emotionData = {
                happy: 0,
                sad: 0,
                angry: 0,
                neutral: 0,
                history: []
            };
        }

        // Handle window resize for responsive design
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                checkMobileView();
            }, 200);
        });

        // Otomatis join chat room
        autoJoinChat();

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        if (chatBox) {
            addSystemMessage('Terjadi kesalahan saat menginisialisasi aplikasi. Silakan muat ulang halaman.');
        }
    }
}

// Set up event listeners (tanpa joinChatBtn/usernameInput)
function setupEventListeners() {
    // Remove previous event listeners to prevent double binding
    sendMessageBtn.removeEventListener('click', sendMessage);
    messageInput.removeEventListener('keypress', window._chatKeypressHandler);

    // Handler for Enter key
    window._chatKeypressHandler = function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Send message when clicking send button or pressing Enter
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', window._chatKeypressHandler);

    // Toggle emoji picker
    emojiBtn.addEventListener('click', toggleEmojiPicker);
    
    // Toggle sidebar on mobile
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            e.target !== toggleSidebarBtn && 
            !toggleSidebarBtn.contains(e.target)) {
            sidebar.style.display = 'none';
        }
    });

    // Typing indicator
    let typingTimer;
    messageInput.addEventListener('input', () => {
        if (socket && messageInput.value.trim() !== '') {
            socket.emit('typing', { isTyping: true, roomId: window.roomId });
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                socket.emit('typing', { isTyping: false, roomId: window.roomId });
            }, 2000);
        }
    });
}

// Otomatis join chat room setelah login
function autoJoinChat() {
    // Initialize socket connection FIRST
    console.log('Connecting to socket server...');
    socket = io({
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
    });
    // Listen for message history from server and sync allMessages
    socket.on('messageHistory', (messages) => {
        // Debug log
        console.log('[DEBUG] messageHistory event received:', messages);
        allMessages = [];
        chatBox.innerHTML = '';
        if (Array.isArray(messages) && messages.length > 0) {
            messages.forEach(msg => {
                // Pastikan timestamp selalu number (epoch)
                let ts = msg.timestamp;
                if (typeof ts === 'string') {
                    // Coba parse ISO string
                    const parsed = Date.parse(ts);
                    ts = isNaN(parsed) ? Date.now() : parsed;
                } else if (typeof ts !== 'number') {
                    ts = Date.now();
                }
                // Fallback: jika emotion tidak ada, isi 'neutral'
                let emotion = msg.emotion;
                if (!emotion) emotion = 'neutral';
                const messageObj = {
                    text: msg.text,
                    username: msg.username,
                    userId: msg.user_id || msg.userId,
                    timestamp: ts,
                    time: msg.time || (ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
                    emotion: emotion,
                    sentiment: msg.sentiment,
                    color: msg.color || undefined
                };
                // Anti-duplikasi: push ke allMessages hanya jika belum ada
                const exists = allMessages.some(m => m.timestamp === messageObj.timestamp && m.userId === messageObj.userId);
                if (!exists) {
                    allMessages.push(messageObj);
                    debugLogAllMessagesPush(messageObj, 'messageHistory');
                    saveAllMessagesToSession();
                }
                // Tampilkan pesan ke chat box, tambahkan isHistory agar addMessage tidak push ke allMessages lagi
                const type = (currentUser && (messageObj.userId === currentUser.id)) ? 'sent' : 'received';
                addMessage({ ...messageObj, isHistory: true }, type);
            });
            // PENTING: update statistik DULU, baru inisialisasi chart
            updateEmotionStats();
            // DEBUG: cek isi emotionData.history setelah updateEmotionStats
            console.log('[DEBUG] emotionData.history after updateEmotionStats:', JSON.stringify(emotionData.history));
            initEmotionChart();
            updateEmotionChart();
            updateEmotionAverages();
        } else {
            // Jika tidak ada pesan history, tampilkan placeholder
            const emptyDiv = document.createElement('div');
            emptyDiv.style.textAlign = 'center';
            emptyDiv.style.margin = '20px 0';
            emptyDiv.style.color = '#888';
            emptyDiv.style.fontSize = '14px';
            emptyDiv.textContent = 'Belum ada pesan di room ini.';
            chatBox.appendChild(emptyDiv);
            // Tetap update statistik dan inisialisasi chart agar canvas tidak kosong
            updateEmotionStats();
            // DEBUG: cek isi emotionData.history setelah updateEmotionStats (no history case)
            console.log('[DEBUG] emotionData.history after updateEmotionStats (no history):', JSON.stringify(emotionData.history));
            initEmotionChart();
            updateEmotionChart();
            updateEmotionAverages();
        }
    });

    // Update UI
    if (userAvatar) {
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        userAvatar.style.backgroundColor = currentUser.color;
    }
    if (currentUsernameEl) {
        currentUsernameEl.textContent = currentUser.username;
    }
    if (chatContainer) {
        chatContainer.style.display = 'flex';
    }
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.focus();
    }
    if (sendMessageBtn) {
        sendMessageBtn.disabled = false;
    }

    // Set up socket event listeners
    setupSocketListeners();

    // Handle socket connection events
    const connectionTimeout = setTimeout(() => {
        if (socket && !socket.connected) {
            console.error('Connection to server timed out');
            addSystemMessage('Gagal terhubung ke server. Silakan coba lagi nanti.');
        }
    }, 10000);

    socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('Connected to server with socket ID:', socket.id);
        // Get roomId from URL (support ?roomId=, ?room=, ?code=)
        const urlParams = new URLSearchParams(window.location.search);
        let roomId = urlParams.get('roomId') || urlParams.get('room') || urlParams.get('code');
        if (!roomId) {
            addSystemMessage('Room ID tidak ditemukan di URL.');
            return;
        }
        window.roomId = roomId;
        // PATCH: Validasi id harus number dan tidak null/undefined
        let userId = currentUser.id;
        if (typeof userId === 'string' && !isNaN(Number(userId))) {
            userId = Number(userId);
        }
        if (!userId || isNaN(userId)) {
            addSystemMessage('User ID tidak valid. Silakan login ulang.');
            localStorage.removeItem('chatUser');
            window.location.href = '/login.html';
            return;
        }
        // PATCH: pastikan id yang dikirim ke backend adalah angka dan valid
        socket.emit('join', {
            id: userId,
            username: currentUser.username,
            color: currentUser.color,
            roomId: roomId,
            timestamp: Date.now()
        });
        // Add welcome message
        addSystemMessage(`Selamat datang di EmoDetect, ${currentUser.username}!`);
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        addSystemMessage('Gagal terhubung ke server. Silakan periksa koneksi internet Anda.');
    });
}

// Initialize emoji picker
function initEmojiPicker() {
    const picker = document.querySelector('emoji-picker');
    
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPickerContainer.style.display = 
            emojiPickerContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiBtn.contains(e.target) && !emojiPickerContainer.contains(e.target)) {
            emojiPickerContainer.style.display = 'none';
        }
    });
    
    // Insert emoji on select
    picker.addEventListener('emoji-click', (e) => {
        const cursorPos = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPos);
        const textAfter = messageInput.value.substring(cursorPos);
        
        messageInput.value = textBefore + e.detail.unicode + textAfter;
        messageInput.focus();
        messageInput.selectionStart = messageInput.selectionEnd = cursorPos + e.detail.unicode.length;
        
        // Trigger input event for typing indicator
        const event = new Event('input', { bubbles: true });
        messageInput.dispatchEvent(event);
    });
}

// Toggle emoji picker visibility
function toggleEmojiPicker() {
    const picker = document.querySelector('emoji-picker');
    if (picker) {
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    }
}

// Initialize emotion chart
function initEmotionChart() {
    // Inisialisasi grafik garis emosi
    const chartEl = document.getElementById('emotionChart');

    if (!chartEl) return;
    // Destroy chart jika sudah ada (anti chart invisible/blank)
    if (window.emotionChart) {
        try {
            window.emotionChart.destroy();
        } catch (e) {
            console.error('Error destroying previous emotionChart:', e);
        }
        window.emotionChart = null;
    }

    // Tampilkan/hide notice chart kosong
    const notice = document.getElementById('emotionChartNotice');
    if (emotionData.history.length === 0) {
        if (notice) notice.style.display = 'block';
    } else {
        if (notice) notice.style.display = 'none';
    }

    const labels = emotionData.history.map((entry, idx) => entry.timeString || (idx + 1).toString());
    const happyData = emotionData.history.map(entry => entry.emotion === 'happy' ? 1 : 0);
    const sadData = emotionData.history.map(entry => entry.emotion === 'sad' ? 1 : 0);
    const angryData = emotionData.history.map(entry => entry.emotion === 'angry' ? 1 : 0);
    const neutralData = emotionData.history.map(entry => entry.emotion === 'neutral' ? 1 : 0);

    try {
        window.emotionChart = new Chart(chartEl, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Senang',
                    data: happyData,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76,175,80,0.08)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#4caf50',
                },
                {
                    label: 'Sedih',
                    data: sadData,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33,150,243,0.08)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#2196f3',
                },
                {
                    label: 'Marah',
                    data: angryData,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244,67,54,0.08)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#f44336',
                },
                {
                    label: 'Netral',
                    data: neutralData,
                    borderColor: '#9e9e9e',
                    backgroundColor: 'rgba(158,158,158,0.08)',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#9e9e9e',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 14 }
                    }
                },
                title: {
                    display: true,
                    text: 'Grafik Garis Emosi Pesan',
                    font: { size: 18 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: 'Jumlah Pesan'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Waktu/Jam'
                    }
                }
            }
        }
        });
    } catch (err) {
        console.error('Error initializing emotionChart:', err);
    }
}

// Join the chat room
// joinChat dihapus, digantikan autoJoinChat()

// Set up socket.io event listeners
function setupSocketListeners() {
    // Handle message history from server
    socket.on('messageHistory', (messages) => {
        try {
            console.log('Received message history:', messages);
            if (!Array.isArray(messages)) {
                console.warn('Invalid message history format:', messages);
                return;
            }
            
            // Clear existing messages
            allMessages = [];
            
            // Add each message to chat
            messages.forEach(msg => {
                const messageData = {
                    text: msg.text,
                    username: msg.username,
                    userId: msg.user_id,
                    timestamp: new Date(msg.created_at).getTime(),
                    time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    emotion: msg.emotion,
                    color: msg.color
                };
                
                // Add to allMessages for statistics
                allMessages.push(messageData);
                
                // Add to chat UI
                addMessage(messageData, messageData.userId === currentUser.id ? 'sent' : 'received');
            });
            
            // Update statistics
            updateEmotionStats();
            updateEmotionAverages();
            
            // Scroll to bottom
            scrollToBottom();
            
        } catch (error) {
            console.error('Error processing message history:', error);
        }
    });
    
    // Handle system message from server (error, info, dsb)
    socket.on('systemMessage', (data) => {
        if (data && data.text) {
            addSystemMessage(data.text);
            // Jika error room/user tidak valid, bisa redirect atau disable input
            if (data.type === 'error') {
                if (data.text.toLowerCase().includes('room')) {
                    if (messageInput) messageInput.disabled = true;
                    if (sendMessageBtn) sendMessageBtn.disabled = true;
                }
                if (data.text.toLowerCase().includes('user')) {
                    // Jika user tidak valid, redirect ke login
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 1500);
                }
            }
        }
    });
    // Online users per room (from backend)
    socket.on('onlineUsers', (users) => {
        updateOnlineUsers(users);
    });
    if (!socket) {
        console.error('Socket is not initialized');
        return;
    }
    
    console.log('Setting up socket event listeners...');
    
    // Remove any existing listeners to prevent duplicates
    socket.off('user joined');
    socket.off('user left');
    socket.off('chatMessage');
    socket.off('user typing');
    socket.off('user stop typing');
    socket.off('error');
    
    // User joined the chat
    socket.on('user joined', (data) => {
        try {
            console.log('User joined:', data);
            if (data && data.username) {
                addSystemMessage(`${data.username} telah bergabung ke chat`);
                if (data.onlineUsers) {
                    updateOnlineUsers(data.onlineUsers);
                }
            }
        } catch (error) {
            console.error('Error handling user joined event:', error);
        }
    });
    
    // User left the chat
    socket.on('user left', (data) => {
        try {
            console.log('User left:', data);
            if (data && data.username) {
                addSystemMessage(`${data.username} telah meninggalkan chat`);
                if (data.onlineUsers) {
                    updateOnlineUsers(data.onlineUsers);
                }
            }
        } catch (error) {
            console.error('Error handling user left event:', error);
        }
    });
    
    // New message received from server
    socket.on('chatMessage', (data) => {
        try {
            console.log('New message received:', data);
            if (!data) return;
            // Pastikan timestamp selalu number (epoch)
            let ts = data.timestamp;
            if (typeof ts === 'string') {
                const parsed = Date.parse(ts);
                ts = isNaN(parsed) ? Date.now() : parsed;
            } else if (typeof ts !== 'number') {
                ts = Date.now();
            }
            // Cegah bubble dobel: jika pesan ini adalah pesan sendiri (timestamp sama dengan lastOwnMessageTimestamp), skip render
            const isOwnMessage = data.userId === currentUser.id || data.id === currentUser.id;
            if (isOwnMessage && lastOwnMessageTimestamp && Math.abs(ts - lastOwnMessageTimestamp) < 2000) {
                // Sudah dirender saat kirim, skip agar tidak dobel
                return;
            }
            addMessage({
                text: data.text,
                username: data.username,
                userId: data.userId || data.id,
                timestamp: ts,
                time: data.time || new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                emotion: data.emotion,
                sentiment: data.sentiment,
                color: data.color
            }, isOwnMessage ? 'sent' : 'received');
            // Update statistik emosi dan chart untuk SEMUA pesan
            updateEmotionStats();
            updateEmotionAverages();
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });
    
    // User is typing
    socket.on('user typing', (data) => {
        try {
            if (typingUsers[data.userId] && Date.now() - typingUsers[data.userId] < 3000) {
                // Skip if we already have a recent typing indicator for this user
                return;
            }
            
            // Store typing timestamp
            typingUsers[data.userId] = Date.now();
            
            // Update typing indicator
            updateTypingIndicator(data.username);
            
            // Clear typing indicator after delay
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                clearTypingIndicator();
            }, 3000);
            
        } catch (error) {
            console.error('Error handling typing indicator:', error);
        }
    });
    
    // User stopped typing
    socket.on('user stop typing', (data) => {
        try {
            if (typingUsers[data.userId]) {
                delete typingUsers[data.userId];
                clearTypingIndicator();
            }
        } catch (error) {
            console.error('Error handling stop typing:', error);
        }
    });
    
    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        addSystemMessage('Terjadi kesalahan pada koneksi. Silakan muat ulang halaman.');
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        if (reason === 'io server disconnect') {
            // The disconnection was initiated by the server, you need to reconnect manually
            socket.connect();
        }
        // Add auto-reconnect logic if needed
    });
    
    // Handle reconnection
    socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected to server after ${attemptNumber} attempts`);
        addSystemMessage('Terhubung kembali ke server.');
        
        // Rejoin the chat after reconnection
        if (currentUser && currentUser.id) {
            const urlParams = new URLSearchParams(window.location.search);
            const roomId = urlParams.get('roomId');
            if (!roomId) return;
            socket.emit('join', {
                id: currentUser.id,
                username: currentUser.username,
                color: currentUser.color,
                roomId: roomId,
                isReconnect: true
            });
        }
    });
    
    console.log('Socket event listeners set up successfully');
    
    // Add typing indicator functions if they don't exist
    if (typeof updateTypingIndicator !== 'function') {
        // Update typing indicator
        window.updateTypingIndicator = function(username) {
            const typingIndicator = document.getElementById('typing-indicator');
            if (!typingIndicator) return;
            
            const userList = Object.values(typingUsers)
                .filter((_, userId) => {
                    const user = onlineUsers.find(u => u.id === userId);
                    return user && user.username !== currentUser.username;
                })
                .map(userId => {
                    const user = onlineUsers.find(u => u.id === userId);
                    return user ? user.username : '';
                })
                .filter(Boolean);
            
            if (userList.length > 0) {
                const names = userList.join(', ');
                const verb = userList.length === 1 ? 'sedang mengetik' : 'sedang mengetik';
                typingIndicator.textContent = `${names} ${verb}...`;
                typingIndicator.style.display = 'block';
                typingIndicator.style.fontStyle = 'italic';
                typingIndicator.style.color = '#666';
                typingIndicator.style.fontSize = '12px';
                typingIndicator.style.margin = '5px 10px';
            } else {
                typingIndicator.style.display = 'none';
            }
        };
        
        // Clear typing indicator
        window.clearTypingIndicator = function() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
            typingUsers = {};
        };
    }
}

// Send a message
function sendMessage() {
    try {
        const message = messageInput.value.trim();
        // Validasi userId sebelum mengirim pesan
        if (!currentUser.id || isNaN(Number(currentUser.id))) {
            addSystemMessage('User ID tidak valid. Silakan login ulang.');
            window.location.href = '/login.html';
            return;
        }
        if (!message) return;
        
        // Disable input while sending
        messageInput.disabled = true;
        sendMessageBtn.disabled = true;
        
        // Get current timestamp
        const timestamp = Date.now();
        const timeString = new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Pastikan userId bertipe number
        const userIdInt = Number(currentUser.id);
        if (!userIdInt || isNaN(userIdInt)) {
            addSystemMessage('User ID tidak valid. Silakan login ulang.');
            window.location.href = '/login.html';
            return;
        }
        // Prepare message data
        const messageData = {
            text: message,
            id: userIdInt, // PATCH: gunakan id, bukan userId
            username: currentUser.username,
            timestamp: timestamp,
            time: timeString,
            color: currentUser.color,
            type: 'sent',
            emotion: 'neutral', // Default emotion until analysis is complete
            isAnalyzing: true, // Flag to indicate analysis is in progress
            roomId: window.roomId
        };

        console.log('Sending message:', messageData);

        // Add message to UI immediately with default neutral emotion
        addMessage({ ...messageData, userId: userIdInt }, 'sent'); // Untuk UI tetap pakai userId
        lastOwnMessageTimestamp = timestamp; // Simpan timestamp pesan terakhir yang dikirim sendiri

        // Clear input field
        messageInput.value = '';

        // Notify server that user has stopped typing
        if (socket && socket.connected) {
            socket.emit('stop typing');
        }

        // Send to server for emotion analysis
        fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: message,
                userId: userIdInt,
                username: currentUser.username,
                timestamp: timestamp,
                color: currentUser.color
            })
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Analysis response:', data);
            
            // Update message with emotion from analysis
            const updatedMessage = {
                ...messageData,
                emotion: data.emotion || 'neutral',
                sentiment: data.sentiment || { score: 0 },
                isAnalyzing: false
            };
            // Update the message in UI with emotion
            updateMessageWithEmotion(timestamp, { ...updatedMessage, userId: userIdInt });
            // Emit to other clients if socket is connected
            if (socket && socket.connected) {
                // Kirim field id (bukan userId) agar backend konsisten
                const emitData = { ...updatedMessage, id: userIdInt, roomId: window.roomId };
                delete emitData.userId;
                console.log('Emitting chatMessage event with data:', emitData);
                socket.emit('chatMessage', emitData);
            } else {
                console.warn('Socket not connected, cannot broadcast message to other clients');
            }
            // Update emotion stats
            if (updatedMessage.emotion) {
                updateEmotionStats(updatedMessage.emotion);
            }
        })
        .catch(error => {
            console.error('Error analyzing message:', error);
            
            // If error, still show the message with default emotion
            const errorMessage = {
                ...messageData,
                emotion: 'neutral',
                error: 'Error analyzing emotion',
                isAnalyzing: false
            };
            
            // Update the message in UI with error state
            updateMessageWithEmotion(timestamp, { ...errorMessage, userId: userIdInt });
            
            // Emit to other clients with default emotion if socket is connected
            if (socket && socket.connected) {
                // Kirim field id (bukan userId) agar backend konsisten
                const emitData = { ...errorMessage, id: userIdInt, roomId: window.roomId };
                delete emitData.userId;
                socket.emit('chatMessage', emitData);
            }
        })
        .finally(() => {
            // Re-enable input and focus
            messageInput.disabled = false;
            sendMessageBtn.disabled = false;
            messageInput.focus();
            
            // Update last message timestamp
            lastMessageTimestamp = timestamp;
            
            // Scroll to bottom to show new message
            scrollToBottom();
        });
        
    } catch (error) {
        console.error('Unexpected error in sendMessage:', error);
        
        // Re-enable input in case of error
        messageInput.disabled = false;
        sendMessageBtn.disabled = false;
        messageInput.focus();
        
        // Show error to user
        addSystemMessage('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
    }
}

// Add message to chat with emotion indicator
function addMessage(data, type = 'received') {
    // --- TAMPILAN CHAT NORMAL ---
    try {
        // Cegah duplikasi di allMessages DAN di chatBox (DOM)
        if (data && data.userId && data.text && data.emotion) {
            let emotion = data.emotion || 'neutral';
            // Jika pesan sedang dikirim (optimistic UI), SELALU render ke chatBox
            if (data.isAnalyzing) {
                // Tidak push ke allMessages, langsung render
            } else {
                // Jika pesan dari history, JANGAN push ke allMessages lagi
                if (!data.isHistory) {
                    const exists = allMessages.some(
                        m => m.timestamp === data.timestamp && m.userId === data.userId
                    );
                    if (!exists) {
                        const messageObj = {
                            ...data,
                            emotion: emotion,
                            type: type
                        };
                        allMessages.push(messageObj);
                        debugLogAllMessagesPush(messageObj, 'chatMessage');
                        saveAllMessagesToSession();
                        updateEmotionStats();
                        updateEmotionAverages();
                    } else {
                        // Sudah ada di allMessages, jangan render bubble chat lagi
                        return;
                    }
                }
                // Cegah duplikasi di chatBox: jika sudah ada elemen dengan timestamp & userId sama, jangan render lagi
                const msgId = `msg-${data.timestamp}-${data.userId || 'system'}`;
                if (chatBox && chatBox.querySelector(`[data-message-id='${msgId}']`)) {
                    return;
                }
            }
        }
        // Create message container
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'sent' ? 'sent' : 'received'}`;
        messageDiv.dataset.timestamp = data.timestamp || Date.now();
        messageDiv.dataset.messageId = `msg-${data.timestamp}-${data.userId || 'system'}`;
        messageDiv.style.position = 'relative';
        messageDiv.style.maxWidth = '80%';
        messageDiv.style.padding = '10px 15px';
        messageDiv.style.borderRadius = '15px';
        messageDiv.style.marginBottom = '15px';
        messageDiv.style.wordWrap = 'break-word';
        messageDiv.style.backgroundColor = type === 'sent' ? '#4a6cf7' : '#f1f1f1';
        messageDiv.style.color = type === 'sent' ? 'white' : '#333';
        messageDiv.style.alignSelf = type === 'sent' ? 'flex-end' : 'flex-start';
        messageDiv.style.marginLeft = type === 'sent' ? 'auto' : '0';
        messageDiv.style.marginRight = type === 'received' ? 'auto' : '0';
        messageDiv.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        messageDiv.style.transition = 'all 0.3s ease';
        
        // Add user color indicator for received messages
        if (type === 'received' && data.color) {
            messageDiv.style.borderLeft = `4px solid ${data.color}`;
        }
        
        // Add message header (username and time)
        const messageHeader = document.createElement('div');
        messageHeader.style.display = 'flex';
        messageHeader.style.justifyContent = 'space-between';
        messageHeader.style.alignItems = 'center';
        messageHeader.style.marginBottom = '5px';
        
        // Add username
        if (type === 'received' && data.username) {
            const usernameEl = document.createElement('span');
            usernameEl.textContent = data.username;
            usernameEl.style.fontWeight = '600';
            usernameEl.style.color = data.color || '#4a6cf7';
            usernameEl.style.fontSize = '0.9em';
            messageHeader.appendChild(usernameEl);
        } else {
            // Empty span to maintain flex spacing
            messageHeader.appendChild(document.createElement('span'));
        }
        
        // Add timestamp
        const timeEl = document.createElement('span');
        timeEl.textContent = data.time || new Date(data.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        timeEl.style.fontSize = '0.75em';
        timeEl.style.opacity = '0.8';
        timeEl.style.color = type === 'sent' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)';
        messageHeader.appendChild(timeEl);
        
        // Add message content
        const messageContent = document.createElement('div');
        messageContent.textContent = data.text;
        messageContent.style.marginBottom = '5px';
        messageContent.style.lineHeight = '1.5';
        messageContent.style.whiteSpace = 'pre-wrap';
        messageContent.style.wordBreak = 'break-word';
    

        // Add emotion indicator (badge/label) for every message (analyzing, error, or analyzed)
        const emotionContainer = document.createElement('div');
        emotionContainer.className = 'emotion-container';
        emotionContainer.style.display = 'flex';
        emotionContainer.style.alignItems = 'center';
        emotionContainer.style.marginTop = '8px';
        emotionContainer.style.paddingTop = '8px';
        emotionContainer.style.borderTop = `1px solid ${type === 'sent' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`;

        // Always show emotion badge/label
        if (data.isAnalyzing) {
            // Show loading indicator if still analyzing
            const loadingEl = document.createElement('div');
            loadingEl.className = 'analyzing-indicator';
            loadingEl.textContent = 'Menganalisis emosi...';
            loadingEl.style.display = 'flex';
            loadingEl.style.alignItems = 'center';
            loadingEl.style.gap = '5px';
            loadingEl.style.fontSize = '0.8em';
            loadingEl.style.color = type === 'sent' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)';

            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            spinner.style.width = '12px';
            spinner.style.height = '12px';
            spinner.style.border = `2px solid ${type === 'sent' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`;
            spinner.style.borderTopColor = type === 'sent' ? 'white' : '#4a6cf7';
            spinner.style.borderRadius = '50%';
            spinner.style.animation = 'spin 1s linear infinite';

            loadingEl.prepend(spinner);
            emotionContainer.appendChild(loadingEl);
        } else if (data.error) {
            // Show error indicator if analysis failed
            const errorEl = document.createElement('div');
            errorEl.className = 'error-indicator';
            errorEl.textContent = data.error;
            errorEl.style.color = type === 'sent' ? 'rgba(255,200,200,0.9)' : '#e74c3c';
            errorEl.style.fontSize = '0.8em';
            errorEl.style.marginTop = '5px';
            errorEl.style.display = 'flex';
            errorEl.style.alignItems = 'center';
            errorEl.style.gap = '5px';

            const icon = document.createElement('span');
            icon.innerHTML = '⚠️';
            errorEl.prepend(icon);

            emotionContainer.appendChild(errorEl);
        } else {
            // Show emotion badge/label for analyzed message
            const badge = document.createElement('span');
            badge.className = 'emotion-badge';
            badge.style.display = 'inline-flex';
            badge.style.alignItems = 'center';
            badge.style.gap = '7px';
            badge.style.fontWeight = '600';
            badge.style.fontSize = '1em';
            badge.style.padding = '4px 12px';
            badge.style.borderRadius = '12px';
            badge.style.background = type === 'sent' ? 'rgba(76,175,80,0.13)' : 'rgba(33,150,243,0.10)';
            badge.style.color = getEmotionColor(data.emotion);
            badge.style.marginRight = '8px';
            badge.innerHTML = `<i class="fas ${getEmotionIcon(data.emotion)}" style="color:${getEmotionColor(data.emotion)};font-size:1.2em;"></i> ${getEmotionText(data.emotion)}`;
            emotionContainer.appendChild(badge);
        }

        // Assemble message
        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(emotionContainer);
        
        // Add to chat box
        if (chatBox) {
            chatBox.appendChild(messageDiv);
            console.log('[DEBUG] Message element appended to chatBox:', messageDiv);
        } else {
            console.warn('[DEBUG] chatBox element not found!');
        }
        // Scroll to bottom if this is a new message
        if (!data.isHistory) {
            scrollToBottom();
        }
        return messageDiv;
        
    } catch (error) {
        console.error('Error adding message:', error);
        
        // Fallback to simple message if there's an error
        const errorDiv = document.createElement('div');
        errorDiv.className = `message ${type === 'sent' ? 'sent' : 'received'}`;
        errorDiv.textContent = data.text || '(Pesan tidak dapat ditampilkan)';
        errorDiv.style.backgroundColor = type === 'sent' ? '#4a6cf7' : '#f1f1f1';
        errorDiv.style.color = type === 'sent' ? 'white' : '#333';
        errorDiv.style.padding = '10px 15px';
        errorDiv.style.borderRadius = '15px';
        errorDiv.style.marginBottom = '15px';
        errorDiv.style.maxWidth = '80%';
        errorDiv.style.wordWrap = 'break-word';
        errorDiv.style.alignSelf = type === 'sent' ? 'flex-end' : 'flex-start';
        
        chatBox.appendChild(errorDiv);
        scrollToBottom();
        
        return errorDiv;
    }
}

// Add system message
function addSystemMessage(text) {
    try {
        if (!chatBox) {
            console.error('Chat box element not found');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.margin = '10px 0';
        messageDiv.style.padding = '8px 12px';
        messageDiv.style.fontSize = '12px';
        messageDiv.style.color = '#666';
        messageDiv.style.backgroundColor = '#f8f9fa';
        messageDiv.style.borderRadius = '15px';
        messageDiv.style.display = 'inline-block';
        messageDiv.style.maxWidth = '80%';
        messageDiv.style.wordWrap = 'break-word';
        messageDiv.textContent = text;
        
        // Create container for system message to center it
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.style.width = '100%';
        container.style.margin = '10px 0';
        container.appendChild(messageDiv);
        
        chatBox.appendChild(container);
        scrollToBottom();
        
        return messageDiv;
    } catch (error) {
        console.error('Error adding system message:', error);
    }
}

// Update online users list
function updateOnlineUsers(users) {
    if (!userListEl) return;
    
    // Update online count
    if (onlineCountEl) {
        onlineCountEl.textContent = users.length;
    }
    
    // Clear current list
    userListEl.innerHTML = '';
    
    // Add each user to the list (tanpa badge/emoji/emotion)
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.style.display = 'flex';
        userItem.style.alignItems = 'center';
        userItem.style.padding = '8px 0';
        userItem.style.borderBottom = '1px solid #eee';

        const userAvatar = document.createElement('div');
        userAvatar.textContent = user.username.charAt(0).toUpperCase();
        userAvatar.style.width = '30px';
        userAvatar.style.height = '30px';
        userAvatar.style.borderRadius = '50%';
        userAvatar.style.backgroundColor = user.color || getRandomColor();
        userAvatar.style.color = 'white';
        userAvatar.style.display = 'flex';
        userAvatar.style.alignItems = 'center';
        userAvatar.style.justifyContent = 'center';
        userAvatar.style.marginRight = '10px';
        userAvatar.style.fontWeight = 'bold';

        const userName = document.createElement('span');
        userName.textContent = user.username;
        userName.style.fontSize = '14px';

        userItem.appendChild(userAvatar);
        userItem.appendChild(userName);
        userListEl.appendChild(userItem);
    });
}

// Get emotion icon
function getEmotionIcon(emotion) {
    switch(emotion) {
        case 'happy': return 'fa-laugh';
        case 'sad': return 'fa-sad-tear';
        case 'angry': return 'fa-angry';
        default: return 'fa-meh';
    }
}

// Get emotion text
function getEmotionText(emotion) {
    switch(emotion) {
        case 'happy': return 'Senang';
        case 'sad': return 'Sedih';
        case 'angry': return 'Marah';
        default: return 'Netral';
    }
}

// Get emotion color
function getEmotionColor(emotion) {
    switch(emotion) {
        case 'happy': return '#4caf50';
        case 'sad': return '#2196f3';
        case 'angry': return '#f44336';
        default: return '#9e9e9e';
    }
}

// Update emotion statistics
function updateEmotionStats(emotion) {
    // Jika dipanggil tanpa argumen, update seluruh statistik dari allMessages
    if (typeof emotion === 'undefined') {
        try {
            // Reset emotionData
            emotionData.happy = 0;
            emotionData.sad = 0;
            emotionData.angry = 0;
            emotionData.neutral = 0;
            emotionData.history = [];
            emotionData.involved = {
                happy: new Set(),
                sad: new Set(),
                angry: new Set(),
                neutral: new Set()
            };
            const messages = allMessages.filter(m => m.emotion);
            messages.forEach(msg => {
                if (typeof emotionData[msg.emotion] !== 'number') emotionData[msg.emotion] = 0;
                emotionData[msg.emotion]++;
                emotionData.history.push({
                    emotion: msg.emotion,
                    timestamp: new Date(msg.timestamp),
                    timeString: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    username: msg.username
                });
                if (emotionData.involved[msg.emotion] && msg.username) {
                    emotionData.involved[msg.emotion].add(msg.username);
                }
            });
            // Limit history to last 20 entries for the chart
            const maxHistory = 20;
            if (emotionData.history.length > maxHistory) {
                emotionData.history = emotionData.history.slice(-maxHistory);
            }
            if (window.emotionChart) updateEmotionChart();
            updateEmotionAverages();
        } catch (error) {
            console.error('Error updating emotion stats:', error);
        }
        return;
    }
    // Fallback: update statistik hanya untuk emosi tertentu (lama)
    console.log('Updating emotion stats for:', emotion);
    try {
        // Proses statistik untuk seluruh pesan di room (allMessages)
        // Reset emotionData
        emotionData.happy = 0;
        emotionData.sad = 0;
        emotionData.angry = 0;
        emotionData.neutral = 0;
        emotionData.history = [];
        emotionData.involved = {
            happy: new Set(),
            sad: new Set(),
            angry: new Set(),
            neutral: new Set()
        };
        const roomMessages = allMessages.filter(m => m.emotion);
        roomMessages.forEach(msg => {
            if (typeof emotionData[msg.emotion] !== 'number') emotionData[msg.emotion] = 0;
            emotionData[msg.emotion]++;
            emotionData.history.push({
                emotion: msg.emotion,
                timestamp: new Date(msg.timestamp),
                timeString: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                username: msg.username
            });
            if (msg.username && emotionData.involved[msg.emotion]) {
                emotionData.involved[msg.emotion].add(msg.username);
            }
        });
        // Limit history to last 20 entries for the chart
        const maxHistory = 20;
        if (emotionData.history.length > maxHistory) {
            emotionData.history = emotionData.history.slice(-maxHistory);
        }
        if (window.emotionChart) updateEmotionChart();
        updateEmotionAverages();
    } catch (error) {
        console.error('Error updating emotion stats:', error);
    }
}

// Update emotion chart
function updateEmotionChart() {
    // Update grafik garis emosi secara real-time
    if (!document.getElementById('emotionChart') || !window.emotionChart) return;
    if (!window.emotionChart || typeof window.emotionChart.data === 'undefined') return;
    try {
        // Tampilkan/hide notice chart kosong
        const notice = document.getElementById('emotionChartNotice');
        if (emotionData.history.length === 0) {
            if (notice) notice.style.display = 'block';
        } else {
            if (notice) notice.style.display = 'none';
        }

        const labels = emotionData.history.map((entry, idx) => entry.timeString || (idx + 1).toString());
        const happyData = emotionData.history.map(entry => entry.emotion === 'happy' ? 1 : 0);
        const sadData = emotionData.history.map(entry => entry.emotion === 'sad' ? 1 : 0);
        const angryData = emotionData.history.map(entry => entry.emotion === 'angry' ? 1 : 0);
        const neutralData = emotionData.history.map(entry => entry.emotion === 'neutral' ? 1 : 0);

        window.emotionChart.data.labels = labels;
        window.emotionChart.data.datasets[0].data = happyData;
        window.emotionChart.data.datasets[1].data = sadData;
        window.emotionChart.data.datasets[2].data = angryData;
        window.emotionChart.data.datasets[3].data = neutralData;
        window.emotionChart.update();
    } catch (error) {
        console.error('Error updating emotion chart:', error);
    }
}

// Update emotion averages
function updateEmotionAverages() {
    try {
        const total = emotionData.history.length || 1; // Avoid division by zero
        const container = document.getElementById('emotionAverages');
        if (!container) {
            // Statistik emosi dinonaktifkan, tidak perlu warning
            return;
        }
        
        // Ensure all emotion counts are numbers
        const counts = {
            happy: Number(emotionData.happy) || 0,
            sad: Number(emotionData.sad) || 0,
            angry: Number(emotionData.angry) || 0,
            neutral: Number(emotionData.neutral) || 0
        };

        // Calculate percentages
        const averages = {
            happy: ((counts.happy / total) * 100).toFixed(1),
            sad: ((counts.sad / total) * 100).toFixed(1),
            angry: ((counts.angry / total) * 100).toFixed(1),
            neutral: ((counts.neutral / total) * 100).toFixed(1)
        };

        // Create HTML for the averages
        let html = `
            <div class="emotion-avg-header" style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #333;">Statistik Emosi</h3>
                <p style="margin: 0; font-size: 13px; color: #666;">Total pesan: ${total}</p>
            </div>
            <div class="emotion-avg-list" style="margin-bottom: 20px;">
        `;

        // Add each emotion average with a progress bar and user list
        Object.entries(averages).forEach(([emotion, value]) => {
            const count = counts[emotion] || 0;
            const color = getEmotionColor(emotion);
            const icon = getEmotionIcon(emotion);
            const text = getEmotionText(emotion);
            const percent = parseFloat(value) || 0;
            // Ambil user yang terlibat (dari emotionData.involved)
            let involvedUsers = [];
            if (emotionData.involved && emotionData.involved[emotion]) {
                involvedUsers = Array.from(emotionData.involved[emotion]);
            }
            let userListHtml = '';
            if (involvedUsers.length > 0) {
                userListHtml = `<div style="font-size:12px;color:#888;margin-top:2px;">` +
                    `User: ` + involvedUsers.map(u => `<span style=\"background:#f0f0f0;border-radius:8px;padding:2px 7px;margin-right:3px;\">${u}</span>`).join('') +
                    `</div>`;
            }

            html += `
                <div class="emotion-avg-item" style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 15px;">
                        <span style="display: flex; align-items: center; gap: 8px; color: #444;">
                            <i class="fas ${icon}" style="color: ${color}; width: 20px; text-align: center; font-size: 18px;"></i>
                            <span style="font-size:15px;">${text}</span>
                        </span>
                        <span style="font-weight: 600; color: ${color}; font-size:15px;">${value}%</span>
                    </div>
                    <div style="height: 10px; background-color: #f0f0f0; border-radius: 3px; overflow: hidden; margin-bottom:4px;">
                        <div style="height: 100%; width: ${percent}%; background-color: ${color}; border-radius: 3px; transition: width 0.5s ease-in-out;"></div>
                    </div>
                    <div style="font-size: 13px; color: #888; text-align: right; margin-top: 2px;">
                        ${count} pesan
                    </div>
                    ${userListHtml}
                </div>
            `;
        });

        html += `
            </div>
            <div class="emotion-avg-footer" style="font-size: 12px; color: #999; text-align: center; padding-top: 10px; border-top: 1px solid #eee; margin-top: 5px;">
                Diperbarui: ${new Date().toLocaleTimeString()}
            </div>
        `;

        // Tambahkan tabel horizontal riwayat emosi
        if (emotionData.history && emotionData.history.length > 0) {
            html += `<div style="margin-top:28px;">
                <div style="font-size:20px;font-weight:700;margin-bottom:14px;letter-spacing:0.5px;">Riwayat Emosi Pesan</div>
                <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:separate;border-spacing:0 14px;">
                    <thead>
                        <tr style="background:#f5f5f5;">
                            <th style="padding:14px 12px;font-size:18px;text-align:left;">Emosi</th>
                            <th style="padding:14px 12px;font-size:18px;text-align:left;">Jam</th>
                            <th style="padding:14px 12px;font-size:18px;text-align:left;">User</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${emotionData.history.map(h => `
                            <tr style="background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-radius:12px;">
                                <td style="padding:13px 12px;font-size:20px;font-weight:600;min-width:120px;">
                                    <i class='fas ${getEmotionIcon(h.emotion)}' style='color:${getEmotionColor(h.emotion)};margin-right:10px;font-size:22px;'></i> ${getEmotionText(h.emotion)}
                                </td>
                                <td style="padding:13px 12px;font-size:20px;min-width:90px;">${h.timeString}</td>
                                <td style="padding:13px 12px;font-size:20px;font-weight:500;min-width:120px;">${h.username || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>
            </div>`;
        }

        // Update the container
        container.innerHTML = html;

        // Add animation to progress bars
        setTimeout(() => {
            const progressBars = container.querySelectorAll('.emotion-avg-item div[style*="width:"]');
            progressBars.forEach(bar => {
                bar.style.transition = 'width 0.8s ease-in-out';
            });
        }, 100);
        
    } catch (error) {
        console.error('Error updating emotion averages:', error);
    }
}

// Check if mobile view
function checkMobileView() {
    if (!toggleSidebarBtn || !sidebar) return;
    
    if (window.innerWidth <= 768) {
        // Mobile view
        toggleSidebarBtn.style.display = 'block';
        sidebar.style.display = 'none';
    } else {
        // Desktop view
        toggleSidebarBtn.style.display = 'none';
        sidebar.style.display = 'flex';
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    if (sidebar.style.display === 'none' || !sidebar.style.display) {
        sidebar.style.display = 'flex';
    } else {
        sidebar.style.display = 'none';
    }
}

// Generate a random color for user avatar
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Generate a simple user ID
function generateUserId() {
    return 'user-' + Math.random().toString(36).substr(2, 9);
}

// Scroll chat to bottom
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Update message with emotion data
function updateMessageWithEmotion(timestamp, messageData) {
    // Update bubble chat di DOM jika ada
    const msgId = `msg-${timestamp}-${messageData.userId}`;
    const bubble = chatBox ? chatBox.querySelector(`[data-message-id='${msgId}']`) : null;
    if (bubble) {
        // Hapus bubble lama
        bubble.remove();
    }
    // Render ulang bubble chat dengan data terbaru
    const type = (currentUser && (messageData.userId === currentUser.id)) ? 'sent' : 'received';
    addMessage({ ...messageData }, type);
    // Setelah update, SELALU update statistik/chart/averages real-time
    updateEmotionStats();
    updateEmotionChart();
    updateEmotionAverages();
    console.log('Updating message with emotion:', { timestamp, messageData });
    
    // Convert timestamp to number for comparison
    const targetTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    
    // Find the message element by timestamp
    const messageElements = document.querySelectorAll('.message');
    let messageFound = false;
    
    for (const element of messageElements) {
        const elementTimestamp = element.dataset.timestamp;
        const elementTimestampNum = typeof elementTimestamp === 'string' ? parseInt(elementTimestamp, 10) : elementTimestamp;
        
        if (elementTimestampNum === targetTimestamp) {
            messageFound = true;
            
            // Remove any existing analyzing indicator
            const analyzingIndicator = element.querySelector('.analyzing-indicator');
            if (analyzingIndicator) {
                analyzingIndicator.remove();
            }
            
            // Only proceed if we have emotion data to show
            if (messageData.emotion && !messageData.isAnalyzing) {
                // Update or create emotion indicator
                let emotionIndicator = element.querySelector('.emotion-indicator');
                const isOwnMessage = element.classList.contains('sent');
                
                if (!emotionIndicator) {
                    emotionIndicator = document.createElement('div');
                    emotionIndicator.className = 'emotion-indicator';
                    
                    // Position the indicator based on message type
                    emotionIndicator.style.position = 'absolute';
                    emotionIndicator.style.bottom = '-18px';
                    emotionIndicator.style.fontSize = '12px';
                    emotionIndicator.style.padding = '2px 8px';
                    emotionIndicator.style.borderRadius = '10px';
                    emotionIndicator.style.display = 'flex';
                    emotionIndicator.style.alignItems = 'center';
                    emotionIndicator.style.gap = '5px';
                    emotionIndicator.style.whiteSpace = 'nowrap';
                    
                    if (isOwnMessage) {
                        emotionIndicator.style.right = '0';
                        emotionIndicator.style.backgroundColor = '#e3f2fd';
                        emotionIndicator.style.color = '#0d47a1';
                    } else {
                        emotionIndicator.style.left = '0';
                        emotionIndicator.style.backgroundColor = '#f5f5f5';
                        emotionIndicator.style.color = '#424242';
                    }
                    
                    element.style.position = 'relative';
                    element.style.paddingBottom = '20px'; // Make room for the indicator
                    element.appendChild(emotionIndicator);
                }
                
                // Update emotion indicator content
                emotionIndicator.innerHTML = `
                    <i class="fas ${getEmotionIcon(messageData.emotion)}" style="color: ${getEmotionColor(messageData.emotion)}"></i>
                    <span>${getEmotionText(messageData.emotion)}</span>
                `;
                
                // Update emotion stats
                updateEmotionStats(messageData.emotion);
                
                // Update chart if this is a new emotion
                if (window.emotionChart) updateEmotionChart();
                
                // Add a class to indicate this message has emotion data
                element.classList.add('has-emotion');
            }
            
            // Scroll to show the updated message
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            break;
        }
    }
    
    if (!messageFound) {
        console.warn('Message with timestamp', timestamp, 'not found in DOM');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

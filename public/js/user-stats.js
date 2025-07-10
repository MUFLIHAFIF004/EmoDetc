// Statistik emosi user (POV user sendiri)
// Ambil data user dan pesan dari localStorage (chatUser) dan sessionStorage (allMessages)

function goBackToDashboard() {
    const user = JSON.parse(localStorage.getItem('chatUser') || '{}');
    let dashboard = '/user-dashboard.html';
    if (user && user.role) {
        if (user.role === 'admin') dashboard = '/dashboard-admin.html';
        else if (user.role === 'leader') dashboard = '/leader-dashboard.html';
    }
    window.location.href = dashboard;
}

function getUserMessages() {
    // Ambil roomId dari query string jika ada
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || urlParams.get('roomId') || urlParams.get('code');
    let allMessages = [];
    try {
        allMessages = JSON.parse(sessionStorage.getItem('allMessages') || '[]');
    } catch (e) {}
    const user = JSON.parse(localStorage.getItem('chatUser') || '{}');
    if (!user.id) return [];
    // Jika ada roomId di query, filter juga berdasarkan roomId
    if (roomId) {
        return allMessages.filter(m => String(m.userId) === String(user.id) && String(m.roomId) === String(roomId));
    }
    // Jika tidak ada roomId, tampilkan semua pesan user
    return allMessages.filter(m => String(m.userId) === String(user.id));
}

function renderUserStats() {
    const user = JSON.parse(localStorage.getItem('chatUser') || '{}');
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || urlParams.get('roomId') || urlParams.get('code');
    let roomName = '';
    // Coba ambil nama room dari sessionStorage jika ada
    if (roomId) {
        try {
            const allRooms = JSON.parse(sessionStorage.getItem('allRooms') || '[]');
            const found = allRooms.find(r => String(r.code) === String(roomId) || String(r.id) === String(roomId));
            if (found) roomName = found.name;
        } catch (e) {}
    }
    document.getElementById('statsUsername').textContent = user.username ? `Pengguna: ${user.username}` : '';
    if (roomName) {
        document.getElementById('statsUsername').textContent += ` | Room: ${roomName}`;
    }
    const userMessages = getUserMessages();
    // Hitung statistik emosi
    const emotionCounts = { happy: 0, sad: 0, angry: 0, neutral: 0 };
    const emotionHistory = [];
    userMessages.forEach(msg => {
        const em = msg.emotion || 'neutral';
        if (typeof emotionCounts[em] === 'number') emotionCounts[em]++;
        emotionHistory.push({
            emotion: em,
            timestamp: msg.timestamp,
            timeString: msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
            text: msg.text
        });
    });
    // Chart
    renderUserEmotionChart(emotionHistory);
    // Averages
    renderUserEmotionAverages(emotionCounts, emotionHistory.length);
}

function renderUserEmotionChart(history) {
    const ctx = document.getElementById('userEmotionChart').getContext('2d');
    if (window.userEmotionChart) { try { window.userEmotionChart.destroy(); } catch(e){} }
    const labels = history.map((entry, idx) => entry.timeString || (idx + 1).toString());
    const happyData = history.map(entry => entry.emotion === 'happy' ? 1 : 0);
    const sadData = history.map(entry => entry.emotion === 'sad' ? 1 : 0);
    const angryData = history.map(entry => entry.emotion === 'angry' ? 1 : 0);
    const neutralData = history.map(entry => entry.emotion === 'neutral' ? 1 : 0);
    window.userEmotionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Senang', data: happyData, borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.08)', fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#4caf50' },
                { label: 'Sedih', data: sadData, borderColor: '#2196f3', backgroundColor: 'rgba(33,150,243,0.08)', fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#2196f3' },
                { label: 'Marah', data: angryData, borderColor: '#f44336', backgroundColor: 'rgba(244,67,54,0.08)', fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#f44336' },
                { label: 'Netral', data: neutralData, borderColor: '#9e9e9e', backgroundColor: 'rgba(158,158,158,0.08)', fill: false, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#9e9e9e' }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top', labels: { font: { size: 14 } } },
                title: { display: true, text: 'Grafik Emosi Pesan Saya', font: { size: 18 } }
            },
            scales: {
                y: { beginAtZero: true, stepSize: 1, ticks: { precision: 0 }, title: { display: true, text: 'Jumlah Pesan' } },
                x: { title: { display: true, text: 'Waktu/Jam' } }
            }
        }
    });
}

function renderUserEmotionAverages(counts, total) {
    const container = document.getElementById('userEmotionAverages');
    if (!container) return;
    total = total || 1;
    const averages = {
        happy: ((counts.happy / total) * 100).toFixed(1),
        sad: ((counts.sad / total) * 100).toFixed(1),
        angry: ((counts.angry / total) * 100).toFixed(1),
        neutral: ((counts.neutral / total) * 100).toFixed(1)
    };
    let html = `<div style='margin-bottom:12px;'><b>Rangkuman Emosi:</b></div>`;
    html += `<ul style='list-style:none;padding:0;'>`;
    Object.entries(averages).forEach(([em, val]) => {
        const color = em === 'happy' ? '#4caf50' : em === 'sad' ? '#2196f3' : em === 'angry' ? '#f44336' : '#9e9e9e';
        const label = em === 'happy' ? 'Senang' : em === 'sad' ? 'Sedih' : em === 'angry' ? 'Marah' : 'Netral';
        html += `<li style='margin-bottom:7px;'><span style='display:inline-block;width:80px;'>${label}</span> <span style='color:${color};font-weight:bold;'>${val}%</span> <span style='font-size:12px;color:#888;'>(${counts[em]} pesan)</span></li>`;
    });
    html += `</ul>`;
    container.innerHTML = html;
}

// Pastikan data allMessages dari chat.js disimpan ke sessionStorage setiap update
// (patch di chat.js: sessionStorage.setItem('allMessages', JSON.stringify(allMessages));)

// Jalankan saat halaman siap

// Ambil statistik emosi user dari backend (API)
async function fetchUserEmotionStats() {
    const user = JSON.parse(localStorage.getItem('chatUser') || '{}');
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || urlParams.get('roomId') || urlParams.get('code');
    if (!user.id || !roomId) return null;
    try {
        const res = await fetch(`/user/api/rooms/${roomId}/user-stats`, { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Gagal fetch statistik');
        const data = await res.json();
        return data;
    } catch (e) {
        return null;
    }
}

async function renderUserStats() {
    const user = JSON.parse(localStorage.getItem('chatUser') || '{}');
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || urlParams.get('roomId') || urlParams.get('code');
    let roomName = '';
    // Coba ambil nama room dari sessionStorage jika ada
    if (roomId) {
        try {
            const allRooms = JSON.parse(sessionStorage.getItem('allRooms') || '[]');
            const found = allRooms.find(r => String(r.code) === String(roomId) || String(r.id) === String(roomId));
            if (found) roomName = found.name;
        } catch (e) {}
    }
    document.getElementById('statsUsername').textContent = user.username ? `Pengguna: ${user.username}` : '';
    if (roomName) {
        document.getElementById('statsUsername').textContent += ` | Room: ${roomName}`;
    }

    // Ambil semua pesan dari sessionStorage
    let allMessages = [];
    try {
        allMessages = JSON.parse(sessionStorage.getItem('allMessages') || '[]');
    } catch (e) {}

    // Filter pesan milik user ini saja
    const userMessages = allMessages.filter(m => m.userId == user.id);

    // Hitung statistik emosi user
    const emotionData = {
        happy: 0,
        sad: 0,
        angry: 0,
        neutral: 0,
        history: []
    };
    userMessages.forEach(msg => {
        if (typeof emotionData[msg.emotion] !== 'number') emotionData[msg.emotion] = 0;
        emotionData[msg.emotion]++;
        emotionData.history.push({
            emotion: msg.emotion,
            timestamp: new Date(msg.timestamp),
            timeString: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            username: msg.username
        });
    });
    // Limit history agar chart tidak terlalu panjang
    if (emotionData.history.length > 20) {
        emotionData.history = emotionData.history.slice(-20);
    }

    // Render chart dan rata-rata
    initEmotionChart(emotionData, 'userEmotionChart');
    updateEmotionAverages(emotionData, 'userEmotionAverages');
}

window.addEventListener('DOMContentLoaded', renderUserStats);

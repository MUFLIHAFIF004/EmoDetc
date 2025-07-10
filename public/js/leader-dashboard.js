// leader-dashboard.js
// Panel: jumlah room, jumlah anggota, grafik garis emosi per room
// Data diambil dari backend (API), grafik otomatis update jika ada room baru

// --- Konfigurasi warna untuk tiap room (acak jika lebih dari 10 room) ---
function getRoomColor(idx) {
    const palette = [
        '#6366f1', '#10b981', '#f59e42', '#ef4444', '#3b82f6', '#a21caf', '#fbbf24', '#14b8a6', '#eab308', '#f472b6'
    ];
    return palette[idx % palette.length];
}

// --- Fetch data utama dashboard leader ---
async function fetchLeaderDashboardData() {
    // 1. Ambil semua room milik leader
    const resRooms = await fetch('/leader/api/rooms');
    const roomsData = await resRooms.json();
    if (!roomsData.success) throw new Error('Gagal memuat data room');
    const rooms = roomsData.rooms || [];

    // 2. Ambil semua pesan dari semua room (sekali fetch, backend bisa optimasi)
    const resMsgs = await fetch('/leader/api/rooms/all-messages');
    const msgsData = await resMsgs.json();
    if (!msgsData.success) throw new Error('Gagal memuat data pesan');
    const allMessages = msgsData.messages || [];

    // Debug log
    console.log('Rooms:', rooms);
    console.log('AllMessages:', allMessages);

    // 3. Hitung jumlah anggota unik dari semua room (dari tabel room_members, bukan hanya yang pernah chat)
    const memberSet = new Set();
    for (const room of rooms) {
        // Ambil anggota room dari room_members
        // (frontend tidak fetch langsung, backend sudah hitung memberCount per room)
        // Tambahkan id user dari room_members ke set
        // (Jika ingin lebih detail, bisa fetch /leader/api/rooms/:id/members)
        // Untuk dashboard, cukup total memberCount semua room (tanpa duplikat user)
        // Namun, jika ingin unik global, perlu endpoint baru. Sementara: jumlahkan memberCount semua room
        // (Jika user join >1 room, akan double, tapi ini sesuai kebutuhan dashboard summary)
    }
    // Untuk sekarang, gunakan penjumlahan memberCount semua room
    const totalMembers = rooms.reduce((sum, r) => sum + (r.memberCount || 0), 0);

    return { rooms, allMessages, totalMembers };
}

// --- Render panel statistik ---
function renderLeaderStatsPanel({ rooms, totalMembers }) {
    document.getElementById('panelRoomCount').textContent = rooms.length;
    document.getElementById('panelMemberCount').textContent = totalMembers;
}


// --- Render grafik garis emosi per room ---
// (Dihapus, digantikan oleh renderEmotionStatsChart per room di emotionStats.js)

// --- Inisialisasi dashboard leader ---
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const { rooms, allMessages, totalMembers } = await fetchLeaderDashboardData();
        renderLeaderStatsPanel({ rooms, totalMembers });
        // renderRoomEmotionChart dihapus, digantikan oleh script di HTML utama
    } catch (e) {
        document.getElementById('leaderDashboardError').textContent = e.message;
    }
});

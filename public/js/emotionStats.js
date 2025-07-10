// Render grafik emosi per room (untuk dashboard leader)
function renderEmotionStatsChart(canvasId, messages) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    // Destroy chart instance if exists (per room)
    if (!window._roomCharts) window._roomCharts = {};
    if (window._roomCharts[canvasId] && typeof window._roomCharts[canvasId].destroy === 'function') {
        window._roomCharts[canvasId].destroy();
    }
    // Siapkan data emosi
    const labels = messages.map((m, idx) => m.timeString || m.created_at || (idx + 1).toString());
    const happyData = messages.map(m => m.emotion === 'happy' ? 1 : 0);
    const sadData = messages.map(m => m.emotion === 'sad' ? 1 : 0);
    const angryData = messages.map(m => m.emotion === 'angry' ? 1 : 0);
    const neutralData = messages.map(m => m.emotion === 'neutral' ? 1 : 0);
    try {
        window._roomCharts[canvasId] = new Chart(canvas, {
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
                    title: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, stepSize: 1, ticks: { precision: 0 }, title: { display: true, text: 'Jumlah Pesan' } },
                    x: { title: { display: true, text: 'Waktu/Jam' } }
                }
            }
        });
    } catch (err) {
        console.error('Error rendering emotion chart for', canvasId, err);
    }
}
// emotionStats.js
// Modul statistik emosi universal untuk chat room & halaman statistik lain
// Pastikan Chart.js sudah di-load sebelum file ini

// Inisialisasi grafik emosi
function initEmotionChart(emotionData, chartElId = 'emotionChart', chartNoticeId = 'emotionChartNotice') {
    const chartEl = document.getElementById(chartElId);
    if (!chartEl) return;
    if (window.emotionChart) {
        try { window.emotionChart.destroy(); } catch (e) {}
        window.emotionChart = null;
    }
    const notice = document.getElementById(chartNoticeId);
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
                    title: { display: true, text: 'Grafik Garis Emosi Pesan', font: { size: 18 } }
                },
                scales: {
                    y: { beginAtZero: true, stepSize: 1, ticks: { precision: 0 }, title: { display: true, text: 'Jumlah Pesan' } },
                    x: { title: { display: true, text: 'Waktu/Jam' } }
                }
            }
        });
    } catch (err) { console.error('Error initializing emotionChart:', err); }
}

// Update grafik emosi
function updateEmotionChart(emotionData) {
    if (!window.emotionChart || typeof window.emotionChart.data === 'undefined') return;
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
}

// Update rata-rata emosi
function updateEmotionAverages(emotionData, containerId = 'emotionAverages') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const total = emotionData.history.length || 1;
    const counts = {
        happy: Number(emotionData.happy) || 0,
        sad: Number(emotionData.sad) || 0,
        angry: Number(emotionData.angry) || 0,
        neutral: Number(emotionData.neutral) || 0
    };
    const averages = {
        happy: ((counts.happy / total) * 100).toFixed(1),
        sad: ((counts.sad / total) * 100).toFixed(1),
        angry: ((counts.angry / total) * 100).toFixed(1),
        neutral: ((counts.neutral / total) * 100).toFixed(1)
    };
    let html = `<div class="emotion-avg-header" style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #333;">Statistik Emosi</h3>
        <p style="margin: 0; font-size: 13px; color: #666;">Total pesan: ${total}</p>
    </div><div class="emotion-avg-list" style="margin-bottom: 20px;">`;
    Object.entries(averages).forEach(([emotion, value]) => {
        html += `<div style="margin-bottom: 10px;">
            <span style="font-weight:600;min-width:60px;display:inline-block;color:${getEmotionColor(emotion)}">${getEmotionText(emotion)}</span>
            <span style="margin-left:8px;font-size:13px;">${value}%</span>
            <div style="background:#eee;height:8px;border-radius:5px;overflow:hidden;margin-top:4px;">
                <div style="width:${value}%;background:${getEmotionColor(emotion)};height:100%;transition:width .5s;"></div>
            </div>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Utilitas emosi universal
function getEmotionIcon(emotion) {
    switch(emotion) {
        case 'happy': return 'fa-laugh';
        case 'sad': return 'fa-sad-tear';
        case 'angry': return 'fa-angry';
        default: return 'fa-meh';
    }
}
function getEmotionText(emotion) {
    switch(emotion) {
        case 'happy': return 'Senang';
        case 'sad': return 'Sedih';
        case 'angry': return 'Marah';
        default: return 'Netral';
    }
}
function getEmotionColor(emotion) {
    switch(emotion) {
        case 'happy': return '#4caf50';
        case 'sad': return '#2196f3';
        case 'angry': return '#f44336';
        default: return '#9e9e9e';
    }
}

// Export fungsi agar bisa dipakai di file lain (jika pakai module)
// window.emotionStats = { initEmotionChart, updateEmotionChart, updateEmotionAverages, getEmotionIcon, getEmotionText, getEmotionColor };

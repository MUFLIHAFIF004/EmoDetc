/**
 * EmoDetc - Report JavaScript
 * Handles weekly report functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if there's mood data and update UI accordingly
    updateReportUI();
    
    // Setup export PDF button
    setupExportButton();
});

// Update report UI based on data availability
function updateReportUI() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    if (moodData.length > 0) {
        // Generate and display report
        generateReport();
        
        // Enable export button
        document.getElementById('export-pdf').disabled = false;
    }
}

// Setup export PDF button
function setupExportButton() {
    const exportButton = document.getElementById('export-pdf');
    if (exportButton) {
        exportButton.addEventListener('click', exportPDF);
    }
}

// Generate weekly report
function generateReport() {
    const reportContainer = document.getElementById('report-content');
    if (!reportContainer) return;
    
    // Get weekly summary data
    const summary = getWeeklySummary();
    
    // If no entries, keep empty state
    if (summary.totalEntries === 0) return;
    
    // Remove empty state
    reportContainer.classList.remove('empty-state');
    
    // Get current date range for the report
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const startDate = formatDate(oneWeekAgo);
    const endDate = formatDate(today);
    
    // Create report content
    let moodDescription = '';
    switch (summary.dominantMood) {
        case 'senang':
            moodDescription = 'Tim secara umum bahagia dan produktif.';
            break;
        case 'netral':
            moodDescription = 'Tim mempertahankan mood yang seimbang.';
            break;
        case 'cemas':
            moodDescription = 'Tim mengalami beberapa kecemasan yang perlu ditangani.';
            break;
        case 'marah':
            moodDescription = 'Tim menghadapi frustrasi yang memerlukan perhatian segera.';
            break;
        default:
            moodDescription = 'Mood tim bervariasi.';
    }
    
    let trendDescription = '';
    switch (summary.trend) {
        case 'improving':
            trendDescription = 'Mood tim membaik, ini adalah tanda positif.';
            break;
        case 'declining':
            trendDescription = 'Mood tim menurun, mungkin memerlukan intervensi.';
            break;
        default:
            trendDescription = 'Mood tim stabil.';
    }
    
    reportContainer.innerHTML = `
        <h3>Laporan Mood Mingguan: ${startDate} hingga ${endDate}</h3>
        <p><strong>Ringkasan:</strong> ${moodDescription} ${trendDescription}</p>
        <p><strong>Distribusi Mood:</strong></p>
        <ul>
            <li>Senang: ${summary.moodCounts.senang} entri</li>
            <li>Netral: ${summary.moodCounts.netral} entri</li>
            <li>Cemas: ${summary.moodCounts.cemas} entri</li>
            <li>Marah: ${summary.moodCounts.marah} entri</li>
        </ul>
        <p><strong>Rekomendasi:</strong></p>
        <ul>
            ${summary.trend === 'declining' ? '<li>Jadwalkan pertemuan tim untuk mengatasi masalah</li>' : ''}
            ${summary.dominantMood === 'marah' ? '<li>Identifikasi dan selesaikan sumber frustrasi</li>' : ''}
            ${summary.dominantMood === 'cemas' ? '<li>Berikan dukungan dan sumber daya tambahan</li>' : ''}
            ${summary.dominantMood === 'senang' ? '<li>Pertahankan lingkungan positif saat ini</li>' : ''}
            <li>Lanjutkan memantau mood tim</li>
        </ul>
    `;
}

// Get weekly summary data
function getWeeklySummary() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    
    // If no data, return empty summary
    if (moodData.length === 0) {
        return {
            totalEntries: 0,
            moodCounts: { senang: 0, netral: 0, cemas: 0, marah: 0 },
            dominantMood: 'netral',
            averageMood: 0,
            trend: 'stable'
        };
    }
    
    // Get data from the last 7 days
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyData = moodData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo && entryDate <= today;
    });
    
    // Count occurrences of each mood
    const moodCounts = {
        senang: 0,
        netral: 0,
        cemas: 0,
        marah: 0
    };
    
    weeklyData.forEach(entry => {
        if (moodCounts.hasOwnProperty(entry.moodWord)) {
            moodCounts[entry.moodWord]++;
        }
    });
    
    // Determine dominant mood
    let dominantMood = 'netral';
    let maxCount = 0;
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            dominantMood = mood;
        }
    }
    
    // Calculate average mood value
    const moodValues = weeklyData.map(entry => {
        switch (entry.moodWord) {
            case 'senang': return 5;
            case 'netral': return 3;
            case 'cemas': return 2;
            case 'marah': return 1;
            default: return 3;
        }
    });
    
    const averageMood = moodValues.length > 0 
        ? moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length 
        : 0;
    
    // Determine trend
    let trend = 'stable';
    if (moodValues.length >= 2) {
        const firstHalf = moodValues.slice(0, Math.floor(moodValues.length / 2));
        const secondHalf = moodValues.slice(Math.floor(moodValues.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
        
        if (secondHalfAvg > firstHalfAvg + 0.5) {
            trend = 'improving';
        } else if (secondHalfAvg < firstHalfAvg - 0.5) {
            trend = 'declining';
        }
    }
    
    return {
        totalEntries: weeklyData.length,
        moodCounts,
        dominantMood,
        averageMood,
        trend
    };
}

// Export PDF (dummy function)
function exportPDF() {
    alert('Fungsi ekspor PDF akan diimplementasikan di sini. Pada aplikasi nyata, ini akan menghasilkan laporan PDF dari data mood mingguan.');
}

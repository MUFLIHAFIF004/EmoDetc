/**
 * EmoDetc - History JavaScript
 * Handles mood history functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Display mood history
    displayMoodHistory();
});

// Display mood history
function displayMoodHistory() {
    const moodData = JSON.parse(localStorage.getItem('moodData')) || [];
    const historyContainer = document.getElementById('history-container');
    const tableContainer = document.getElementById('table-container');
    const historyBody = document.getElementById('history-body');
    
    if (!historyContainer || !tableContainer || !historyBody) return;
    
    // Check if there's any mood data
    if (moodData.length === 0) {
        historyContainer.classList.add('empty-state');
        tableContainer.style.display = 'none';
        return;
    }
    
    // Show table and hide empty state
    historyContainer.classList.remove('empty-state');
    tableContainer.style.display = 'block';
    
    // Sort by date, newest first
    const sortedData = [...moodData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear existing content
    historyBody.innerHTML = '';
    
    // Add history entries
    sortedData.forEach(entry => {
        const row = document.createElement('tr');
        
        // Format date
        const formattedDate = formatDate(entry.date);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${entry.moodEmoji}</td>
            <td>${entry.moodWord.charAt(0).toUpperCase() + entry.moodWord.slice(1)}</td>
            <td>${entry.note || '-'}</td>
        `;
        
        historyBody.appendChild(row);
    });
}

/**
 * Mood Check Component
 * Bagian dari lapisan Input dalam arsitektur 3 lapisan
 */

const MoodCheckComponent = {
    init: function(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
    },
    
    render: function() {
        const html = `
            <div class="bg-white p-6 rounded-lg shadow-md mx-auto max-w-2xl">
                <h2 class="text-2xl font-bold mb-6 text-indigo-700">Cek Mood Harian</h2>
                
                <div class="mb-6">
                    <div class="flex justify-around mb-4">
                        <div class="mood-color bg-green-500" data-mood="happy"></div>
                        <div class="mood-color bg-yellow-500" data-mood="neutral"></div>
                        <div class="mood-color bg-red-500" data-mood="angry"></div>
                        <div class="mood-color bg-blue-500" data-mood="sad"></div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2" for="mood-note">Catatan (opsional):</label>
                    <textarea id="mood-note" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" placeholder="Ceritakan lebih detail tentang mood Anda hari ini..."></textarea>
                </div>
                
                <button id="submit-mood" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Kirim Data Mood
                </button>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Initialize FaceTracker component
        if (typeof FaceTrackerComponent !== 'undefined') {
            const faceTrackerContainer = document.getElementById('face-tracker-container');
            FaceTrackerComponent.init(faceTrackerContainer);
        }
    },
    
    setupEventListeners: function() {
        // Color selection
        const colorElements = this.container.querySelectorAll('.mood-color');
        colorElements.forEach(color => {
            color.addEventListener('click', () => {
                // Remove selected class from all colors
                colorElements.forEach(c => c.classList.remove('selected'));
                
                // Add selected class to clicked color
                color.classList.add('selected');
                
                // Store selected mood
                this.selectedMood = color.getAttribute('data-mood');
            });
        });
        
        // Submit button
        const submitButton = this.container.querySelector('#submit-mood');
        submitButton.addEventListener('click', () => {
            if (!this.selectedMood) {
                alert('Silakan pilih mood terlebih dahulu');
                return;
            }
            
            const moodNote = this.container.querySelector('#mood-note').value;
            
            // Prepare data
            const moodData = {
                mood: this.selectedMood,
                note: moodNote,
                timestamp: new Date().toISOString()
            };
            
            // Save mood data using core function
            core.saveMoodData(moodData)
                .then(response => {
                    // Show success message
                    alert('Mood berhasil disimpan!');
                    
                    // Reset form
                    this.container.querySelector('#mood-note').value = '';
                    colorElements.forEach(c => c.classList.remove('selected'));
                    this.selectedMood = null;
                })
                .catch(error => {
                    console.error('Error saving mood:', error);
                    alert('Gagal menyimpan mood. Silakan coba lagi.');
                });
        });
    }
};

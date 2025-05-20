/**
 * Face Tracker Component
 * Bagian dari lapisan Input dalam arsitektur 3 lapisan
 */

const FaceTrackerComponent = {
    video: null,
    canvas: null,
    context: null,
    videoStream: null,
    isRunning: false,
    emotionResult: null,
    toggleButton: null,
    cameraContainer: null,
    trackerOffText: null,
    trackerOnText: null,
    
    init: function(container) {
        this.container = container;
        this.setupElements();
        this.setupEventListeners();
    },
    
    setupElements: function() {
        // Get references to the elements that already exist in the HTML
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas ? this.canvas.getContext('2d') : null;
        this.emotionResult = document.getElementById('emotion-result');
        this.toggleButton = document.getElementById('toggle-face-tracker');
        this.cameraContainer = document.getElementById('camera-container');
        this.trackerOffText = document.querySelector('.tracker-off');
        this.trackerOnText = document.querySelector('.tracker-on');
    },
    
    setupEventListeners: function() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                if (this.isRunning) {
                    this.stopCamera();
                } else {
                    this.startCamera();
                }
            });
        }
    },
    
    startCamera: function() {
        if (!this.video || !this.cameraContainer) return;
        
        // Show camera container
        this.cameraContainer.classList.remove('hidden');
        
        // Update button text
        if (this.trackerOffText && this.trackerOnText) {
            this.trackerOffText.classList.add('hidden');
            this.trackerOnText.classList.remove('hidden');
        }
        
        // Set initial emotion result text
        if (this.emotionResult) {
            this.emotionResult.textContent = 'Mendeteksi ekspresi wajah...';
        }
        
        // Request access to webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.videoStream = stream;
                this.video.srcObject = stream;
                this.isRunning = true;
                
                // Start emotion detection loop
                this.detectEmotion();
                
                console.log('Camera started');
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                
                if (this.emotionResult) {
                    this.emotionResult.textContent = 'Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.';
                    this.emotionResult.className = 'mt-3 p-2 bg-red-100 text-red-800 rounded-md text-center font-medium';
                }
            });
    },
    
    stopCamera: function() {
        // Stop all video streams
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => {
                track.stop();
            });
            this.videoStream = null;
        }
        
        // Clear video source
        if (this.video) {
            this.video.srcObject = null;
        }
        
        // Hide camera container
        if (this.cameraContainer) {
            this.cameraContainer.classList.add('hidden');
        }
        
        // Update button text
        if (this.trackerOffText && this.trackerOnText) {
            this.trackerOffText.classList.remove('hidden');
            this.trackerOnText.classList.add('hidden');
        }
        
        this.isRunning = false;
        console.log('Camera stopped');
    },
    
    detectEmotion: function() {
        if (!this.isRunning || !this.video || !this.canvas || !this.context || !this.emotionResult) return;
        
        // Draw video frame to canvas for analysis
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // In a real application, this would analyze the canvas data
        // Here we'll simulate the analysis with a random emotion every few seconds
        if (Math.random() < 0.05) { // 5% chance to update emotion each frame
            this.simulateEmotionDetection();
        }
        
        // Continue detection loop
        requestAnimationFrame(() => this.detectEmotion());
    },
    
    simulateEmotionDetection: function() {
        // Simulate emotion detection
        const emotions = ['Senang', 'Netral', 'Marah', 'Sedih'];
        const confidences = [Math.random(), Math.random(), Math.random(), Math.random()];
        
        // Normalize confidences to sum to 1
        const sum = confidences.reduce((a, b) => a + b, 0);
        const normalizedConfidences = confidences.map(c => c / sum);
        
        // Find highest confidence emotion
        let maxIndex = 0;
        for (let i = 1; i < normalizedConfidences.length; i++) {
            if (normalizedConfidences[i] > normalizedConfidences[maxIndex]) {
                maxIndex = i;
            }
        }
        
        const detectedEmotion = emotions[maxIndex];
        const confidence = Math.round(normalizedConfidences[maxIndex] * 100);
        
        // Map emotion to mood
        const moodMap = {
            'Senang': 'happy',
            'Netral': 'neutral',
            'Marah': 'angry',
            'Sedih': 'sad'
        };
        
        const moodColors = {
            'happy': 'bg-green-100 text-green-800',
            'neutral': 'bg-yellow-100 text-yellow-800',
            'angry': 'bg-red-100 text-red-800',
            'sad': 'bg-blue-100 text-blue-800'
        };
        
        // Update result
        this.emotionResult.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="mood-indicator ${moodMap[detectedEmotion] === 'happy' ? 'bg-green-500' : 
                                           moodMap[detectedEmotion] === 'neutral' ? 'bg-yellow-500' : 
                                           moodMap[detectedEmotion] === 'angry' ? 'bg-red-500' : 'bg-blue-500'} mr-2"></div>
                <span><strong>Emosi Terdeteksi:</strong> ${detectedEmotion} (${confidence}%)</span>
            </div>
        `;
        
        // Update emotion result class based on detected mood
        this.emotionResult.className = `mt-3 p-2 ${moodColors[moodMap[detectedEmotion]]} rounded-md text-center font-medium`;
        
        // Save detected mood to app state
        if (typeof appState !== 'undefined' && appState.user) {
            appState.user.currentMood = moodMap[detectedEmotion];
            console.log('Mood updated from face detection:', moodMap[detectedEmotion]);
        }
    }
};

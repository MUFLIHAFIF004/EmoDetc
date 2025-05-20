/**
 * Face Tracker Component
 * Bagian dari lapisan Input dalam arsitektur 3 lapisan
 */

const FaceTrackerComponent = {
    init: function(container) {
        this.container = container;
        this.videoStream = null;
        this.snapshotData = null;
        this.render();
        this.setupEventListeners();
        
        // Automatically start camera when component is initialized
        setTimeout(() => {
            this.startCamera();
        }, 1000);
    },
    
    render: function() {
        const html = `
            <h2 class="text-2xl font-bold mb-6 text-indigo-700">FaceTracker</h2>
            
            <div class="video-container mb-4">
                <video id="video-element" class="w-full h-auto" autoplay playsinline></video>
                <div id="camera-status" class="text-center py-2 bg-gray-200">Menginisialisasi kamera...</div>
            </div>
            
            <div class="flex justify-between mb-4">
                <button id="start-camera" class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Mulai Kamera
                </button>
                <button id="take-snapshot" class="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors" disabled>
                    Ambil Snapshot
                </button>
                <button id="stop-camera" class="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors" disabled>
                    Matikan Kamera
                </button>
            </div>
            
            <div class="snapshot-container hidden" id="snapshot-container">
                <h3 class="text-lg font-semibold mb-2">Snapshot Ekspresi</h3>
                <canvas id="snapshot-canvas" class="w-full h-auto"></canvas>
                
                <div class="mt-4">
                    <button id="analyze-snapshot" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        Kirim ke Analisis
                    </button>
                </div>
            </div>
            
            <div id="analysis-result" class="mt-4 hidden">
                <h3 class="text-lg font-semibold mb-2">Hasil Analisis</h3>
                <div class="p-4 bg-gray-100 rounded-lg">
                    <p id="emotion-result">Menunggu analisis...</p>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    },
    
    setupEventListeners: function() {
        const startButton = this.container.querySelector('#start-camera');
        const stopButton = this.container.querySelector('#stop-camera');
        const snapshotButton = this.container.querySelector('#take-snapshot');
        const analyzeButton = this.container.querySelector('#analyze-snapshot');
        
        // Start camera
        startButton.addEventListener('click', () => {
            this.startCamera();
        });
        
        // Stop camera
        stopButton.addEventListener('click', () => {
            this.stopCamera();
        });
        
        // Take snapshot
        snapshotButton.addEventListener('click', () => {
            this.takeSnapshot();
        });
        
        // Analyze snapshot
        analyzeButton.addEventListener('click', () => {
            this.analyzeSnapshot();
        });
    },
    
    startCamera: function() {
        const videoElement = this.container.querySelector('#video-element');
        const startButton = this.container.querySelector('#start-camera');
        const stopButton = this.container.querySelector('#stop-camera');
        const snapshotButton = this.container.querySelector('#take-snapshot');
        const cameraStatus = this.container.querySelector('#camera-status');
        
        // Update status
        cameraStatus.textContent = 'Meminta akses kamera...';
        cameraStatus.className = 'text-center py-2 bg-yellow-200';
        
        // Request access to webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.videoStream = stream;
                videoElement.srcObject = stream;
                
                // Update button states
                startButton.disabled = true;
                stopButton.disabled = false;
                snapshotButton.disabled = false;
                
                // Update status
                cameraStatus.textContent = 'Kamera aktif';
                cameraStatus.className = 'text-center py-2 bg-green-200';
                
                console.log('Camera started');
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                
                // Update status
                cameraStatus.textContent = 'Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.';
                cameraStatus.className = 'text-center py-2 bg-red-200';
                
                alert('Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
            });
    },
    
    stopCamera: function() {
        const videoElement = this.container.querySelector('#video-element');
        const startButton = this.container.querySelector('#start-camera');
        const stopButton = this.container.querySelector('#stop-camera');
        const snapshotButton = this.container.querySelector('#take-snapshot');
        
        // Stop all video streams
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => {
                track.stop();
            });
            this.videoStream = null;
        }
        
        // Clear video source
        videoElement.srcObject = null;
        
        // Update button states
        startButton.disabled = false;
        stopButton.disabled = true;
        snapshotButton.disabled = true;
        
        console.log('Camera stopped');
    },
    
    takeSnapshot: function() {
        const videoElement = this.container.querySelector('#video-element');
        const canvas = this.container.querySelector('#snapshot-canvas');
        const snapshotContainer = this.container.querySelector('#snapshot-container');
        
        // Set canvas dimensions to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Store snapshot data
        this.snapshotData = canvas.toDataURL('image/png');
        
        // Show snapshot container
        snapshotContainer.classList.remove('hidden');
        
        console.log('Snapshot taken');
    },
    
    analyzeSnapshot: function() {
        // In a real application, this would send the image to a backend for analysis
        // Here we'll simulate the analysis with a random emotion
        
        const analysisResult = this.container.querySelector('#analysis-result');
        const emotionResult = this.container.querySelector('#emotion-result');
        
        // Show analysis container
        analysisResult.classList.remove('hidden');
        
        // Simulate loading
        emotionResult.textContent = 'Menganalisis...';
        
        // Simulate API call delay
        setTimeout(() => {
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
            
            // Update result
            emotionResult.innerHTML = `
                <p><strong>Emosi Terdeteksi:</strong> ${detectedEmotion}</p>
                <p><strong>Keyakinan:</strong> ${confidence}%</p>
                <p class="text-sm text-gray-500 mt-2">Catatan: Ini adalah simulasi deteksi emosi.</p>
            `;
            
            // Map emotion to mood
            const moodMap = {
                'Senang': 'happy',
                'Netral': 'neutral',
                'Marah': 'angry',
                'Sedih': 'sad'
            };
            
            // Save detected mood
            const moodData = {
                mood: moodMap[detectedEmotion],
                note: `Terdeteksi dari ekspresi wajah (${confidence}% keyakinan)`,
                source: 'facetracker'
            };
            
            // Save mood data using core function
            core.saveMoodData(moodData)
                .then(response => {
                    console.log('Mood dari ekspresi wajah berhasil disimpan');
                })
                .catch(error => {
                    console.error('Error saving mood from face expression:', error);
                });
            
        }, 2000);
    }
};

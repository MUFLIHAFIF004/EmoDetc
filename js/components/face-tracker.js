/**
 * Face Tracker Component
 * Parte da camada de entrada (Input Layer) na arquitetura de 3 camadas
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
        // Obter referências para os elementos que já existem no HTML
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
        
        // Mostrar o container da câmera
        this.cameraContainer.classList.remove('hidden');
        
        // Atualizar o texto do botão
        if (this.trackerOffText && this.trackerOnText) {
            this.trackerOffText.classList.add('hidden');
            this.trackerOnText.classList.remove('hidden');
        }
        
        // Definir o texto inicial do resultado de emoção
        if (this.emotionResult) {
            this.emotionResult.textContent = 'Detectando expressão facial...';
        }
        
        // Solicitar acesso à webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.videoStream = stream;
                this.video.srcObject = stream;
                this.isRunning = true;
                
                // Iniciar o loop de detecção de emoção
                this.detectEmotion();
                
                console.log('Câmera iniciada');
            })
            .catch(error => {
                console.error('Erro ao acessar a câmera:', error);
                
                if (this.emotionResult) {
                    this.emotionResult.textContent = 'Falha ao acessar a câmera. Certifique-se de conceder permissão de acesso à câmera.';
                    this.emotionResult.className = 'mt-3 p-2 bg-red-100 text-red-800 rounded-md text-center font-medium';
                }
            });
    },
    
    stopCamera: function() {
        // Parar todos os streams de vídeo
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => {
                track.stop();
            });
            this.videoStream = null;
        }
        
        // Limpar a fonte de vídeo
        if (this.video) {
            this.video.srcObject = null;
        }
        
        // Ocultar o container da câmera
        if (this.cameraContainer) {
            this.cameraContainer.classList.add('hidden');
        }
        
        // Atualizar o texto do botão
        if (this.trackerOffText && this.trackerOnText) {
            this.trackerOffText.classList.remove('hidden');
            this.trackerOnText.classList.add('hidden');
        }
        
        this.isRunning = false;
        console.log('Câmera parada');
    },
    
    detectEmotion: function() {
        if (!this.isRunning || !this.video || !this.canvas || !this.context || !this.emotionResult) return;
        
        // Desenhar o quadro de vídeo no canvas para análise
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Em uma aplicação real, isso analisaria os dados do canvas
        // Aqui vamos simular a análise com uma emoção aleatória a cada poucos segundos
        if (Math.random() < 0.05) { // 5% de chance de atualizar a emoção a cada quadro
            this.simulateEmotionDetection();
        }
        
        // Continuar o loop de detecção
        requestAnimationFrame(() => this.detectEmotion());
    },
    
    simulateEmotionDetection: function() {
        // Simular detecção de emoção
        const emotions = ['Senang', 'Netral', 'Marah', 'Sedih'];
        const confidences = [Math.random(), Math.random(), Math.random(), Math.random()];
        
        // Normalizar as confidências para somar 1
        const sum = confidences.reduce((a, b) => a + b, 0);
        const normalizedConfidences = confidences.map(c => c / sum);
        
        // Encontrar a emoção com maior confiança
        let maxIndex = 0;
        for (let i = 1; i < normalizedConfidences.length; i++) {
            if (normalizedConfidences[i] > normalizedConfidences[maxIndex]) {
                maxIndex = i;
            }
        }
        
        const detectedEmotion = emotions[maxIndex];
        const confidence = Math.round(normalizedConfidences[maxIndex] * 100);
        
        // Mapear emoção para humor
        const moodMap = {
            'Senang': 'happy',
            'Netral': 'neutral',
            'Marah': 'angry',
            'Sedih': 'sad'
        };
        
        const moodIcons = {
            'happy': '😊',
            'neutral': '😐',
            'angry': '😠',
            'sad': '😢'
        };
        
        // Atualizar o resultado com mais apelo visual
        this.emotionResult.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="flex items-center bg-white px-3 py-2 rounded-full shadow-sm border border-${moodMap[detectedEmotion] === 'happy' ? 'green' : 
                                                                                                   moodMap[detectedEmotion] === 'neutral' ? 'yellow' : 
                                                                                                   moodMap[detectedEmotion] === 'angry' ? 'red' : 'blue'}-200">
                    <span class="text-2xl mr-2">${moodIcons[moodMap[detectedEmotion]]}</span>
                    <div>
                        <div class="font-semibold">${detectedEmotion}</div>
                        <div class="text-xs text-gray-500">Keyakinan: ${confidence}%</div>
                    </div>
                </div>
            </div>
        `;
        
        // Definir o seletor de humor para corresponder ao humor detectado
        const moodSelectors = document.querySelectorAll('.mood-selector');
        moodSelectors.forEach(selector => {
            selector.classList.remove('ring-2', 'ring-indigo-500', 'scale-110');
            if (selector.getAttribute('data-mood') === moodMap[detectedEmotion]) {
                selector.classList.add('ring-2', 'ring-indigo-500', 'scale-110');
                
                // Também atualizar o humor selecionado no componente de discussão, se existir
                if (typeof DiscussionComponent !== 'undefined') {
                    DiscussionComponent.selectedMood = moodMap[detectedEmotion];
                    DiscussionComponent.highlightSelectedMood();
                }
            }
        });
        
        // Salvar o humor detectado no estado da aplicação
        if (typeof appState !== 'undefined' && appState.user) {
            appState.user.currentMood = moodMap[detectedEmotion];
            console.log('Humor atualizado a partir da detecção facial:', moodMap[detectedEmotion]);
        }
    }
};

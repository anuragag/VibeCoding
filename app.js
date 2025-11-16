// VibeCoding - Voice Cortex Agent Application
class VoiceCortexApp {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isProcessing = false;
        this.conversation = [];
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.visualizerAnimation = null;

        // Load settings from localStorage
        this.settings = this.loadSettings();

        // Initialize components
        this.initElements();
        this.initSpeechRecognition();
        this.initEventListeners();
        this.initAudioVisualization();
    }

    initElements() {
        // Main elements
        this.micButton = document.getElementById('micButton');
        this.micStatus = document.getElementById('micStatus');
        this.transcriptText = document.getElementById('transcriptText');
        this.messages = document.getElementById('messages');
        this.chatContainer = document.getElementById('chatContainer');
        this.visualizerContainer = document.getElementById('visualizerContainer');
        this.visualizer = document.getElementById('visualizer');

        // Settings elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.cancelSettings = document.getElementById('cancelSettings');
        this.saveSettings = document.getElementById('saveSettings');

        // Settings inputs
        this.accountInput = document.getElementById('accountInput');
        this.usernameInput = document.getElementById('usernameInput');
        this.passwordInput = document.getElementById('passwordInput');
        this.warehouseInput = document.getElementById('warehouseInput');
        this.databaseInput = document.getElementById('databaseInput');
        this.schemaInput = document.getElementById('schemaInput');
        this.agentInput = document.getElementById('agentInput');
        this.languageSelect = document.getElementById('languageSelect');

        // Action buttons
        this.clearBtn = document.getElementById('clearBtn');
        this.stopBtn = document.getElementById('stopBtn');

        // Populate settings if they exist
        this.populateSettings();
    }

    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.settings.language || 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI('listening');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                this.transcriptText.textContent = interimTranscript;
                this.transcriptText.classList.add('listening');
            }

            if (finalTranscript) {
                this.handleFinalTranscript(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                this.updateUI('ready');
            } else if (event.error !== 'aborted') {
                this.showError(`Speech recognition error: ${event.error}`);
                this.updateUI('ready');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (!this.isProcessing) {
                this.updateUI('ready');
            }
            this.stopAudioVisualization();
        };
    }

    initAudioVisualization() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
        } catch (error) {
            console.warn('Audio visualization not available:', error);
        }
    }

    async startAudioVisualization() {
        if (!this.audioContext || !this.analyser) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);

            this.visualizerContainer.classList.add('active');
            this.drawVisualization();
        } catch (error) {
            console.warn('Could not start audio visualization:', error);
        }
    }

    stopAudioVisualization() {
        if (this.visualizerAnimation) {
            cancelAnimationFrame(this.visualizerAnimation);
            this.visualizerAnimation = null;
        }

        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        this.visualizerContainer.classList.remove('active');

        // Clear the canvas
        const canvas = this.visualizer;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawVisualization() {
        if (!this.analyser || !this.isListening) return;

        const canvas = this.visualizer;
        const ctx = canvas.getContext('2d');
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            this.visualizerAnimation = requestAnimationFrame(draw);

            this.analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#f093fb');
                gradient.addColorStop(1, '#f5576c');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    }

    initEventListeners() {
        // Microphone button
        this.micButton.addEventListener('click', () => this.toggleListening());

        // Settings
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.cancelSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => this.saveSettingsData());

        // Action buttons
        this.clearBtn.addEventListener('click', () => this.clearConversation());
        this.stopBtn.addEventListener('click', () => this.stopListening());

        // Close modal on outside click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.settingsModal.classList.contains('active')) {
                    this.closeSettingsModal();
                } else if (this.isListening) {
                    this.stopListening();
                }
            } else if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition) {
            this.showError('Speech recognition is not available');
            return;
        }

        if (!this.validateSettings()) {
            this.showError('Please configure your Snowflake settings first');
            this.openSettings();
            return;
        }

        try {
            this.recognition.lang = this.settings.language || 'en-US';
            this.recognition.start();
            this.startAudioVisualization();
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    updateUI(state) {
        switch (state) {
            case 'listening':
                this.micButton.classList.add('listening');
                this.micStatus.textContent = 'Listening...';
                this.micStatus.classList.add('listening');
                this.stopBtn.style.display = 'flex';
                break;
            case 'processing':
                this.micButton.classList.remove('listening');
                this.micStatus.textContent = 'Processing...';
                this.micStatus.classList.remove('listening');
                this.micStatus.classList.add('processing');
                this.stopBtn.style.display = 'none';
                break;
            case 'ready':
            default:
                this.micButton.classList.remove('listening');
                this.micStatus.textContent = 'Ready';
                this.micStatus.classList.remove('listening', 'processing');
                this.stopBtn.style.display = 'none';
                this.transcriptText.textContent = 'Tap microphone to speak...';
                this.transcriptText.classList.remove('listening');
                break;
        }
    }

    async handleFinalTranscript(transcript) {
        if (!transcript.trim()) return;

        this.stopListening();
        this.isProcessing = true;
        this.updateUI('processing');

        // Add user message
        this.addMessage('user', transcript);

        // Send to Cortex Agent
        try {
            const response = await this.sendToCortexAgent(transcript);
            this.addMessage('agent', response);
        } catch (error) {
            console.error('Error communicating with Cortex Agent:', error);
            this.showError('Error communicating with Cortex Agent: ' + error.message);
            this.addMessage('agent', 'Sorry, I encountered an error processing your request. Please check your Snowflake configuration.');
        } finally {
            this.isProcessing = false;
            this.updateUI('ready');
        }
    }

    async sendToCortexAgent(message) {
        const { account, username, password, warehouse, database, schema, agent } = this.settings;

        // Validate settings
        if (!account || !username || !agent) {
            throw new Error('Snowflake configuration incomplete. Please check your settings.');
        }

        try {
            // Call backend API
            const response = await fetch('/api/cortex-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account,
                    username,
                    password,
                    warehouse,
                    database,
                    schema,
                    agent,
                    message,
                    conversation: this.conversation
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error calling Cortex Agent API:', error);
            throw error;
        }
    }

    addMessage(type, text) {
        // Remove welcome message if it exists
        const welcomeMessage = this.messages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        this.messages.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

        // Add to conversation history
        this.conversation.push({ role: type, content: text, timestamp: Date.now() });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearConversation() {
        if (confirm('Are you sure you want to clear the conversation?')) {
            this.conversation = [];
            this.messages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🎙️</div>
                    <h2>Welcome to VibeCoding</h2>
                    <p>Tap the microphone to start speaking with your Snowflake Cortex Agent</p>
                </div>
            `;
        }
    }

    openSettings() {
        this.settingsModal.classList.add('active');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
    }

    populateSettings() {
        this.accountInput.value = this.settings.account || '';
        this.usernameInput.value = this.settings.username || '';
        this.passwordInput.value = this.settings.password || '';
        this.warehouseInput.value = this.settings.warehouse || 'COMPUTE_WH';
        this.databaseInput.value = this.settings.database || 'CORTEX_DB';
        this.schemaInput.value = this.settings.schema || 'AGENTS';
        this.agentInput.value = this.settings.agent || 'MY_AGENT';
        this.languageSelect.value = this.settings.language || 'en-US';
    }

    saveSettingsData() {
        this.settings = {
            account: this.accountInput.value.trim(),
            username: this.usernameInput.value.trim(),
            password: this.passwordInput.value,
            warehouse: this.warehouseInput.value.trim() || 'COMPUTE_WH',
            database: this.databaseInput.value.trim() || 'CORTEX_DB',
            schema: this.schemaInput.value.trim() || 'AGENTS',
            agent: this.agentInput.value.trim() || 'MY_AGENT',
            language: this.languageSelect.value
        };

        localStorage.setItem('vibecoding-settings', JSON.stringify(this.settings));

        // Update recognition language if it exists
        if (this.recognition) {
            this.recognition.lang = this.settings.language;
        }

        this.closeSettingsModal();
        this.showSuccess('Settings saved successfully!');
    }

    loadSettings() {
        const saved = localStorage.getItem('vibecoding-settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
        return {
            account: '',
            username: '',
            password: '',
            warehouse: 'COMPUTE_WH',
            database: 'CORTEX_DB',
            schema: 'AGENTS',
            agent: 'MY_AGENT',
            language: 'en-US'
        };
    }

    validateSettings() {
        return this.settings.account &&
               this.settings.username &&
               this.settings.agent;
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ea4335' : type === 'success' ? '#34a853' : '#4285f4'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: slideDown 0.3s ease-out;
            max-width: 90%;
            text-align: center;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VoiceCortexApp();
});

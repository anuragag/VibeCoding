// Configuration for VibeCoding application
export const config = {
    // API Configuration
    api: {
        // Set to true to use demo mode (simulated responses)
        // Set to false to use actual Snowflake Cortex backend
        demoMode: false,

        // Backend server URL (when not in demo mode)
        serverUrl: 'http://localhost:3000',

        // API endpoints
        endpoints: {
            cortexAgent: '/api/cortex-agent',
            testConnection: '/api/test-connection',
            health: '/api/health'
        },

        // Request timeout in milliseconds
        timeout: 30000
    },

    // Speech Recognition Configuration
    speech: {
        // Default language
        defaultLanguage: 'en-US',

        // Continuous listening
        continuous: true,

        // Show interim results
        interimResults: true,

        // Max alternatives
        maxAlternatives: 1
    },

    // Audio Visualization Configuration
    visualization: {
        // Enable/disable audio visualization
        enabled: true,

        // FFT size for frequency analysis
        fftSize: 256,

        // Canvas dimensions
        canvas: {
            width: 300,
            height: 100
        },

        // Colors
        colors: {
            gradient: {
                start: '#f093fb',
                end: '#f5576c'
            },
            background: 'rgba(255, 255, 255, 0.1)'
        }
    },

    // UI Configuration
    ui: {
        // Auto-scroll chat to bottom
        autoScroll: true,

        // Animation duration (ms)
        animationDuration: 300,

        // Toast duration (ms)
        toastDuration: 3000,

        // Max messages to display
        maxMessages: 100
    },

    // Storage Configuration
    storage: {
        // LocalStorage key for settings
        settingsKey: 'vibecoding-settings',

        // LocalStorage key for conversation
        conversationKey: 'vibecoding-conversation',

        // Save conversation to localStorage
        saveConversation: false
    },

    // Demo Mode Configuration
    demo: {
        // Simulated response delay (ms)
        responseDelay: 1000,

        // Demo responses
        responses: [
            "I understand your request. How can I help you further?",
            "That's an interesting question. Let me process that for you.",
            "I've analyzed your input and here's what I found...",
            "Based on your request, I can provide the following information...",
            "I'm here to help. Could you provide more details?",
            "Let me think about that for a moment...",
            "Great question! Here's my analysis...",
            "I can help you with that. What specific information do you need?",
            "Thanks for that input. Here's my response...",
            "Interesting perspective. Let me elaborate on that..."
        ]
    }
};

// Helper function to get API URL
export function getApiUrl(endpoint) {
    if (config.api.demoMode) {
        return null;
    }
    return `${config.api.serverUrl}${config.api.endpoints[endpoint]}`;
}

// Helper function to check if demo mode is enabled
export function isDemoMode() {
    return config.api.demoMode;
}

// Helper function to update config at runtime
export function updateConfig(path, value) {
    const keys = path.split('.');
    let obj = config;

    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
}

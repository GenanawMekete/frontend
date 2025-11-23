class BingoApp {
    constructor() {
        this.isInitialized = false;
        this.config = {
            gameDuration: 30,
            lobbyDuration: 30,
            serverUrl: this.getServerUrl(),
            maxPlayers: 100
        };
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize Telegram integration
            const tgInitialized = TelegramApp.init();
            
            if (!tgInitialized) {
                console.log('Running in standalone mode (no Telegram)');
            }

            // Initialize game components
            GameManager.init();
            
            // Connect to game server
            await this.connectToServer();
            
            // Start lobby timer
            this.startLobbyTimer();
            
            this.isInitialized = true;
            console.log('Bingo App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Bingo App:', error);
            TelegramApp.showAlert('Failed to initialize game');
        }
    }

    getServerUrl() {
        // In production, this would be your actual WebSocket server URL
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return 'ws://localhost:3000';
        }
        return 'wss://your-bingo-server.com';
    }

    async connectToServer() {
        try {
            await SocketManager.connect(this.config.serverUrl);
            console.log('Connected to game server');
        } catch (error) {
            console.error('Failed to connect to game server:', error);
            
            // Show offline mode message
            TelegramApp.showAlert(
                'Connected in offline mode. Some features may be limited.'
            );
        }
    }

    startLobbyTimer() {
        GameTimerManager.startLobbyTimer(
            this.config.lobbyDuration,
            (seconds) => {
                GameTimerManager.updateLobbyDisplay(seconds);
                
                // Update join button text for last 10 seconds
                const joinBtn = document.getElementById('join-game-btn');
                if (joinBtn && seconds <= 10) {
                    joinBtn.textContent = `Joining... ${seconds}s`;
                }
            },
            () => {
                // Auto-join when timer reaches 0
                const joinBtn = document.getElementById('join-game-btn');
                if (joinBtn && !joinBtn.disabled) {
                    GameManager.joinGame();
                } else {
                    // Restart timer if couldn't join
                    this.startLobbyTimer();
                }
            }
        );
    }

    // Handle app visibility changes
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppBackground();
            } else {
                this.handleAppForeground();
            }
        });
    }

    handleAppBackground() {
        console.log('App moved to background');
        // Pause sounds, reduce timer precision, etc.
    }

    handleAppForeground() {
        console.log('App moved to foreground');
        // Resume normal operation
    }

    // Cleanup method
    destroy() {
        SocketManager.disconnect();
        GameTimerManager.stopLobbyTimer();
        GameTimerManager.stopGameTimer();
        this.isInitialized = false;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new BingoApp();
    await app.init();
    
    // Make app globally available for debugging
    window.BingoApp = app;
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });
});

// Service Worker registration (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

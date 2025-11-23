class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.initiated = false;
    }

    init() {
        if (!this.tg) {
            console.warn('Telegram Web App not available');
            return false;
        }

        try {
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            
            this.user = this.tg.initDataUnsafe?.user;
            this.initiated = true;
            
            this.applyTheme();
            this.setupBackButton();
            
            console.log('Telegram Web App initialized', this.user);
            return true;
        } catch (error) {
            console.error('Failed to initialize Telegram Web App:', error);
            return false;
        }
    }

    applyTheme() {
        if (!this.tg) return;

        document.documentStyle.setProperty('--tg-theme-bg-color', this.tg.themeParams.bg_color || '#ffffff');
        document.documentStyle.setProperty('--tg-theme-text-color', this.tg.themeParams.text_color || '#000000');
        document.documentStyle.setProperty('--tg-theme-button-color', this.tg.themeParams.button_color || '#0088cc');
        document.documentStyle.setProperty('--tg-theme-button-text-color', this.tg.themeParams.button_text_color || '#ffffff');
        document.documentStyle.setProperty('--tg-theme-secondary-bg-color', this.tg.themeParams.secondary_bg_color || '#f0f0f0');
    }

    setupBackButton() {
        if (!this.tg) return;

        this.tg.BackButton.onClick(() => {
            this.handleBackButton();
        });
    }

    showBackButton() {
        if (this.tg) {
            this.tg.BackButton.show();
        }
    }

    hideBackButton() {
        if (this.tg) {
            this.tg.BackButton.hide();
        }
    }

    handleBackButton() {
        // Handle back button based on current screen
        const currentScreen = document.querySelector('.screen.active').id;
        
        switch (currentScreen) {
            case 'game-screen':
                this.showExitGameConfirmation();
                break;
            case 'results-screen':
                this.navigateToLobby();
                break;
            default:
                this.navigateToLobby();
        }
    }

    showExitGameConfirmation() {
        if (confirm('Are you sure you want to leave the game? Your progress will be lost.')) {
            this.navigateToLobby();
        }
    }

    navigateToLobby() {
        GameManager.leaveGame();
        ScreenManager.showScreen('lobby-screen');
        this.hideBackButton();
    }

    getUser() {
        return this.user;
    }

    getUserData() {
        if (!this.user) return null;
        
        return {
            id: this.user.id,
            firstName: this.user.first_name,
            lastName: this.user.last_name,
            username: this.user.username,
            languageCode: this.user.language_code
        };
    }

    showAlert(message) {
        if (this.tg) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    showConfirm(message) {
        if (this.tg) {
            return new Promise((resolve) => {
                this.tg.showConfirm(message, (confirmed) => {
                    resolve(confirmed);
                });
            });
        } else {
            return Promise.resolve(confirm(message));
        }
    }

    closeApp() {
        if (this.tg) {
            this.tg.close();
        }
    }

    // Haptic feedback
    impactOccurred(style = 'light') {
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.impactOccurred(style);
        }
    }

    notificationOccurred(type = 'success') {
        if (this.tg?.HapticFeedback) {
            this.tg.HapticFeedback.notificationOccurred(type);
        }
    }
}

// Global instance
const TelegramApp = new TelegramIntegration();

const TelegramConfig = {
    appId: process.env.TELEGRAM_APP_ID || 'YOUR_APP_ID',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'your_bot_username',
    
    // Feature flags
    features: {
        useHapticFeedback: true,
        useClosingConfirmation: true,
        useThemeParams: true,
        useBackButton: true
    },
    
    // Theme configuration
    theme: {
        colors: {
            primary: '#0088cc',
            secondary: '#6c757d',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        }
    },
    
    // Game configuration
    game: {
        maxCardsPerPlayer: 1,
        autoJoin: false,
        showTutorial: true
    }
};

export default TelegramConfig;

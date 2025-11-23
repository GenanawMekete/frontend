const TelegramConfig = {
    appId: process.env.TELEGRAM_APP_ID || '36228998',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'abushbingoo_bot',
    
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

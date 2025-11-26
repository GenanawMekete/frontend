// frontend/config/telegram.js
const config = {
  // Replace with your actual Render backend URL
  backendUrl: https://final-bingo.onrender.com/,
  socketUrl: https://final-bingo.onrender.com/,
  
  // Telegram Mini App configuration
  telegramBotToken: 'your_bot_token', // Will be set via environment variables
  initData: '',
  
  // Game settings
  gameSettings: {
    maxCards: 4,
    autoMark: true,
    sounds: true,
    vibration: true
  },
  
  // URLs
  endpoints: {
    health: '/health',
    players: '/api/players',
    games: '/api/games',
    rooms: '/api/rooms'
  }
};

// Make it available globally
window.APP_CONFIG = config;
export default config;

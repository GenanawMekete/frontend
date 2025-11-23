console.log('🎯 Bingo Frontend loaded successfully!');

class BingoApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('Bingo Mini App initialized');
        this.checkBackendConnection();
    }

    async checkBackendConnection() {
        try {
            const backendUrl = 'https://your-bingo-backend.onrender.com';
            const response = await fetch(`${backendUrl}/health`);
            const data = await response.json();
            console.log('✅ Backend connection:', data);
        } catch (error) {
            console.log('❌ Backend not connected yet');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bingoApp = new BingoApp();
});

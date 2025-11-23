class GameManager {
    constructor() {
        this.currentGame = null;
        this.isInGame = false;
        this.playerCount = 0;
        this.calledNumbers = new Set();
        this.currentNumber = null;
    }

    init() {
        this.setupEventListeners();
        this.setupSocketHandlers();
    }

    setupEventListeners() {
        // Join game button
        const joinBtn = document.getElementById('join-game-btn');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.joinGame());
        }

        // Claim bingo button
        const claimBtn = document.getElementById('claim-bingo-btn');
        if (claimBtn) {
            claimBtn.addEventListener('click', () => this.claimBingo());
        }

        // Play again button
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.playAgain());
        }
    }

    setupSocketHandlers() {
        SocketManager.on('connected', () => {
            console.log('Socket connected to game server');
            this.updateConnectionStatus(true);
        });

        SocketManager.on('disconnected', () => {
            console.log('Socket disconnected from game server');
            this.updateConnectionStatus(false);
        });

        SocketManager.on('player_count_update', (data) => {
            this.updatePlayerCount(data.count);
        });

        SocketManager.on('game_joined', (data) => {
            this.handleGameJoined(data);
        });

        SocketManager.on('game_start', (data) => {
            this.handleGameStart(data);
        });

        SocketManager.on('number_called', (data) => {
            this.handleNumberCalled(data);
        });

        SocketManager.on('bingo_valid', (data) => {
            this.handleBingoValid(data);
        });

        SocketManager.on('bingo_invalid', (data) => {
            this.handleBingoInvalid(data);
        });

        SocketManager.on('game_end', (data) => {
            this.handleGameEnd(data);
        });

        SocketManager.on('error', (error) => {
            console.error('Game error:', error);
            TelegramApp.showAlert('Game error: ' + error.message);
        });
    }

    updateConnectionStatus(connected) {
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
        statusIndicator.textContent = connected ? 'Connected' : 'Disconnected';
        
        // Add to UI (you might want to create a proper place for this)
        const existingStatus = document.querySelector('.connection-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        document.body.appendChild(statusIndicator);
    }

    updatePlayerCount(count) {
        this.playerCount = count;
        
        const onlinePlayers = document.getElementById('online-players');
        const currentPlayers = document.getElementById('current-players');
        
        if (onlinePlayers) onlinePlayers.textContent = count;
        if (currentPlayers) currentPlayers.textContent = count;
    }

    async joinGame() {
        if (this.isInGame) return;

        try {
            // Generate bingo card
            const card = CardPool.generateCard();
            const userData = TelegramApp.getUserData();
            
            // If no Telegram user, create mock user
            const playerData = userData || {
                id: Utils.generateId(),
                firstName: 'Player',
                lastName: 'Anonymous',
                username: 'anonymous'
            };

            // Update UI
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar && playerData.firstName) {
                userAvatar.textContent = playerData.firstName.charAt(0).toUpperCase();
            }

            SocketManager.joinGame(playerData, card);
            
        } catch (error) {
            console.error('Error joining game:', error);
            TelegramApp.showAlert('Failed to join game');
        }
    }

    handleGameJoined(data) {
        this.isInGame = true;
        this.currentGame = data.gameId;
        
        ScreenManager.showScreen('game-screen');
        TelegramApp.showBackButton();
        
        // Start lobby timer for game start
        GameTimerManager.startLobbyTimer(
            5, // 5 seconds until game starts
            (seconds) => GameTimerManager.updateLobbyDisplay(seconds),
            () => console.log('Game starting...')
        );
    }

    handleGameStart(data) {
        GameTimerManager.stopLobbyTimer();
        
        this.calledNumbers.clear();
        this.currentNumber = null;
        
        // Reset card
        CardPool.resetCard();
        
        // Clear called numbers display
        const calledNumbersContainer = document.getElementById('called-numbers');
        if (calledNumbersContainer) {
            calledNumbersContainer.innerHTML = '';
        }
        
        // Start game timer
        GameTimerManager.startGameTimer(
            data.duration,
            (seconds) => GameTimerManager.updateGameDisplay(seconds),
            () => this.handleGameTimeUp()
        );
        
        // Update current number display
        this.updateCurrentNumber('--');
    }

    handleNumberCalled(data) {
        const { number, callCount, totalCalls } = data;
        
        this.currentNumber = number;
        this.calledNumbers.add(number);
        
        // Update UI
        this.updateCurrentNumber(number);
        this.addCalledNumber(number);
        
        // Mark number on card if present
        CardPool.markNumber(number);
        
        // Play sound and haptic feedback
        Utils.playSound('number-sound');
        TelegramApp.impactOccurred('medium');
    }

    handleGameTimeUp() {
        this.endGame('time_up', 'Time is up! No winner this round.');
    }

    claimBingo() {
        if (!this.isInGame) return;
        
        const cardData = CardPool.getCardData();
        const markedNumbers = cardData.marked;
        
        SocketManager.claimBingo(cardData, markedNumbers);
        
        // Disable claim button while validating
        const claimBtn = document.getElementById('claim-bingo-btn');
        if (claimBtn) {
            claimBtn.disabled = true;
            claimBtn.textContent = 'Validating...';
        }
        
        TelegramApp.impactOccurred('heavy');
    }

    handleBingoValid(data) {
        Utils.playSound('win-sound');
        TelegramApp.notificationOccurred('success');
        
        this.endGame('bingo', `BINGO! You won ${data.prize} coins!`, data);
    }

    handleBingoInvalid(data) {
        TelegramApp.showAlert(`Invalid Bingo: ${data.reason}`);
        
        // Re-enable claim button
        const claimBtn = document.getElementById('claim-bingo-btn');
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.textContent = 'Claim Bingo!';
        }
        
        TelegramApp.impactOccurred('error');
    }

    handleGameEnd(data) {
        this.endGame(data.reason, 'Game ended by server.');
    }

    endGame(reason, message, winData = null) {
        this.isInGame = false;
        GameTimerManager.stopGameTimer();
        
        ScreenManager.showScreen('results-screen');
        this.showGameResults(reason, message, winData);
    }

    showGameResults(reason, message, winData) {
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const winnerInfo = document.getElementById('winner-info');
        
        if (!resultIcon || !resultTitle || !resultMessage) return;
        
        switch (reason) {
            case 'bingo':
                resultIcon.innerHTML = '🎉';
                resultIcon.classList.add('celebrate');
                resultTitle.textContent = 'BINGO! You Win!';
                resultMessage.textContent = message;
                
                if (winData && winnerInfo) {
                    winnerInfo.innerHTML = `
                        <strong>${winData.winner.firstName}</strong> won with ${winData.winningPattern}!
                        <br>Prize: ${winData.prize} coins
                    `;
                }
                break;
                
            case 'time_up':
                resultIcon.innerHTML = '⏰';
                resultTitle.textContent = 'Time\'s Up!';
                resultMessage.textContent = message;
                break;
                
            default:
                resultIcon.innerHTML = '🎯';
                resultTitle.textContent = 'Game Over';
                resultMessage.textContent = message;
        }
    }

    playAgain() {
        this.leaveGame();
        ScreenManager.showScreen('lobby-screen');
        
        // Re-enable join button after a brief delay
        setTimeout(() => {
            const joinBtn = document.getElementById('join-game-btn');
            if (joinBtn) {
                joinBtn.disabled = false;
            }
        }, 1000);
    }

    leaveGame() {
        if (this.isInGame) {
            SocketManager.leaveGame();
            this.isInGame = false;
        }
        
        this.currentGame = null;
        GameTimerManager.stopLobbyTimer();
        GameTimerManager.stopGameTimer();
        TelegramApp.hideBackButton();
    }

    updateCurrentNumber(number) {
        const currentNumberElement = document.getElementById('current-number');
        if (currentNumberElement) {
            currentNumberElement.textContent = number;
            
            if (number !== '--') {
                currentNumberElement.classList.add('number-reveal');
                setTimeout(() => {
                    currentNumberElement.classList.remove('number-reveal');
                }, 1000);
            }
        }
    }

    addCalledNumber(number) {
        const container = document.getElementById('called-numbers');
        if (!container) return;
        
        const numberChip = document.createElement('div');
        numberChip.className = 'number-chip recent';
        numberChip.textContent = number;
        numberChip.title = `Number: ${number}`;
        
        container.appendChild(numberChip);
        
        // Remove recent class after animation
        setTimeout(() => {
            numberChip.classList.remove('recent');
        }, 1000);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    getGameStats() {
        return {
            isInGame: this.isInGame,
            playerCount: this.playerCount,
            calledNumbers: this.calledNumbers.size,
            currentNumber: this.currentNumber
        };
    }
}

// Screen Manager
class ScreenManager {
    static showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }
}

// Global instance
const GameManager = new GameManager();

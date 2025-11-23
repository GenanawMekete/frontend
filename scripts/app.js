class BingoMiniApp {
    constructor() {
        this.currentTab = 'quick-game';
        this.userData = null;
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
        this.hideLoading();
        
        console.log('Bingo Mini App initialized');
    }

    async loadUserData() {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            const user = tg.initDataUnsafe?.user || {
                id: Math.random().toString(36).substr(2, 9),
                first_name: 'Player'
            };

            this.userData = {
                id: user.id,
                name: user.first_name || 'Player',
                balance: 190,
                gamesPlayed: 1920,
                gamesWon: 14
            };
        } else {
            // Fallback for development
            this.userData = {
                id: 'dev_user',
                name: 'Developer',
                balance: 190,
                gamesPlayed: 1920,
                gamesWon: 14
            };
        }
        
        this.updateUserUI();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Bet selection
        document.querySelectorAll('.bet-option').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setBetAmount(parseInt(e.target.dataset.bet));
            });
        });

        // Game actions
        document.getElementById('joinNextGame').addEventListener('click', () => {
            this.joinNextGame();
        });

        document.getElementById('leaveGame').addEventListener('click', () => {
            this.leaveGame();
        });

        document.getElementById('callBingo').addEventListener('click', () => {
            this.callBingo();
        });

        // Modal actions
        document.querySelectorAll('[data-action="play-again"]').forEach(button => {
            button.addEventListener('click', () => {
                this.playAgain();
            });
        });

        document.querySelectorAll('[data-action="back-to-lobby"]').forEach(button => {
            button.addEventListener('click', () => {
                this.backToLobby();
            });
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.nav-tab').forEach(button => {
            button.classList.remove('active');
        });

        document.getElementById(`${tab}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    }

    setBetAmount(amount) {
        document.querySelectorAll('.bet-option').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-bet="${amount}"]`).classList.add('active');
        document.getElementById('currentBet').textContent = amount;
    }

    joinNextGame() {
        const selectedCards = window.cardPoolManager.getSelectedCards();
        if (selectedCards.length === 0) {
            this.showAlert('Please select at least one card');
            return;
        }

        this.showModal('activeGameModal');
        window.gameTimer.startGame(selectedCards);
    }

    leaveGame() {
        this.closeModal('activeGameModal');
    }

    callBingo() {
        this.showModal('bingoWinModal');
        
        // Update wallet with winnings
        const betAmount = parseInt(document.getElementById('currentBet').textContent);
        const cardCount = window.cardPoolManager.selectedCards.size;
        const winnings = betAmount * cardCount * 10;
        
        this.userData.balance += winnings;
        this.userData.gamesWon += 1;
        this.updateUserUI();
        
        document.getElementById('winAmount').textContent = winnings;
    }

    playAgain() {
        this.closeModal('bingoWinModal');
        this.closeModal('activeGameModal');
        this.joinNextGame();
    }

    backToLobby() {
        this.closeModal('bingoWinModal');
        this.closeModal('activeGameModal');
    }

    updateUserUI() {
        if (!this.userData) return;
        
        document.getElementById('walletAmount').textContent = this.userData.balance;
        document.getElementById('totalGames').textContent = this.userData.gamesPlayed;
        document.getElementById('gamesWon').textContent = this.userData.gamesWon;
        
        const winRate = this.userData.gamesPlayed > 0 
            ? ((this.userData.gamesWon / this.userData.gamesPlayed) * 100).toFixed(1)
            : 0;
        document.getElementById('winRate').textContent = winRate + '%';
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showAlert(message) {
        alert(message); // In production, use Telegram's showAlert
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.bingoApp = new BingoMiniApp();
});        poolContainer.innerHTML = '';

        this.availableCards.forEach(card => {
            const isSelected = this.selectedCards.has(card.id);
            const cardElement = this.createCardElement(card, isSelected);
            poolContainer.appendChild(cardElement);
        });
    }

    createCardElement(card, isSelected) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `bingo-card-selector ${isSelected ? 'selected' : ''}`;
        cardDiv.dataset.cardId = card.id;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header';
        headerDiv.innerHTML = `
            <span class="card-number">#${card.number}</span>
            <span class="card-price">FREE</span>
        `;

        const gridDiv = document.createElement('div');
        gridDiv.className = 'card-grid-mini';

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                cell.className = 'card-cell-mini';
                
                if (row === 2 && col === 2) {
                    cell.textContent = 'FREE';
                    cell.classList.add('free');
                } else {
                    cell.textContent = card.cells[col][row];
                }
                
                gridDiv.appendChild(cell);
            }
        }

        cardDiv.appendChild(headerDiv);
        cardDiv.appendChild(gridDiv);
        return cardDiv;
    }

    updateSelectionCount() {
        document.getElementById('selectedCount').textContent = this.selectedCards.size;
    }

    updateJoinButton() {
        const joinButton = document.getElementById('joinNextGame');
        joinButton.disabled = this.selectedCards.size === 0;
    }

    getSelectedCards() {
        return this.availableCards.filter(card => this.selectedCards.has(card.id));
    }
}

window.cardPoolManager = new CardPoolManager();

class CardPoolManager {
    constructor() {
        this.availableCards = [];
        this.selectedCards = new Set();
        this.maxCards = 6;
        this.currentBet = 10;
        this.init();
    }

    init() {
        this.generateCardPool();
        this.setupEventListeners();
        this.updateDisplay();
    }

    generateCardPool() {
        this.availableCards = Array.from({ length: 12 }, (_, index) => 
            this.generateBingoCard(index + 1)
        );
    }

    generateBingoCard(cardNumber) {
        const card = {
            id: `card_${cardNumber}`,
            number: cardNumber,
            price: 0,
            cells: []
        };

        for (let col = 0; col < 5; col++) {
            const columnNumbers = this.generateColumnNumbers(col);
            card.cells.push(columnNumbers);
        }

        return card;
    }

    generateColumnNumbers(columnIndex) {
        const numbers = new Set();
        const min = columnIndex * 15 + 1;
        const max = min + 14;

        while (numbers.size < 5) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(num);
        }

        return Array.from(numbers).sort((a, b) => a - b);
    }

    setupEventListeners() {
        // Card selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bingo-card-selector')) {
                const cardElement = e.target.closest('.bingo-card-selector');
                const cardId = cardElement.dataset.cardId;
                this.toggleCardSelection(cardId);
            }
        });

        document.getElementById('selectAllCards').addEventListener('click', () => {
            this.selectAllCards();
        });

        document.getElementById('clearSelection').addEventListener('click', () => {
            this.clearSelection();
        });
    }

    toggleCardSelection(cardId) {
        if (this.selectedCards.has(cardId)) {
            this.selectedCards.delete(cardId);
        } else {
            if (this.selectedCards.size < this.maxCards) {
                this.selectedCards.add(cardId);
            } else {
                alert(`Maximum ${this.maxCards} cards allowed per game`);
                return;
            }
        }

        this.updateDisplay();
        this.updateJoinButton();
    }

    selectAllCards() {
        const cardsToSelect = this.availableCards.slice(0, this.maxCards);
        this.selectedCards.clear();
        cardsToSelect.forEach(card => {
            this.selectedCards.add(card.id);
        });
        this.updateDisplay();
        this.updateJoinButton();
    }

    clearSelection() {
        this.selectedCards.clear();
        this.updateDisplay();
        this.updateJoinButton();
    }

    updateDisplay() {
        this.renderCardPool();
        this.updateSelectionCount();
    }

    renderCardPool() {
        const poolContainer = document.getElementById('cardPool');
        poolContainer.innerHTML = '';

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

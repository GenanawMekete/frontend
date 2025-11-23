class CardManager {
    constructor() {
        this.currentCard = null;
        this.cardSize = 5;
        this.numberRanges = {
            'B': { min: 1, max: 15 },
            'I': { min: 16, max: 30 },
            'N': { min: 31, max: 45 },
            'G': { min: 46, max: 60 },
            'O': { min: 61, max: 75 }
        };
    }

    generateCard() {
        const card = {
            id: Utils.generateId(),
            numbers: {},
            marked: new Set(),
            generatedAt: Date.now()
        };

        const letters = ['B', 'I', 'N', 'G', 'O'];
        
        letters.forEach(letter => {
            const range = this.numberRanges[letter];
            const numbers = this.generateColumnNumbers(range.min, range.max);
            card.numbers[letter] = numbers;
        });

        // Make center free
        card.numbers['N'][2] = 'FREE';
        card.marked.add('N3');

        this.currentCard = card;
        this.renderCard();
        return card;
    }

    generateColumnNumbers(min, max) {
        const numbers = [];
        const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        const shuffled = Utils.shuffleArray(available);
        
        for (let i = 0; i < this.cardSize; i++) {
            numbers.push(shuffled[i]);
        }
        
        return numbers;
    }

    renderCard() {
        const container = document.getElementById('bingo-numbers');
        if (!container) return;

        container.innerHTML = '';
        const letters = ['B', 'I', 'N', 'G', 'O'];

        for (let row = 0; row < this.cardSize; row++) {
            for (let col = 0; col < this.cardSize; col++) {
                const letter = letters[col];
                const number = this.currentCard.numbers[letter][row];
                const cellId = `${letter}${row + 1}`;
                
                const cell = document.createElement('div');
                cell.className = 'number-cell';
                cell.dataset.cellId = cellId;
                cell.dataset.number = number;
                cell.textContent = number;
                
                if (number === 'FREE') {
                    cell.classList.add('free');
                    cell.textContent = 'FREE';
                }
                
                if (this.currentCard.marked.has(cellId)) {
                    cell.classList.add('marked');
                }

                cell.addEventListener('click', () => this.toggleNumber(cellId));
                container.appendChild(cell);
            }
        }
    }

    toggleNumber(cellId) {
        if (!this.currentCard) return;
        
        const cell = document.querySelector(`[data-cell-id="${cellId}"]`);
        if (!cell || cell.classList.contains('free')) return;

        if (this.currentCard.marked.has(cellId)) {
            this.currentCard.marked.delete(cellId);
            cell.classList.remove('marked');
        } else {
            this.currentCard.marked.add(cellId);
            cell.classList.add('marked');
            Utils.playSound('click-sound');
            Utils.vibrate(50);
        }

        this.checkBingo();
    }

    markNumber(number) {
        if (!this.currentCard) return false;

        const letters = ['B', 'I', 'N', 'G', 'O'];
        let marked = false;

        for (let col = 0; col < this.cardSize; col++) {
            const letter = letters[col];
            const numbers = this.currentCard.numbers[letter];
            
            for (let row = 0; row < this.cardSize; row++) {
                if (numbers[row] === number) {
                    const cellId = `${letter}${row + 1}`;
                    if (!this.currentCard.marked.has(cellId)) {
                        this.currentCard.marked.add(cellId);
                        const cell = document.querySelector(`[data-cell-id="${cellId}"]`);
                        if (cell) {
                            cell.classList.add('marked');
                        }
                        marked = true;
                    }
                }
            }
        }

        if (marked) {
            this.checkBingo();
        }

        return marked;
    }

    checkBingo() {
        if (!this.currentCard) return false;

        const patterns = this.getWinningPatterns();
        
        for (const pattern of patterns) {
            if (this.checkPattern(pattern)) {
                this.handleBingo();
                return true;
            }
        }
        
        return false;
    }

    getWinningPatterns() {
        const patterns = [];
        const size = this.cardSize;

        // Rows
        for (let row = 0; row < size; row++) {
            const pattern = [];
            for (let col = 0; col < size; col++) {
                pattern.push(`${'BINGO'[col]}${row + 1}`);
            }
            patterns.push(pattern);
        }

        // Columns
        for (let col = 0; col < size; col++) {
            const pattern = [];
            for (let row = 0; row < size; row++) {
                pattern.push(`${'BINGO'[col]}${row + 1}`);
            }
            patterns.push(pattern);
        }

        // Diagonals
        const diag1 = [], diag2 = [];
        for (let i = 0; i < size; i++) {
            diag1.push(`${'BINGO'[i]}${i + 1}`);
            diag2.push(`${'BINGO'[i]}${size - i}`);
        }
        patterns.push(diag1, diag2);

        return patterns;
    }

    checkPattern(pattern) {
        return pattern.every(cellId => {
            if (cellId === 'N3') return true; // Free space
            return this.currentCard.marked.has(cellId);
        });
    }

    handleBingo() {
        const claimBtn = document.getElementById('claim-bingo-btn');
        if (claimBtn) {
            claimBtn.disabled = false;
            claimBtn.classList.add('pulse');
            Utils.playSound('bingo-sound');
            TelegramApp.notificationOccurred('success');
        }
    }

    resetCard() {
        if (this.currentCard) {
            this.currentCard.marked.clear();
            this.renderCard();
        }
        
        const claimBtn = document.getElementById('claim-bingo-btn');
        if (claimBtn) {
            claimBtn.disabled = true;
            claimBtn.classList.remove('pulse');
        }
    }

    getMarkedCount() {
        return this.currentCard ? this.currentCard.marked.size : 0;
    }

    getCardData() {
        return this.currentCard;
    }
}

// Global instance
const CardPool = new CardManager();

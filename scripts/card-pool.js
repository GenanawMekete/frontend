class GameTimer {
    constructor() {
        this.gameInterval = 30;
        this.currentTimer = this.gameInterval;
        this.timerInterval = null;
        this.isGameActive = false;
        this.init();
    }

    init() {
        this.startTimer();
    }

    startTimer() {
        this.currentTimer = this.gameInterval;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.currentTimer--;
            this.updateTimerDisplay();
            
            if (this.currentTimer <= 0) {
                this.currentTimer = this.gameInterval;
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('gameTimer');
        const joinTimerElement = document.getElementById('joinTimer');
        const modalTimer = document.getElementById('modalTimer');
        
        if (timerElement) {
            timerElement.textContent = this.formatTime(this.currentTimer);
        }
        
        if (joinTimerElement) {
            joinTimerElement.textContent = this.currentTimer;
        }
        
        if (modalTimer && this.isGameActive) {
            modalTimer.textContent = this.currentTimer;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    startGame(selectedCards) {
        this.isGameActive = true;
        window.cardPoolManager.renderActiveCards(selectedCards);
        this.startNumberCalling();
    }

    startNumberCalling() {
        let calledNumbers = [];
        const callInterval = setInterval(() => {
            if (!this.isGameActive) {
                clearInterval(callInterval);
                return;
            }
            
            const newNumber = this.callRandomNumber(calledNumbers);
            calledNumbers.push(newNumber);
            
            this.updateCurrentCall(newNumber, calledNumbers.length);
            
            if (document.getElementById('autoMark').checked) {
                window.cardPoolManager.markNumberOnActiveCards(newNumber.value);
            }
            
            if (calledNumbers.length >= 75) {
                clearInterval(callInterval);
                this.endGame('All numbers called!');
            }
        }, 2000);
    }

    callRandomNumber(calledNumbers) {
        let number;
        do {
            number = Math.floor(Math.random() * 75) + 1;
        } while (calledNumbers.some(n => n.value === number));
        
        const letters = ['B', 'I', 'N', 'G', 'O'];
        const letterIndex = Math.floor((number - 1) / 15);
        
        return {
            value: number,
            letter: letters[letterIndex],
            display: `${letters[letterIndex]}-${number}`
        };
    }

    updateCurrentCall(number, callCount) {
        document.getElementById('currentLetter').textContent = number.letter;
        document.getElementById('currentValue').textContent = number.value;
        document.getElementById('callNumber').textContent = callCount + 645;
        document.getElementById('calledCount').textContent = callCount;
        
        // Add to called numbers list
        const calledNumbersEl = document.getElementById('calledNumbersMini');
        if (calledNumbersEl) {
            const numberEl = document.createElement('div');
            numberEl.className = 'called-number-mini';
            numberEl.textContent = number.value;
            calledNumbersEl.appendChild(numberEl);
            calledNumbersEl.scrollTop = calledNumbersEl.scrollHeight;
        }
    }

    endGame(reason) {
        this.isGameActive = false;
        console.log('Game ended:', reason);
    }
}

window.gameTimer = new GameTimer();

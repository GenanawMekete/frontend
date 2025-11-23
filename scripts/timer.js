class Timer {
    constructor(duration, onTick, onComplete) {
        this.duration = duration;
        this.remaining = duration;
        this.onTick = onTick;
        this.onComplete = onComplete;
        this.isRunning = false;
        this.intervalId = null;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.remaining--;
            
            if (this.onTick) {
                this.onTick(this.remaining);
            }
            
            if (this.remaining <= 0) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.stop();
        this.remaining = this.duration;
    }

    getRemainingTime() {
        return this.remaining;
    }

    formatTime() {
        return Utils.formatTime(this.remaining);
    }

    setDuration(duration) {
        this.duration = duration;
        this.remaining = duration;
    }
}

class GameTimer {
    constructor() {
        this.lobbyTimer = null;
        this.gameTimer = null;
    }

    startLobbyTimer(duration, onTick, onComplete) {
        this.stopLobbyTimer();
        this.lobbyTimer = new Timer(duration, onTick, onComplete);
        this.lobbyTimer.start();
    }

    stopLobbyTimer() {
        if (this.lobbyTimer) {
            this.lobbyTimer.stop();
            this.lobbyTimer = null;
        }
    }

    startGameTimer(duration, onTick, onComplete) {
        this.stopGameTimer();
        this.gameTimer = new Timer(duration, onTick, onComplete);
        this.gameTimer.start();
    }

    stopGameTimer() {
        if (this.gameTimer) {
            this.gameTimer.stop();
            this.gameTimer = null;
        }
    }

    updateLobbyDisplay(seconds) {
        const timerElement = document.getElementById('lobby-timer');
        if (timerElement) {
            timerElement.textContent = `${seconds}s`;
            
            // Add visual feedback for last 10 seconds
            if (seconds <= 10) {
                timerElement.classList.add('pulse');
            } else {
                timerElement.classList.remove('pulse');
            }
        }
    }

    updateGameDisplay(seconds) {
        const timerElement = document.getElementById('game-timer');
        if (timerElement) {
            timerElement.textContent = `${seconds}s`;
            
            // Visual feedback based on time remaining
            timerElement.className = 'timer';
            if (seconds <= 10) {
                timerElement.classList.add('pulse');
            } else if (seconds <= 30) {
                timerElement.style.color = 'var(--warning-color)';
            }
        }
    }
}

// Global instance
const GameTimerManager = new GameTimer();

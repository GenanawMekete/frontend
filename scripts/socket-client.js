class SocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
    }

    connect(serverUrl) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(serverUrl);
                
                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.emit('connected');
                    resolve();
                };
                
                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };
                
                this.socket.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.emit('disconnected');
                    this.handleReconnection();
                };
                
                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }

    handleMessage(data) {
        const { type, payload } = data;
        console.log('Received message:', type, payload);
        this.emit(type, payload);
    }

    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                if (!this.isConnected) {
                    this.connect(this.socket.url);
                }
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
            this.emit('reconnection_failed');
        }
    }

    send(type, payload = {}) {
        if (this.isConnected && this.socket) {
            const message = JSON.stringify({ type, payload });
            this.socket.send(message);
        } else {
            console.warn('WebSocket not connected');
        }
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.eventHandlers.clear();
    }

    // Game specific methods
    joinGame(userData, cardData) {
        this.send('join_game', {
            user: userData,
            card: cardData
        });
    }

    leaveGame() {
        this.send('leave_game');
    }

    claimBingo(cardData, markedNumbers) {
        this.send('claim_bingo', {
            card: cardData,
            marked: Array.from(markedNumbers),
            timestamp: Date.now()
        });
    }

    readyForNextRound() {
        this.send('player_ready');
    }
}

// Mock Socket Client for development
class MockSocketClient extends SocketClient {
    constructor() {
        super();
        this.mockInterval = null;
        this.calledNumbers = new Set();
        this.players = [];
    }

    connect() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isConnected = true;
                this.emit('connected');
                
                // Simulate game state
                this.mockGameState();
                resolve();
            }, 1000);
        });
    }

    mockGameState() {
        // Simulate players
        this.players = [
            { id: '1', name: 'Player 1', score: 150 },
            { id: '2', name: 'Player 2', score: 100 },
            { id: '3', name: 'You', score: 200 }
        ];

        this.emit('player_count_update', { count: this.players.length });
        this.emit('game_state', { 
            status: 'waiting',
            timeLeft: 30,
            players: this.players.length
        });
    }

    joinGame(userData, cardData) {
        console.log('Mock: Joining game', userData);
        
        setTimeout(() => {
            this.emit('game_joined', {
                card: cardData,
                gameId: 'mock-game-' + Date.now()
            });
            
            this.emit('player_count_update', { count: Math.floor(Math.random() * 50) + 10 });
            
            // Start mock game after 5 seconds
            setTimeout(() => this.startMockGame(), 5000);
        }, 1000);
    }

    startMockGame() {
        this.emit('game_start', {
            duration: 30,
            numbersToCall: 25
        });

        this.calledNumbers.clear();
        this.startNumberCalling();
    }

    startNumberCalling() {
        let callCount = 0;
        const maxCalls = 25;
        
        this.mockInterval = setInterval(() => {
            if (callCount >= maxCalls) {
                clearInterval(this.mockInterval);
                this.emit('game_end', { reason: 'time_up' });
                return;
            }

            const number = this.generateUniqueNumber();
            this.calledNumbers.add(number);
            
            this.emit('number_called', {
                number,
                callCount: callCount + 1,
                totalCalls: maxCalls
            });

            callCount++;
        }, 1200); // Call number every 1.2 seconds
    }

    generateUniqueNumber() {
        let number;
        do {
            const letterIndex = Math.floor(Math.random() * 5);
            const letter = 'BINGO'[letterIndex];
            const min = letterIndex * 15 + 1;
            const max = min + 14;
            number = Utils.getRandomNumber(min, max);
        } while (this.calledNumbers.has(number));
        
        return number;
    }

    claimBingo(cardData, markedNumbers) {
        console.log('Mock: Claiming bingo', markedNumbers);
        
        // Simulate server validation
        setTimeout(() => {
            const isWinner = Math.random() > 0.5; // 50% chance to win
            
            if (isWinner) {
                this.emit('bingo_valid', {
                    winner: TelegramApp.getUserData(),
                    prize: 50,
                    winningPattern: 'row'
                });
            } else {
                this.emit('bingo_invalid', {
                    reason: 'Invalid pattern'
                });
            }
        }, 2000);
    }

    disconnect() {
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
        }
        this.isConnected = false;
    }
}

// Use mock socket in development, real socket in production
const SocketManager = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ? 
                     new MockSocketClient() : new SocketClient();

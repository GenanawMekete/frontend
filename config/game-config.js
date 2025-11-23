const GameConfig = {
    // Game timing
    timings: {
        lobbyDuration: 30, // seconds
        gameDuration: 30, // seconds
        numberCallInterval: 1.2, // seconds
        bingoValidationTime: 3, // seconds
        resultDisplayTime: 5 // seconds
    },
    
    // Game rules
    rules: {
        minPlayers: 2,
        maxPlayers: 100,
        numbersToCall: 25,
        winningPatterns: ['row', 'column', 'diagonal'],
        allowMultipleWins: false,
        autoMarkNumbers: false
    },
    
    // Scoring and rewards
    rewards: {
        basePrize: 50,
        speedBonus: 10,
        fullCardBonus: 100,
        referralBonus: 25
    },
    
    // Card configuration
    card: {
        size: 5,
        freeSpace: true,
        numberRanges: {
            'B': { min: 1, max: 15 },
            'I': { min: 16, max: 30 },
            'N': { min: 31, max: 45 },
            'G': { min: 46, max: 60 },
            'O': { min: 61, max: 75 }
        }
    },
    
    // Sound configuration
    sounds: {
        enabled: true,
        volume: 0.7,
        sounds: {
            bingo: 'assets/sounds/bingo.mp3',
            number: 'assets/sounds/number.mp3',
            win: 'assets/sounds/win.mp3',
            click: 'assets/sounds/click.mp3'
        }
    }
};

export default GameConfig;

class AuthService {
    constructor() {
        this.playerIdKey = 'playerId';
    }

    // Manage player authentication
    login(playerId) {
        localStorage.setItem(this.playerIdKey, playerId);
        console.log(`Player ${playerId} logged in.`);
    }

    logout() {
        localStorage.removeItem(this.playerIdKey);
        console.log(`Player logged out.`);
    }

    isLoggedIn() {
        return localStorage.getItem(this.playerIdKey) !== null;
    }

    // Load player by ID from the database
    async loadPlayerById(playerId) {
        try {
            const response = await fetch(`https://api.example.com/players/${playerId}`);
            if (!response.ok) {
                throw new Error('Player not found');
            }
            const player = await response.json();
            return player;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

// Example usage:
const authService = new AuthService();
authService.login('12345');
authService.loadPlayerById('12345');
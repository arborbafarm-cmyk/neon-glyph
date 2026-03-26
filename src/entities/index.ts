export interface Players {
    email: string;
    playerName: string;
    profilePicture: string;
    isGuest: boolean;
    level: number;
    xp: number;
    dirtyMoney: number;
    cleanMoney: number;
    spins: number;
    barracoLevel: number;
    barracoStyle: string;
    investments: any;
    skillTrees: any;
    inventory: any;
    ownedLuxuryItems: any;
    comercios: any;
    power: number;
    faction: string;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
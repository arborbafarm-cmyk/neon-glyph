// StreetLightingSystem.ts

class LightSource {
    constructor(public id: number, public position: { x: number, y: number }, public intensity: number) {}

    public adjustIntensity(newIntensity: number) {
        this.intensity = newIntensity;
    }
}

class StreetLightingSystem {
    private lightSources: LightSource[] = [];

    constructor() {}

    public addLightSource(lightSource: LightSource) {
        this.lightSources.push(lightSource);
    }

    public removeLightSource(lightSourceId: number) {
        this.lightSources = this.lightSources.filter(ls => ls.id !== lightSourceId);
    }

    public adjustLightSourceIntensity(lightSourceId: number, newIntensity: number) {
        const lightSource = this.lightSources.find(ls => ls.id === lightSourceId);
        if (lightSource) {
            lightSource.adjustIntensity(newIntensity);
        }
    }

    public getSystemStatus() {
        return this.lightSources.map(ls => ({ id: ls.id, position: ls.position, intensity: ls.intensity }));
    }
}

// Example usage:
const streetLightingSystem = new StreetLightingSystem();
streetLightingSystem.addLightSource(new LightSource(1, { x: 0, y: 0 }, 100));
streetLightingSystem.addLightSource(new LightSource(2, { x: 10, y: 10 }, 150));

console.log(streetLightingSystem.getSystemStatus());
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/core/Particles';
import { CelestialSystem } from './celestial-bodies';
import { CloudSystem } from './cloud-system';
import { DynamicLighting } from './dynamic-lighting';

export class DayNightCycle {
    constructor(scene, options = {}) {
        this.scene = scene;
        
        // Configuration options with defaults
        this.options = {
            dayStart: 5,           // Day starts at 5am
            dayEnd: 19,            // Day ends at 7pm (19:00)
            timeScale: 60,         // 1 real second = 1 minute in game
            initialHour: 12,       // Start at noon
            initialMinute: 0,
            ...options
        };
        
        // Time tracking
        this.hour = this.options.initialHour;
        this.minute = this.options.initialMinute;
        this.totalGameMinutes = this.hour * 60 + this.minute;
        this.lastUpdateTime = Date.now();
        
        // References to scene objects
        this.skybox = null;
        
        // Component systems
        this.celestialSystem = null;
        this.cloudSystem = null;
        this.dynamicLighting = null;
        
        // Time tracking for delta time calculation
        this.previousUpdateTime = Date.now();
        
        // UI elements
        this.clockDisplay = null;
        
        // Initialize
        this.createClockDisplay();
    }
    
    // Initialize with scene objects
    initialize(skybox) {
        console.log("Initializing day-night cycle with component systems");
        
        this.skybox = skybox;
        
        // Create component systems
        this.celestialSystem = new CelestialSystem(this.scene);
        this.cloudSystem = new CloudSystem(this.scene);
        this.dynamicLighting = new DynamicLighting(this.scene);
        
        // Initial update
        this.update();
        
        console.log("Day-night cycle initialized");
    }
    
    // Create clock display UI
    createClockDisplay() {
        // Create clock display container
        this.clockDisplay = document.createElement("div");
        this.clockDisplay.style.position = "absolute";
        this.clockDisplay.style.top = "10px";
        this.clockDisplay.style.right = "10px";
        this.clockDisplay.style.color = "white";
        this.clockDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.clockDisplay.style.padding = "10px";
        this.clockDisplay.style.fontFamily = "monospace";
        this.clockDisplay.style.fontSize = "16px";
        this.clockDisplay.style.borderRadius = "5px";
        this.clockDisplay.style.zIndex = "100";
        document.body.appendChild(this.clockDisplay);
        
        // Update clock display
        this.updateClockDisplay();
    }
    
    // Update clock display
    updateClockDisplay() {
        if (!this.clockDisplay) return;
        
        // Format time as HH:MM
        const hourStr = this.hour.toString().padStart(2, '0');
        const minuteStr = this.minute.toString().padStart(2, '0');
        
        // Determine if it's day or night
        const isDaytime = this.isDaytime();
        const timeOfDay = isDaytime ? "Day" : "Night";
        
        // Update display
        this.clockDisplay.innerHTML = `
            <div>${hourStr}:${minuteStr}</div>
            <div>${timeOfDay}</div>
        `;
        
        // Update display color based on time of day
        if (isDaytime) {
            this.clockDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        } else {
            this.clockDisplay.style.backgroundColor = "rgba(0, 0, 50, 0.7)";
        }
    }
    
    // Check if it's daytime
    isDaytime() {
        return this.hour >= this.options.dayStart && this.hour < this.options.dayEnd;
    }
    
    // Get time of day as a normalized value (0 to 1)
    // 0 = midnight, 0.25 = 6am, 0.5 = noon, 0.75 = 6pm
    getNormalizedTime() {
        const totalMinutesInDay = 24 * 60;
        return (this.totalGameMinutes % totalMinutesInDay) / totalMinutesInDay;
    }
    
    // Get sun position based on time of day
    getSunPosition() {
        const normalizedTime = this.getNormalizedTime();
        
        // Calculate sun angle (0 at midnight, π at noon)
        const sunAngle = normalizedTime * Math.PI * 2;
        
        // Calculate sun position
        const radius = 100; // Distance from center
        const x = radius * Math.sin(sunAngle);
        const y = radius * Math.cos(sunAngle);
        
        // During night, sun is below horizon (negative y)
        return new BABYLON.Vector3(x, y, 0);
    }
    
    // Add a mesh to cast shadows
    addShadowCaster(mesh) {
        if (this.dynamicLighting) {
            this.dynamicLighting.addShadowCaster(mesh);
        }
    }
    
    // Update skybox based on time of day
    updateSkybox() {
        if (!this.skybox) return;
        
        const normalizedTime = this.getNormalizedTime();
        const skyboxMaterial = this.skybox.material;
        
        // Define colors for different times of day
        const midnightColor = new BABYLON.Color3(0.025, 0.025, 0.1);  // Very dark blue (50% darker)
        const dawnColor = new BABYLON.Color3(0.8, 0.6, 0.5);          // Orange-pink
        const dayColor = new BABYLON.Color3(0.4, 0.6, 0.9);           // Sky blue
        const duskColor = new BABYLON.Color3(0.8, 0.5, 0.4);          // Orange-red
        const nightColor = new BABYLON.Color3(0.05, 0.05, 0.15);      // Dark blue (50% darker)
        
        let skyColor;
        
        // Time ranges (normalized)
        const midnight = 0;
        const dawn = 5/24;     // 5am
        const morning = 7/24;  // 7am
        const evening = 17/24; // 5pm
        const dusk = 19/24;    // 7pm
        const night = 21/24;   // 9pm
        
        // Determine sky color based on time
        if (normalizedTime >= midnight && normalizedTime < dawn) {
            // Midnight to dawn: midnight blue to dark blue
            const t = (normalizedTime - midnight) / (dawn - midnight);
            skyColor = BABYLON.Color3.Lerp(midnightColor, nightColor, t);
        } else if (normalizedTime >= dawn && normalizedTime < morning) {
            // Dawn to morning: dark blue to dawn to day
            const t = (normalizedTime - dawn) / (morning - dawn);
            skyColor = BABYLON.Color3.Lerp(dawnColor, dayColor, t);
        } else if (normalizedTime >= morning && normalizedTime < evening) {
            // Morning to evening: day
            skyColor = dayColor;
        } else if (normalizedTime >= evening && normalizedTime < dusk) {
            // Evening to dusk: day to dusk
            const t = (normalizedTime - evening) / (dusk - evening);
            skyColor = BABYLON.Color3.Lerp(dayColor, duskColor, t);
        } else if (normalizedTime >= dusk && normalizedTime < night) {
            // Dusk to night: dusk to night
            const t = (normalizedTime - dusk) / (night - dusk);
            skyColor = BABYLON.Color3.Lerp(duskColor, nightColor, t);
        } else {
            // Night to midnight: night to midnight blue
            const t = (normalizedTime - night) / (1 - night);
            skyColor = BABYLON.Color3.Lerp(nightColor, midnightColor, t);
        }
        
        // Apply color to skybox
        skyboxMaterial.diffuseColor = skyColor;
    }
    
    // Get the dynamic lighting system
    getDynamicLighting() {
        return this.dynamicLighting;
    }
    
    // Update time based on elapsed real time
    updateTime() {
        const now = Date.now();
        const elapsed = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // Calculate minutes to advance
        const minutesToAdd = (elapsed / 1000) * this.options.timeScale;
        this.totalGameMinutes += minutesToAdd;
        
        // Update hour and minute
        this.hour = Math.floor(this.totalGameMinutes / 60) % 24;
        this.minute = Math.floor(this.totalGameMinutes % 60);
    }
    
    // Main update function - called each frame
    update() {
        // Calculate delta time
        const now = Date.now();
        const deltaTime = (now - this.previousUpdateTime) / 1000; // Convert to seconds
        this.previousUpdateTime = now;
        
        // Update time
        this.updateTime();
        
        // Get normalized time
        const normalizedTime = this.getNormalizedTime();
        
        // Update skybox
        this.updateSkybox();
        
        // Update celestial bodies
        let celestialInfo = null;
        if (this.celestialSystem) {
            celestialInfo = this.celestialSystem.update(normalizedTime);
        }
        
        // Update dynamic lighting
        if (this.dynamicLighting && celestialInfo) {
            this.dynamicLighting.update(normalizedTime, celestialInfo);
        }
        
        // Update clouds
        if (this.cloudSystem) {
            this.cloudSystem.update(normalizedTime, deltaTime);
        }
        
        // Update clock display
        this.updateClockDisplay();
    }
    
    // Set time directly
    setTime(hour, minute = 0) {
        this.hour = hour % 24;
        this.minute = minute % 60;
        this.totalGameMinutes = this.hour * 60 + this.minute;
        this.update();
    }
    
    // Set time scale (how fast time passes)
    setTimeScale(scale) {
        this.options.timeScale = scale;
    }
}

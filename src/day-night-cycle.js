import * as BABYLON from '@babylonjs/core';

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
        this.sunLight = null;
        this.hemiLight = null;
        this.moonLight = null;
        
        // UI elements
        this.clockDisplay = null;
        
        // Initialize
        this.createClockDisplay();
    }
    
    // Initialize with scene objects
    initialize(skybox, sunLight, hemiLight) {
        this.skybox = skybox;
        this.sunLight = sunLight;
        this.hemiLight = hemiLight;
        
        // Create moon light (initially off)
        this.moonLight = new BABYLON.DirectionalLight(
            "moonLight",
            new BABYLON.Vector3(0, -1, 0),
            this.scene
        );
        this.moonLight.intensity = 0;
        this.moonLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.8); // Bluish moonlight
        this.moonLight.specular = new BABYLON.Color3(0.5, 0.5, 0.8);
        
        // Initial update
        this.update();
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
    
    // Update skybox based on time of day
    updateSkybox() {
        if (!this.skybox) return;
        
        const normalizedTime = this.getNormalizedTime();
        const skyboxMaterial = this.skybox.material;
        
        // Define colors for different times of day
        const midnightColor = new BABYLON.Color3(0.05, 0.05, 0.2);  // Dark blue
        const dawnColor = new BABYLON.Color3(0.8, 0.6, 0.5);        // Orange-pink
        const dayColor = new BABYLON.Color3(0.4, 0.6, 0.9);         // Sky blue
        const duskColor = new BABYLON.Color3(0.8, 0.5, 0.4);        // Orange-red
        const nightColor = new BABYLON.Color3(0.1, 0.1, 0.3);       // Dark blue
        
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
    
    // Update lighting based on time of day
    updateLighting() {
        if (!this.sunLight || !this.hemiLight || !this.moonLight) return;
        
        const normalizedTime = this.getNormalizedTime();
        const isDaytime = this.isDaytime();
        
        // Update sun position
        const sunPosition = this.getSunPosition();
        this.sunLight.direction = sunPosition.normalize().negate();
        
        // Update moon position (opposite of sun)
        this.moonLight.direction = sunPosition.normalize();
        
        // Calculate sun intensity based on height above horizon
        const sunHeight = sunPosition.y;
        const sunAboveHorizon = sunHeight > 0;
        
        // Sun intensity peaks at noon, fades at dawn/dusk
        let sunIntensity = 0;
        if (sunAboveHorizon) {
            // Normalize height to 0-1 range and apply curve for more realistic intensity
            const normalizedHeight = Math.min(sunHeight / 100, 1);
            sunIntensity = Math.pow(normalizedHeight, 0.5) * 0.8; // Max intensity 0.8
        }
        
        // Moon intensity peaks at midnight, fades at dawn/dusk
        let moonIntensity = 0;
        if (!sunAboveHorizon) {
            // Normalize height to 0-1 range and apply curve for more realistic intensity
            const normalizedHeight = Math.min(-sunHeight / 100, 1);
            moonIntensity = Math.pow(normalizedHeight, 0.5) * 0.3; // Max intensity 0.3
        }
        
        // Update light intensities
        this.sunLight.intensity = sunIntensity;
        this.moonLight.intensity = moonIntensity;
        
        // Hemispheric light intensity (always some ambient light)
        this.hemiLight.intensity = isDaytime ? 0.6 : 0.3;
        
        // Update light colors
        if (isDaytime) {
            // During day, sun color shifts from warm at dawn/dusk to neutral at noon
            const dayProgress = (this.hour - this.options.dayStart) / (this.options.dayEnd - this.options.dayStart);
            const isNoon = dayProgress > 0.3 && dayProgress < 0.7;
            
            if (isNoon) {
                // Noon - neutral white light
                this.sunLight.diffuse = new BABYLON.Color3(1, 1, 1);
                this.sunLight.specular = new BABYLON.Color3(1, 1, 1);
            } else if (dayProgress <= 0.3) {
                // Morning - warm light
                this.sunLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
                this.sunLight.specular = new BABYLON.Color3(1, 0.9, 0.7);
            } else {
                // Evening - warm light
                this.sunLight.diffuse = new BABYLON.Color3(1, 0.8, 0.6);
                this.sunLight.specular = new BABYLON.Color3(1, 0.8, 0.6);
            }
            
            // Hemispheric light - sky blue to ground
            this.hemiLight.diffuse = new BABYLON.Color3(0.9, 0.9, 1.0);
            this.hemiLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        } else {
            // Night - cooler light
            this.hemiLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.8);
            this.hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        }
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
        // Update time
        this.updateTime();
        
        // Update visuals
        this.updateSkybox();
        this.updateLighting();
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

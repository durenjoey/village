import * as BABYLON from '@babylonjs/core';

export class CelestialSystem {
    constructor(scene) {
        this.scene = scene;
        
        // References to celestial bodies
        this.sun = null;
        this.moon = null;
        this.sunLight = null;
        this.moonLight = null;
        
        // Stars
        this.stars = [];
        this.starsCreated = false;
        
        // Configuration
        this.skyRadius = 400; // Radius of the celestial orbit
        this.skyHeightOffset = 200; // Height above ground for orbit center
        this.orbitTilt = Math.PI / 6; // Tilt the orbit by 30 degrees
        
        // Initialize
        this.createCelestialBodies();
        this.createStars();
    }
    
    // Create stars for night sky
    createStars() {
        if (this.starsCreated) return;
        
        console.log("Creating stars for night sky");
        
        // Number of stars
        const numStars = 500;
        
        // Create stars
        for (let i = 0; i < numStars; i++) {
            // Create a small sphere for each star
            const star = BABYLON.MeshBuilder.CreateSphere(
                `star_${i}`,
                { diameter: 0.5 + Math.random() * 0.5 }, // Random size
                this.scene
            );
            
            // Position star randomly on the skybox
            const phi = Math.random() * Math.PI * 2; // Random angle around y-axis
            const theta = Math.random() * Math.PI; // Random angle from top to bottom
            const radius = 490; // Just inside the skybox (size 1000)
            
            // Convert spherical to cartesian coordinates
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            
            star.position = new BABYLON.Vector3(x, y, z);
            
            // Create emissive material for the star with increased brightness
            const starMaterial = new BABYLON.StandardMaterial(`starMaterial_${i}`, this.scene);
            starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
            
            // Add some color variation with enhanced brightness
            if (Math.random() > 0.8) {
                // Some stars are slightly blue or red
                const blueOrRed = Math.random() > 0.5;
                if (blueOrRed) {
                    starMaterial.emissiveColor = new BABYLON.Color3(0.9, 0.9, 1.2); // Enhanced blue
                } else {
                    starMaterial.emissiveColor = new BABYLON.Color3(1.2, 0.9, 0.9); // Enhanced red
                }
            }
            
            // Disable lighting effects on stars
            starMaterial.disableLighting = true;
            
            // Apply material
            star.material = starMaterial;
            
            // Add to stars array
            this.stars.push(star);
            
            // Initially hide stars
            star.visibility = 0;
        }
        
        // Add some larger, brighter stars
        for (let i = 0; i < 20; i++) {
            // Create a slightly larger sphere for bright stars
            const brightStar = BABYLON.MeshBuilder.CreateSphere(
                `brightStar_${i}`,
                { diameter: 1.0 + Math.random() * 0.5 },
                this.scene
            );
            
            // Position randomly
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = 490;
            
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            
            brightStar.position = new BABYLON.Vector3(x, y, z);
            
            // Create emissive material with enhanced glow
            const brightStarMaterial = new BABYLON.StandardMaterial(`brightStarMaterial_${i}`, this.scene);
            brightStarMaterial.emissiveColor = new BABYLON.Color3(1.2, 1.2, 1.2); // Brighter emissive
            brightStarMaterial.disableLighting = true;
            
            // Apply material
            brightStar.material = brightStarMaterial;
            
            // Add to stars array
            this.stars.push(brightStar);
            
            // Initially hide stars
            brightStar.visibility = 0;
        }
        
        this.starsCreated = true;
        console.log(`Created ${this.stars.length} stars`);
    }
    
    createCelestialBodies() {
        // Create sun
        this.sun = BABYLON.MeshBuilder.CreateSphere(
            "sun",
            { diameter: 10, segments: 16 },
            this.scene
        );
        
        // Create sun material with emissive properties
        const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", this.scene);
        sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.9, 0.6); // Warm yellow-white
        sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.9, 0.6);
        sunMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // No specular
        
        // Apply material
        this.sun.material = sunMaterial;
        
        // Create sun glow with enhanced effect
        const sunGlow = new BABYLON.HighlightLayer("sunGlow", this.scene);
        sunGlow.addMesh(this.sun, new BABYLON.Color3(1, 0.9, 0.3));
        sunGlow.blurHorizontalSize = 0.4; // Increased blur for more dramatic glow
        sunGlow.blurVerticalSize = 0.4;
        
        // Create moon
        this.moon = BABYLON.MeshBuilder.CreateSphere(
            "moon",
            { diameter: 7, segments: 16 },
            this.scene
        );
        
        // Create moon material
        const moonMaterial = new BABYLON.StandardMaterial("moonMaterial", this.scene);
        moonMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.9); // Slight blue tint
        moonMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
        moonMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // No specular
        
        // Apply material
        this.moon.material = moonMaterial;
        
        // Create moon glow with enhanced effect
        const moonGlow = new BABYLON.HighlightLayer("moonGlow", this.scene);
        moonGlow.addMesh(this.moon, new BABYLON.Color3(0.7, 0.7, 1.2)); // Brighter blue glow
        moonGlow.blurHorizontalSize = 0.5; // Increased blur for more dramatic glow
        moonGlow.blurVerticalSize = 0.5;
        
        // Initially position celestial bodies high in the sky
        this.sun.position = new BABYLON.Vector3(0, this.skyHeightOffset + this.skyRadius, 0);
        this.moon.position = new BABYLON.Vector3(0, this.skyHeightOffset - this.skyRadius, 0);
        
        console.log("Celestial bodies created");
    }
    
    // Update celestial bodies based on time of day
    update(normalizedTime) {
        if (!this.sun || !this.moon) return;
        
        // Calculate sun angle (0 at midnight, π at noon)
        const sunAngle = normalizedTime * Math.PI * 2;
        
        // Calculate base orbit position
        const orbitZ = this.skyRadius * Math.sin(sunAngle);
        const orbitY = this.skyRadius * Math.cos(sunAngle);
        
        // Apply tilt to create a proper arc across the sky
        // This creates an elliptical path tilted in the Y-Z plane
        const sunX = -(orbitZ * Math.sin(this.orbitTilt));
        const sunY = (orbitY * Math.cos(this.orbitTilt)) + this.skyHeightOffset;
        const sunZ = (orbitZ * Math.cos(this.orbitTilt));
        
        // Update sun position
        this.sun.position = new BABYLON.Vector3(sunX, sunY, sunZ);
        
        // Moon is opposite to the sun but follows the same arc pattern
        // We need to calculate the moon's position based on the opposite angle (sunAngle + π)
        const moonAngle = (normalizedTime + 0.5) % 1 * Math.PI * 2; // Opposite side of the day/night cycle
        
        // Calculate moon orbit position
        const moonOrbitZ = this.skyRadius * Math.sin(moonAngle);
        const moonOrbitY = this.skyRadius * Math.cos(moonAngle);
        
        // Apply the same tilt transformation as the sun
        const moonX = -(moonOrbitZ * Math.sin(this.orbitTilt));
        const moonY = (moonOrbitY * Math.cos(this.orbitTilt)) + this.skyHeightOffset;
        const moonZ = (moonOrbitZ * Math.cos(this.orbitTilt));
        
        // Update moon position
        this.moon.position = new BABYLON.Vector3(moonX, moonY, moonZ);
        
        // Update visibility based on height above horizon
        // Sun is visible when in the upper half of its orbit
        const sunVisibility = Math.max(0, Math.min(1, Math.sin(sunAngle) * 5));
        this.sun.visibility = sunVisibility;
        
        // Moon is visible when in the upper half of its orbit
        const moonVisibility = Math.max(0, Math.min(1, Math.sin(moonAngle) * 5));
        this.moon.visibility = moonVisibility;
        
        // Update stars visibility - stars are visible at night
        this.updateStars(normalizedTime);
        
        // Return sun position for other systems to use
        return {
            sunPosition: this.sun.position,
            moonPosition: this.moon.position,
            sunAboveHorizon: sunY > 0,
            moonAboveHorizon: -sunY > 0
        };
    }
    
    // Update stars visibility based on time of day
    updateStars(normalizedTime) {
        if (!this.starsCreated || this.stars.length === 0) return;
        
        // Time ranges (normalized)
        const dawn = 5/24;     // 5am
        const morning = 7/24;  // 7am
        const evening = 17/24; // 5pm
        const dusk = 19/24;    // 7pm
        const night = 21/24;   // 9pm
        
        let starVisibility = 0;
        
        // Calculate star visibility based on time
        if (normalizedTime >= dusk && normalizedTime < night) {
            // Dusk to night: gradually show stars
            const t = (normalizedTime - dusk) / (night - dusk);
            starVisibility = t;
        } else if (normalizedTime >= night || normalizedTime < dawn) {
            // Night to dawn: stars fully visible
            starVisibility = 1;
        } else if (normalizedTime >= dawn && normalizedTime < morning) {
            // Dawn to morning: gradually hide stars
            const t = (normalizedTime - dawn) / (morning - dawn);
            starVisibility = 1 - t;
        }
        
        // Update visibility of all stars
        for (const star of this.stars) {
            star.visibility = starVisibility;
            
            // Enhanced twinkling effect for stars
            if (starVisibility > 0 && Math.random() < 0.02) { // Increased chance of twinkling
                const twinkle = 0.6 + Math.random() * 0.6; // More dramatic twinkle range
                star.visibility = starVisibility * twinkle;
            }
        }
    }
    
    // Get the current sun direction (for lighting)
    getSunDirection() {
        if (!this.sun) return new BABYLON.Vector3(0, -1, 0);
        
        // Calculate direction from origin to sun
        const direction = this.sun.position.normalize();
        return direction;
    }
    
    // Get the current moon direction (for lighting)
    getMoonDirection() {
        if (!this.moon) return new BABYLON.Vector3(0, 1, 0);
        
        // Calculate direction from origin to moon
        const direction = this.moon.position.normalize();
        return direction;
    }
}

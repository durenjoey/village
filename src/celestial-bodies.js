import * as BABYLON from '@babylonjs/core';

export class CelestialSystem {
    constructor(scene) {
        this.scene = scene;
        
        // References to celestial bodies
        this.sun = null;
        this.moon = null;
        this.sunLight = null;
        this.moonLight = null;
        
        // Configuration
        this.skyRadius = 400; // Radius of the celestial orbit
        this.skyHeightOffset = 200; // Height above ground for orbit center
        this.orbitTilt = Math.PI / 6; // Tilt the orbit by 30 degrees
        
        // Initialize
        this.createCelestialBodies();
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
        
        // Create sun glow
        const sunGlow = new BABYLON.HighlightLayer("sunGlow", this.scene);
        sunGlow.addMesh(this.sun, new BABYLON.Color3(1, 0.9, 0.3));
        
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
        
        // Create moon glow
        const moonGlow = new BABYLON.HighlightLayer("moonGlow", this.scene);
        moonGlow.addMesh(this.moon, new BABYLON.Color3(0.6, 0.6, 1.0));
        
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
        
        // Moon is opposite to the sun (with same height offset)
        this.moon.position = new BABYLON.Vector3(-sunX, -orbitY + (2 * this.skyHeightOffset), -sunZ);
        
        // Update visibility based on angle rather than height
        // Sun is visible when in the upper half of its orbit
        const sunVisibility = Math.max(0, Math.min(1, Math.sin(sunAngle) * 5));
        this.sun.visibility = sunVisibility;
        
        // Moon is visible when in the upper half of its orbit (opposite of sun)
        const moonVisibility = Math.max(0, Math.min(1, -Math.sin(sunAngle) * 5));
        this.moon.visibility = moonVisibility;
        
        // Return sun position for other systems to use
        return {
            sunPosition: this.sun.position,
            moonPosition: this.moon.position,
            sunAboveHorizon: sunY > 0,
            moonAboveHorizon: -sunY > 0
        };
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

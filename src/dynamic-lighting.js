import * as BABYLON from '@babylonjs/core';

export class DynamicLighting {
    constructor(scene) {
        this.scene = scene;
        
        // Lighting references
        this.sunLight = null;
        this.moonLight = null;
        this.hemiLight = null;
        this.shadowGenerator = null;
        
        // Shadow casters
        this.shadowCasters = [];
        
        // Initialize
        this.createLighting();
    }
    
    createLighting() {
        console.log("Creating dynamic lighting system");
        
        // Create hemispheric light for ambient illumination
        this.hemiLight = new BABYLON.HemisphericLight(
            "hemiLight", 
            new BABYLON.Vector3(0, 1, 0), 
            this.scene
        );
        this.hemiLight.intensity = 0.6;
        this.hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Darker ground reflection
        
        // Create directional light for sun
        this.sunLight = new BABYLON.DirectionalLight(
            "sunLight",
            new BABYLON.Vector3(0.5, -0.5, 0.5),
            this.scene
        );
        this.sunLight.intensity = 0.8;
        this.sunLight.position = new BABYLON.Vector3(-30, 20, -10);
        
        // Create directional light for moon (initially off)
        this.moonLight = new BABYLON.DirectionalLight(
            "moonLight",
            new BABYLON.Vector3(-0.5, -0.5, -0.5),
            this.scene
        );
        this.moonLight.intensity = 0;
        this.moonLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.8); // Bluish moonlight
        this.moonLight.specular = new BABYLON.Color3(0.5, 0.5, 0.8);
        
        // Create shadow generator for sun
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.sunLight);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 2;
        this.shadowGenerator.setDarkness(0.3);
        
        console.log("Dynamic lighting system created");
    }
    
    // Add a mesh to cast shadows
    addShadowCaster(mesh) {
        if (!this.shadowGenerator) return;
        
        if (mesh.getChildMeshes && typeof mesh.getChildMeshes === 'function') {
            // Add all child meshes as shadow casters
            const childMeshes = mesh.getChildMeshes();
            childMeshes.forEach(childMesh => {
                this.shadowGenerator.addShadowCaster(childMesh);
                this.shadowCasters.push(childMesh);
            });
        } else {
            // Add single mesh as shadow caster
            this.shadowGenerator.addShadowCaster(mesh);
            this.shadowCasters.push(mesh);
        }
    }
    
    // Update lighting based on celestial body positions
    update(normalizedTime, celestialInfo) {
        if (!this.sunLight || !this.moonLight || !this.hemiLight) return;
        
        const { sunPosition, moonPosition, sunAboveHorizon, moonAboveHorizon } = celestialInfo;
        
        // Update sun light direction based on sun position
        if (sunPosition) {
            // Calculate direction from scene center to sun
            // We negate this to get the direction of light rays coming from the sun
            const sunDirection = new BABYLON.Vector3(
                sunPosition.x,
                sunPosition.y - 200, // Adjust for height offset to aim at scene center
                sunPosition.z
            ).normalize().negate();
            
            this.sunLight.direction = sunDirection;
            
            // Update sun light position for better shadow casting
            const lightDistance = 200; // Distance from center for light source
            this.sunLight.position = new BABYLON.Vector3(
                -sunDirection.x * lightDistance,
                -sunDirection.y * lightDistance,
                -sunDirection.z * lightDistance
            );
        }
        
        // Update moon light direction based on moon position
        if (moonPosition) {
            // Calculate direction from scene center to moon
            const moonDirection = new BABYLON.Vector3(
                moonPosition.x,
                moonPosition.y - 200, // Adjust for height offset to aim at scene center
                moonPosition.z
            ).normalize().negate();
            
            this.moonLight.direction = moonDirection;
        }
        
        // Calculate sun intensity based on height above horizon
        let sunIntensity = 0;
        if (sunAboveHorizon) {
            // Normalize height to 0-1 range and apply curve for more realistic intensity
            const normalizedHeight = Math.min(Math.abs(sunPosition.y) / 100, 1);
            sunIntensity = Math.pow(normalizedHeight, 0.5) * 0.8; // Max intensity 0.8
        }
        
        // Calculate moon intensity based on height above horizon
        let moonIntensity = 0;
        if (moonAboveHorizon) {
            // Normalize height to 0-1 range and apply curve for more realistic intensity
            const normalizedHeight = Math.min(Math.abs(moonPosition.y) / 100, 1);
            moonIntensity = Math.pow(normalizedHeight, 0.5) * 0.3; // Max intensity 0.3
        }
        
        // Update light intensities
        this.sunLight.intensity = sunIntensity;
        this.moonLight.intensity = moonIntensity;
        
        // Hemispheric light intensity (always some ambient light)
        this.hemiLight.intensity = sunAboveHorizon ? 0.6 : 0.3;
        
        // Update light colors
        if (sunAboveHorizon) {
            // During day, sun color shifts from warm at dawn/dusk to neutral at noon
            const dayProgress = (normalizedTime * 24 - 5) / 14; // 5am to 7pm mapped to 0-1
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
        
        // Update shadow darkness based on time of day
        if (this.shadowGenerator) {
            // Shadows are darker at noon, lighter at dawn/dusk
            if (sunAboveHorizon) {
                const noonness = Math.sin(normalizedTime * Math.PI * 2);
                const shadowDarkness = 0.2 + Math.max(0, noonness) * 0.3;
                this.shadowGenerator.setDarkness(shadowDarkness);
            } else {
                // No shadows at night
                this.shadowGenerator.setDarkness(0.1);
            }
        }
    }
    
    // Get the sun light for external use
    getSunLight() {
        return this.sunLight;
    }
    
    // Get the moon light for external use
    getMoonLight() {
        return this.moonLight;
    }
    
    // Get the hemispheric light for external use
    getHemiLight() {
        return this.hemiLight;
    }
    
    // Get the shadow generator for external use
    getShadowGenerator() {
        return this.shadowGenerator;
    }
}

import * as BABYLON from '@babylonjs/core';
import { ref, set, get } from 'firebase/database';
import { database } from './firebase-config';

export class WaterSystem {
    constructor(scene) {
        this.scene = scene;
        this.paths = []; // For river path points
        this.width = 5; // Default river width
        this.loadingStatus = "Initializing water system";
    }
    
    setLoadingStatus(status) {
        this.loadingStatus = status;
        console.log(`Water: ${status}`);
    }
    
    async createRiver() {
        this.setLoadingStatus("Starting river creation");
        
        try {
            // Try to load water data from Firebase with timeout
            this.setLoadingStatus("Attempting to load water data from Firebase");
            
            const loadPromise = this.loadWaterData();
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    this.setLoadingStatus("Water data loading timeout, generating new river");
                    resolve(null);
                }, 5000);
            });
            
            const waterData = await Promise.race([loadPromise, timeoutPromise]);
            
            if (waterData && waterData.paths) {
                this.setLoadingStatus("Loading saved water data");
                this.paths = waterData.paths.map(p => new BABYLON.Vector3(p.x, p.y, p.z));
                this.width = waterData.width || this.width;
            } else {
                this.setLoadingStatus("Generating new river path");
                this.generateRiverPath();
                
                // Save the generated water data to Firebase
                this.saveWaterData().catch(error => {
                    console.error("Error saving water data:", error);
                });
            }
        } catch (error) {
            console.error("Error in water creation process:", error);
            this.setLoadingStatus("Error loading water data, generating new river");
            this.generateRiverPath();
        }
        
        this.setLoadingStatus("Creating river mesh");
        
        // Create a ribbon for the river
        const river = BABYLON.MeshBuilder.CreateRibbon(
            "river",
            {
                pathArray: [this.paths],
                closeArray: false,
                closePath: false,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                width: this.width
            },
            this.scene
        );
        
        // Create water material
        const waterMaterial = this.createWaterMaterial();
        river.material = waterMaterial;
        
        // Add water animation
        this.animateWater(waterMaterial);
        
        return river;
    }
    
    generateRiverPath() {
        // Define a curved path for the river
        this.paths = [
            new BABYLON.Vector3(-50, 0.1, 0),
            new BABYLON.Vector3(-40, 0.1, 5),
            new BABYLON.Vector3(-30, 0.1, 8),
            new BABYLON.Vector3(-20, 0.1, 7),
            new BABYLON.Vector3(-10, 0.1, 5),
            new BABYLON.Vector3(0, 0.1, 0),
            new BABYLON.Vector3(10, 0.1, -5),
            new BABYLON.Vector3(20, 0.1, -7),
            new BABYLON.Vector3(30, 0.1, -8),
            new BABYLON.Vector3(40, 0.1, -5),
            new BABYLON.Vector3(50, 0.1, 0)
        ];
    }
    
    createWaterMaterial() {
        try {
            // Create water material
            const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
            waterMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.7);
            waterMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            waterMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
            waterMaterial.alpha = 0.7;
            
            // Add fresnel effect for more realistic water
            waterMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
            waterMaterial.reflectionFresnelParameters.bias = 0.1;
            waterMaterial.reflectionFresnelParameters.power = 1;
            
            try {
                // Add water normal map for ripples with error handling
                const bumpTexture = new BABYLON.Texture(
                    "textures/water_normal.jpg", 
                    this.scene,
                    false, // Not noMipmap
                    false, // Not invertY
                    BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                    null, // No onLoad callback
                    (err) => {
                        console.warn("Error loading water normal texture:", err);
                        // Continue without normal map
                    }
                );
                
                bumpTexture.uScale = 5;
                bumpTexture.vScale = 5;
                waterMaterial.bumpTexture = bumpTexture;
            } catch (textureError) {
                console.warn("Error creating water normal texture:", textureError);
                // Continue without normal map
            }
            
            return waterMaterial;
        } catch (error) {
            console.error("Error creating water material:", error);
            this.setLoadingStatus("Error creating water material - using fallback");
            
            // Create a simple fallback material
            const fallbackMaterial = new BABYLON.StandardMaterial("waterMaterialFallback", this.scene);
            fallbackMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.7);
            fallbackMaterial.alpha = 0.7;
            return fallbackMaterial;
        }
    }
    
    animateWater(waterMaterial) {
        // Add water animation
        let time = 0;
        this.scene.registerBeforeRender(() => {
            time += 0.01;
            
            // Animate water color slightly
            waterMaterial.emissiveColor.r = 0.1 + Math.sin(time) * 0.05;
            waterMaterial.emissiveColor.g = 0.1 + Math.sin(time) * 0.05;
            waterMaterial.emissiveColor.b = 0.2 + Math.sin(time) * 0.05;
            
            // Animate water normal map
            if (waterMaterial.bumpTexture) {
                waterMaterial.bumpTexture.uOffset += 0.001;
                waterMaterial.bumpTexture.vOffset += 0.0005;
            }
        });
    }
    
    async saveWaterData() {
        try {
            const waterData = {
                paths: this.paths.map(p => ({ x: p.x, y: p.y, z: p.z })),
                width: this.width
            };
            
            await set(ref(database, 'worldData/water'), waterData);
            console.log("Water data saved to Firebase!");
        } catch (error) {
            console.error("Error saving water data:", error);
        }
    }
    
    async loadWaterData() {
        try {
            const snapshot = await get(ref(database, 'worldData/water'));
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error loading water data:", error);
            return null;
        }
    }
}

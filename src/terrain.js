import * as BABYLON from '@babylonjs/core';
import { ref, set, get, onValue } from 'firebase/database';
import { database } from './firebase-config';

export class TerrainGenerator {
    constructor(scene) {
        this.scene = scene;
        this.heightData = null;
        this.width = 100;
        this.height = 100;
        this.subdivision = 100;
        this.minHeight = 0;
        this.maxHeight = 10;
        this.loadingStatus = "Initializing terrain generator";
    }
    
    setLoadingStatus(status) {
        this.loadingStatus = status;
        console.log(`Terrain: ${status}`);
    }
    
    async createTerrain() {
        this.setLoadingStatus("Starting terrain creation");
        
        try {
            // Try to load terrain data from Firebase with timeout
            this.setLoadingStatus("Attempting to load terrain data from Firebase");
            
            const loadPromise = this.loadTerrainData();
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    this.setLoadingStatus("Terrain data loading timeout, generating new terrain");
                    resolve(null);
                }, 5000);
            });
            
            const terrainData = await Promise.race([loadPromise, timeoutPromise]);
            
            if (terrainData) {
                this.setLoadingStatus("Loading saved terrain data");
                this.heightData = new Float32Array(terrainData.heightData);
                this.width = terrainData.width || this.width;
                this.height = terrainData.height || this.height;
            } else {
                this.setLoadingStatus("Generating new terrain");
                this.heightData = this.generateTerrain();
                
                // Save the generated terrain to Firebase
                this.saveTerrainData().catch(error => {
                    console.error("Error saving terrain data:", error);
                });
            }
        } catch (error) {
            console.error("Error in terrain creation process:", error);
            this.setLoadingStatus("Error loading terrain, generating new terrain");
            this.heightData = this.generateTerrain();
        }
        
        this.setLoadingStatus("Creating terrain mesh");
        
        // Create a ground mesh directly from the height data
        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            "terrain",
            null, // No heightmap URL, we'll use the buffer directly
            {
                width: this.width,
                height: this.height,
                subdivisions: this.subdivision,
                minHeight: this.minHeight,
                maxHeight: this.maxHeight,
                updatable: true,
                onReady: (mesh) => {
                    mesh.checkCollisions = true;
                    mesh.receiveShadows = true;
                },
                // Use our generated height data directly
                bufferWidth: this.subdivision,
                bufferHeight: this.subdivision,
                buffer: this.heightData
            },
            this.scene
        );
        
        // Create and apply ground material
        const groundMaterial = this.createGroundMaterial();
        ground.material = groundMaterial;
        
        // Add physics impostor
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.HeightmapImpostor,
            { mass: 0, friction: 0.5, restitution: 0.3 },
            this.scene
        );
        
        return ground;
    }
    
    generateTerrain() {
        const heightData = new Float32Array(this.subdivision * this.subdivision);
        
        // Create a mostly flat terrain with slight height variations
        for (let i = 0; i < this.subdivision; i++) {
            for (let j = 0; j < this.subdivision; j++) {
                const index = i * this.subdivision + j;
                
                // Base height with small random variations
                let height = 0 + Math.random() * 0.5;
                
                // Add a general hill in the center
                const x = i / this.subdivision - 0.5;
                const z = j / this.subdivision - 0.5;
                const distFromCenter = Math.sqrt(x * x + z * z) * 2.8;
                height += Math.max(0, 1 - distFromCenter) * 2;
                
                // Add some small hills randomly
                const smallHillFactor = Math.sin(x * 10) * Math.cos(z * 8) * 0.2;
                height += smallHillFactor;
                
                // Create a depression for the river
                const riverPath = Math.abs(z - 0.1 * Math.sin(x * 3));
                if (riverPath < 0.05) {
                    height -= 1.5 * (0.05 - riverPath) / 0.05;
                }
                
                heightData[index] = height;
            }
        }
        
        return heightData;
    }
    
    createGroundMaterial() {
        try {
            this.setLoadingStatus("Creating ground material");
            
            // Create material for the ground
            const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
            
            try {
                // Create a grass texture with error handling
                const grassTexture = new BABYLON.Texture(
                    "textures/grass.jpg", 
                    this.scene,
                    false, // Not noMipmap
                    false, // Not invertY
                    BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                    null, // No onLoad callback
                    (err) => {
                        console.warn("Error loading grass texture:", err);
                        // Use a solid color as fallback
                        groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
                    }
                );
                
                grassTexture.uScale = 20;
                grassTexture.vScale = 20;
                groundMaterial.diffuseTexture = grassTexture;
            } catch (textureError) {
                console.warn("Error creating grass texture:", textureError);
                // Use a solid color as fallback
                groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
            }
            
            try {
                // Add some bump mapping for realism with error handling
                const bumpTexture = new BABYLON.Texture(
                    "textures/grass_bump.jpg", 
                    this.scene,
                    false, // Not noMipmap
                    false, // Not invertY
                    BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                    null, // No onLoad callback
                    (err) => {
                        console.warn("Error loading grass bump texture:", err);
                        // Continue without bump map
                    }
                );
                
                bumpTexture.uScale = 20;
                bumpTexture.vScale = 20;
                groundMaterial.bumpTexture = bumpTexture;
            } catch (bumpError) {
                console.warn("Error creating grass bump texture:", bumpError);
                // Continue without bump map
            }
            
            // Adjust material properties
            groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            return groundMaterial;
        } catch (error) {
            console.error("Error creating ground material:", error);
            this.setLoadingStatus("Error creating ground material - using fallback");
            
            // Create a simple fallback material
            const fallbackMaterial = new BABYLON.StandardMaterial("groundMaterialFallback", this.scene);
            fallbackMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
            return fallbackMaterial;
        }
    }
    
    async saveTerrainData() {
        try {
            const terrainData = {
                heightData: Array.from(this.heightData),
                width: this.width,
                height: this.height
            };
            
            await set(ref(database, 'worldData/terrain'), terrainData);
            console.log("Terrain data saved to Firebase!");
        } catch (error) {
            console.error("Error saving terrain data:", error);
        }
    }
    
    async loadTerrainData() {
        try {
            const snapshot = await get(ref(database, 'worldData/terrain'));
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error loading terrain data:", error);
            return null;
        }
    }
}

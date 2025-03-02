import * as BABYLON from '@babylonjs/core';
import { ref, set, get } from 'firebase/database';
import { database } from './firebase-config';
import { TerrainGenerator } from './terrain';
import { WaterSystem } from './water';
import { createStonePath } from './path';

export class WorldBuilder {
    constructor(scene) {
        this.scene = scene;
        this.assets = {};
        this.trees = [];
        this.buildings = [];
        this.shadowGenerator = null;
        this.loadingStatus = "Initializing world builder";
    }
    
    setLoadingStatus(status) {
        this.loadingStatus = status;
        console.log(`World Builder: ${status}`);
        
        // Update loading text in the DOM if possible
        if (window.updateLoadingText) {
            window.updateLoadingText(status);
        }
    }
    
    async createWorld() {
        return new Promise(async (resolve, reject) => {
            try {
                // Set a timeout to resolve anyway after 30 seconds to prevent hanging
                const timeout = setTimeout(() => {
                    this.setLoadingStatus("World creation timeout - resolving with partial world");
                    resolve({
                        ground: this.assets.terrain?.mesh,
                        river: this.assets.water?.mesh,
                        path: this.assets.path,
                        trees: this.trees
                    });
                }, 30000);
                
                // Create lighting
                this.setLoadingStatus("Creating lighting");
                this.createLighting();
                
                // Create skybox
                this.setLoadingStatus("Creating skybox");
                this.createSkybox();
                
                // Generate terrain
                this.setLoadingStatus("Generating terrain");
                const terrain = new TerrainGenerator(this.scene);
                const groundMesh = await terrain.createTerrain();
                this.assets.terrain = {
                    mesh: groundMesh,
                    generator: terrain
                };
                
                // Create river
                this.setLoadingStatus("Creating river");
                const water = new WaterSystem(this.scene);
                const riverMesh = await water.createRiver();
                this.assets.water = {
                    mesh: riverMesh,
                    system: water
                };
                
                // Create stone path
                this.setLoadingStatus("Creating stone path");
                const stonePath = createStonePath(this.scene, groundMesh);
                this.assets.path = stonePath;
                
                // Try loading world objects from Firebase with timeout
                this.setLoadingStatus("Loading world objects");
                
                const loadPromise = this.loadWorldData();
                const objectsTimeoutPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        this.setLoadingStatus("World objects loading timeout, using defaults");
                        resolve(null);
                    }, 5000);
                });
                
                const worldData = await Promise.race([loadPromise, objectsTimeoutPromise]);
                
                if (worldData) {
                    this.setLoadingStatus("Loading saved world objects");
                    if (worldData.trees) {
                        this.loadTrees(worldData.trees);
                    } else {
                        this.addTrees();
                    }
                } else {
                    this.setLoadingStatus("No saved world objects found, adding default trees");
                    this.addTrees();
                }
                
                // Add ambient sounds
                this.setLoadingStatus("Adding ambient sounds");
                this.addAmbientSounds();
                
                // Clear the timeout since we're done
                clearTimeout(timeout);
                
                this.setLoadingStatus("World creation complete");
                resolve({
                    ground: groundMesh,
                    river: riverMesh,
                    path: stonePath,
                    trees: this.trees
                });
            } catch (error) {
                console.error("Error in world creation:", error);
                this.setLoadingStatus(`Error creating world: ${error.message}`);
                
                // Try to return whatever we have so far
                resolve({
                    ground: this.assets.terrain?.mesh,
                    river: this.assets.water?.mesh,
                    path: this.assets.path,
                    trees: this.trees
                });
            }
        });
    }
    
    createLighting() {
        try {
            this.setLoadingStatus("Creating lighting");
            
            // Hemispheric light for general illumination (increased intensity)
            const hemisphericLight = new BABYLON.HemisphericLight(
                "hemisphericLight", 
                new BABYLON.Vector3(0, 1, 0), 
                this.scene
            );
            hemisphericLight.intensity = 1.0; // Increased from 0.7
            hemisphericLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            
            // Directional light for shadows (sun) - adjusted position and direction
            const directionalLight = new BABYLON.DirectionalLight(
                "directionalLight",
                new BABYLON.Vector3(0, -1, 0), // Straight down for better initial lighting
                this.scene
            );
            directionalLight.intensity = 0.8; // Increased from 0.5
            directionalLight.position = new BABYLON.Vector3(0, 50, 0); // Positioned directly above
            
            // Add a point light for additional illumination
            const pointLight = new BABYLON.PointLight(
                "pointLight",
                new BABYLON.Vector3(0, 10, 0),
                this.scene
            );
            pointLight.intensity = 0.5;
            pointLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7); // Warm light
            
            // Generate shadows with error handling
            try {
                this.shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
                this.shadowGenerator.useExponentialShadowMap = true;
                this.shadowGenerator.useBlurExponentialShadowMap = true;
            } catch (shadowError) {
                console.warn("Error creating shadow generator:", shadowError);
                this.shadowGenerator = null;
            }
            
            this.assets.lights = {
                hemisphericLight,
                directionalLight,
                pointLight,
                shadowGenerator: this.shadowGenerator
            };
            
            console.log("Lighting created successfully");
            return this.assets.lights;
        } catch (error) {
            console.error("Error creating lighting:", error);
            this.setLoadingStatus("Error creating lighting - using fallback");
            
            // Create a simple fallback light
            const fallbackLight = new BABYLON.HemisphericLight(
                "fallbackLight", 
                new BABYLON.Vector3(0, 1, 0), 
                this.scene
            );
            fallbackLight.intensity = 1.0;
            
            this.assets.lights = {
                hemisphericLight: fallbackLight,
                directionalLight: null,
                shadowGenerator: null
            };
            
            return this.assets.lights;
        }
    }
    
    createSkybox() {
        try {
            this.setLoadingStatus("Creating skybox");
            
            // Create skybox
            const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
            const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
            skyboxMaterial.backFaceCulling = false;
            
            // Create cube texture with error handling
            const reflectionTexture = new BABYLON.CubeTexture("textures/skybox", this.scene);
            
            // Add error handling for texture loading
            reflectionTexture.onLoadErrorObservable.add((error) => {
                console.warn("Error loading skybox texture:", error);
                // Use a solid color as fallback
                skyboxMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9);
            });
            
            skyboxMaterial.reflectionTexture = reflectionTexture;
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
            
            this.assets.skybox = skybox;
            
            return skybox;
        } catch (error) {
            console.error("Error creating skybox:", error);
            this.setLoadingStatus("Error creating skybox - continuing without it");
            
            // Return a simple skybox with a solid color as fallback
            const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
            const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.9);
            skybox.material = skyboxMaterial;
            
            this.assets.skybox = skybox;
            
            return skybox;
        }
    }
    
    addTrees() {
        // Add some trees to the scene
        const treePositions = [
            { x: 10, z: 10 },
            { x: -15, z: 8 },
            { x: 5, z: -12 },
            { x: -8, z: -10 },
            { x: 20, z: 0 },
            { x: -20, z: 5 },
            { x: 15, z: -20 },
            { x: -12, z: 20 },
            { x: 25, z: 15 },
            { x: -25, z: -15 },
            { x: 30, z: -10 },
            { x: -30, z: 10 },
            { x: 8, z: 25 },
            { x: -8, z: -25 }
        ];
        
        treePositions.forEach(pos => {
            // Randomly choose tree type
            const treeType = Math.random() > 0.5 ? 'pine' : 'oak';
            this.addTree(treeType, new BABYLON.Vector3(pos.x, 0, pos.z));
        });
        
        // Save trees to Firebase
        this.saveWorldData();
    }
    
    addTree(type, position) {
        // Get Y position from terrain height
        const ray = new BABYLON.Ray(
            new BABYLON.Vector3(position.x, 100, position.z),
            new BABYLON.Vector3(0, -1, 0)
        );
        
        const hit = this.scene.pickWithRay(ray);
        if (hit.hit) {
            position.y = hit.pickedPoint.y;
        }
        
        let tree;
        if (type === 'pine') {
            tree = this.createPineTree(position);
        } else if (type === 'oak') {
            tree = this.createOakTree(position);
        }
        
        if (tree) {
            // Add random rotation
            tree.rotation.y = Math.random() * Math.PI * 2;
            
            // Add random scale variation
            const scale = 0.8 + Math.random() * 0.4;
            tree.scaling = new BABYLON.Vector3(scale, scale, scale);
            
            // Add metadata
            tree.metadata = { type };
            
            // Add to trees array
            this.trees.push(tree);
            
            // Make trees cast shadows
            if (this.shadowGenerator) {
                this.shadowGenerator.addShadowCaster(tree);
            }
        }
        
        return tree;
    }
    
    createPineTree(position) {
        // Create a simple pine tree
        const trunkHeight = 1.5;
        const trunkRadius = 0.2;
        
        // Create trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder(
            "trunk", 
            { height: trunkHeight, diameter: trunkRadius * 2 }, 
            this.scene
        );
        
        // Create trunk material
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", this.scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        trunk.material = trunkMat;
        
        // Create foliage
        const foliage = BABYLON.MeshBuilder.CreateCylinder(
            "foliage", 
            { height: 3, diameterTop: 0, diameterBottom: 2 }, 
            this.scene
        );
        
        // Create foliage material
        const foliageMat = new BABYLON.StandardMaterial("foliageMat", this.scene);
        foliageMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.2);
        foliage.material = foliageMat;
        
        // Position foliage
        foliage.position.y = trunkHeight / 2 + 1.5;
        
        // Create parent container for the tree
        const tree = new BABYLON.Mesh("tree", this.scene);
        trunk.parent = tree;
        foliage.parent = tree;
        
        // Position the tree
        tree.position = position;
        
        return tree;
    }
    
    createOakTree(position) {
        // Create a simple oak tree
        const trunkHeight = 2.5;
        const trunkRadius = 0.3;
        
        // Create trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder(
            "trunk", 
            { height: trunkHeight, diameter: trunkRadius * 2 }, 
            this.scene
        );
        
        // Create trunk material
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", this.scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.2);
        trunk.material = trunkMat;
        
        // Create foliage
        const foliage = BABYLON.MeshBuilder.CreateSphere(
            "foliage", 
            { diameter: 4, segments: 8 }, 
            this.scene
        );
        
        // Create foliage material
        const foliageMat = new BABYLON.StandardMaterial("foliageMat", this.scene);
        foliageMat.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
        foliage.material = foliageMat;
        
        // Position foliage
        foliage.position.y = trunkHeight / 2 + 1.5;
        
        // Create parent container for the tree
        const tree = new BABYLON.Mesh("tree", this.scene);
        trunk.parent = tree;
        foliage.parent = tree;
        
        // Position the tree
        tree.position = position;
        
        return tree;
    }
    
    loadTrees(treeData) {
        // Load trees from saved data
        treeData.forEach(data => {
            const position = new BABYLON.Vector3(data.position.x, data.position.y, data.position.z);
            const tree = this.addTree(data.type, position);
            
            if (tree) {
                tree.rotation.y = data.rotation.y;
                tree.scaling = new BABYLON.Vector3(data.scale.x, data.scale.y, data.scale.z);
            }
        });
    }
    
    addAmbientSounds() {
        this.setLoadingStatus("Adding ambient sounds (this may be skipped if audio files are not available)");
        
        try {
            // Create ambient sound with error handling
            const ambientSound = new BABYLON.Sound(
                "ambient", 
                "textures/ambient_nature.mp3", 
                this.scene, 
                () => {
                    console.log("Ambient sound loaded successfully");
                }, 
                {
                    loop: true,
                    autoplay: true,
                    volume: 0.5
                }
            );
            
            // Add error handling for ambient sound
            ambientSound.onError = () => {
                console.warn("Error loading ambient sound - continuing without it");
            };
            
            // Create water sound near the river with error handling
            const waterSound = new BABYLON.Sound(
                "water", 
                "textures/water_flow.mp3", 
                this.scene, 
                () => {
                    console.log("Water sound loaded successfully");
                    // Position water sound at the lake
                    waterSound.setPosition(new BABYLON.Vector3(20, 0.5, -15));
                }, 
                {
                    loop: true,
                    autoplay: true,
                    volume: 0.3,
                    spatialSound: true,
                    distanceModel: "exponential",
                    rolloffFactor: 2
                }
            );
            
            // Add error handling for water sound
            waterSound.onError = () => {
                console.warn("Error loading water sound - continuing without it");
            };
            
            this.assets.sounds = {
                ambient: ambientSound,
                water: waterSound
            };
        } catch (error) {
            console.error("Error setting up ambient sounds:", error);
            this.setLoadingStatus("Error loading sounds - continuing without audio");
        }
    }
    
    async saveWorldData() {
        try {
            const worldData = {
                trees: this.trees.map(tree => ({
                    position: {
                        x: tree.position.x,
                        y: tree.position.y,
                        z: tree.position.z,
                    },
                    scale: {
                        x: tree.scaling.x,
                        y: tree.scaling.y,
                        z: tree.scaling.z,
                    },
                    rotation: {
                        y: tree.rotation.y,
                    },
                    type: tree.metadata?.type || 'pine',
                }))
            };
            
            await set(ref(database, 'worldData/objects'), worldData);
            console.log("World objects saved to Firebase!");
        } catch (error) {
            console.error("Error saving world objects:", error);
        }
    }
    
    async loadWorldData() {
        try {
            const snapshot = await get(ref(database, 'worldData/objects'));
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error loading world objects:", error);
            return null;
        }
    }
}

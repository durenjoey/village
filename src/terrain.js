import * as BABYLON from '@babylonjs/core';

export class TerrainGenerator {
    constructor(scene) {
        this.scene = scene;
        this.width = 200;
        this.height = 200;
        this.subdivision = 100;
    }
    
    log(message) {
        console.log(`Terrain: ${message}`);
    }
    
    async createTerrain() {
        this.log("Creating terrain with mountains at northern and western edges");
        
        // Create a simple ground
        const ground = BABYLON.MeshBuilder.CreateGround(
            "terrain",
            {
                width: this.width,
                height: this.height,
                subdivisions: this.subdivision
            },
            this.scene
        );
        
        // Add mountains by modifying vertices
        this.addMountainsToTerrain(ground);
        
        // Create and apply ground material
        const groundMaterial = this.createGroundMaterial();
        ground.material = groundMaterial;
        
        // Enable shadows
        ground.receiveShadows = true;
        
        this.log("Terrain created successfully");
        return ground;
    }
    
    addMountainsToTerrain(ground) {
        this.log("Adding mountains to terrain");
        
        // Get the vertex data
        const vertexData = BABYLON.VertexData.ExtractFromMesh(ground);
        const positions = vertexData.positions;
        
        // Calculate the number of vertices per side
        const verticesPerSide = Math.sqrt(positions.length / 3);
        
        // Modify the y-coordinate (height) of vertices
        for (let i = 0; i < verticesPerSide; i++) {
            for (let j = 0; j < verticesPerSide; j++) {
                const index = (i * verticesPerSide + j) * 3 + 1; // +1 for y-coordinate
                
                // Normalized coordinates (0 to 1)
                const nx = j / (verticesPerSide - 1);
                const nz = i / (verticesPerSide - 1);
                
                // Base terrain with small random variations
                let height = Math.random() * 0.5;
                
                // Add a general hill in the center
                const centerX = nx - 0.5;
                const centerZ = nz - 0.5;
                const distFromCenter = Math.sqrt(centerX * centerX + centerZ * centerZ) * 2.8;
                height += Math.max(0, 1 - distFromCenter) * 2;
                
                // Add some small hills randomly
                const smallHillFactor = Math.sin(nx * 10) * Math.cos(nz * 8) * 0.2;
                height += smallHillFactor;
                
                // Create a depression for a river
                const riverPath = Math.abs(nz - 0.1 * Math.sin(nx * 3));
                if (riverPath < 0.05) {
                    height -= 1.5 * (0.05 - riverPath) / 0.05;
                }
                
                // Variables to track mountain factors for blending
                let mountainHeightNorth = 0;
                let mountainHeightWest = 0;
                let mountainFactorNorth = 0;
                let mountainFactorWest = 0;
                
                // Add mountains at the northern edge (low z values)
                if (nz < 0.2) { // Mountains in the northern 20% of the terrain
                    // Calculate mountain factor based on distance from north edge
                    mountainFactorNorth = 1 - (nz / 0.2); // 1 at edge, 0 at 20% distance
                    
                    // Create varied mountain peaks using sine waves
                    mountainHeightNorth = 0;
                    
                    // Add several sine waves with different frequencies for natural-looking mountains
                    mountainHeightNorth += Math.sin(nx * 20) * 0.5;
                    mountainHeightNorth += Math.sin(nx * 10) * 0.25;
                    mountainHeightNorth += Math.sin(nx * 5) * 0.75;
                    mountainHeightNorth += Math.sin(nx * 2.5) * 1;
                    
                    // Normalize to 0-1 range and apply mountain factor
                    mountainHeightNorth = ((mountainHeightNorth + 2.5) / 5) * mountainFactorNorth * 25; // Max height of 25
                    
                    // Ensure mountains taper at the edges of the map
                    const edgeFactorNorth = 1 - Math.pow(Math.abs(nx - 0.5) * 2, 2);
                    mountainHeightNorth *= edgeFactorNorth;
                }
                
                // Add mountains at the western edge (low x values)
                if (nx < 0.2) { // Mountains in the western 20% of the terrain
                    // Calculate mountain factor based on distance from west edge
                    mountainFactorWest = 1 - (nx / 0.2); // 1 at edge, 0 at 20% distance
                    
                    // Create varied mountain peaks using sine waves
                    mountainHeightWest = 0;
                    
                    // Add several sine waves with different frequencies for natural-looking mountains
                    // Using different frequencies than the northern mountains for variety
                    mountainHeightWest += Math.sin(nz * 18) * 0.6;
                    mountainHeightWest += Math.sin(nz * 8) * 0.3;
                    mountainHeightWest += Math.sin(nz * 4) * 0.8;
                    mountainHeightWest += Math.sin(nz * 2) * 1.2;
                    
                    // Normalize to 0-1 range and apply mountain factor
                    mountainHeightWest = ((mountainHeightWest + 2.9) / 5.8) * mountainFactorWest * 22; // Slightly lower than northern mountains
                    
                    // Ensure mountains taper at the edges of the map
                    const edgeFactorWest = 1 - Math.pow(Math.abs(nz - 0.5) * 2, 2);
                    mountainHeightWest *= edgeFactorWest;
                }
                
                // Special handling for northwest corner where both mountain ranges meet
                if (nx < 0.2 && nz < 0.2) {
                    // Use a blended approach for the corner to create a natural-looking peak
                    const cornerBlendFactor = Math.sqrt(mountainFactorNorth * mountainFactorWest);
                    const blendedHeight = Math.max(mountainHeightNorth, mountainHeightWest) + 
                                         (Math.min(mountainHeightNorth, mountainHeightWest) * 0.3);
                    
                    // Add the blended height to the base height
                    height += blendedHeight;
                } else {
                    // Add individual mountain heights for non-corner areas
                    height += mountainHeightNorth + mountainHeightWest;
                }
                
                // Set the vertex height
                positions[index] = height;
            }
        }
        
        // Update the vertex data
        vertexData.positions = positions;
        
        // Recompute normals
        BABYLON.VertexData.ComputeNormals(positions, vertexData.indices, vertexData.normals);
        
        // Apply the updated vertex data to the mesh
        vertexData.applyToMesh(ground);
    }
    
    createGroundMaterial() {
        this.log("Creating ground material");
        
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
                () => this.log("Grass texture loaded successfully"),
                (err) => {
                    console.warn("Error loading grass texture:", err);
                    // Use a solid color as fallback
                    groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
                }
            );
            
            grassTexture.uScale = 20;
            grassTexture.vScale = 20;
            groundMaterial.diffuseTexture = grassTexture;
            
            // Add some bump mapping for realism with error handling
            const bumpTexture = new BABYLON.Texture(
                "textures/grass_bump.jpg", 
                this.scene,
                false, // Not noMipmap
                false, // Not invertY
                BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                () => this.log("Grass bump texture loaded successfully"),
                (err) => {
                    console.warn("Error loading grass bump texture:", err);
                    // Continue without bump map
                }
            );
            
            bumpTexture.uScale = 20;
            bumpTexture.vScale = 20;
            groundMaterial.bumpTexture = bumpTexture;
            groundMaterial.bumpTexture.level = 0.8; // Adjust bump intensity
            
            // Adjust material properties
            groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            groundMaterial.specularPower = 64;
        } catch (error) {
            console.error("Error creating ground material:", error);
            // Use a simple fallback material
            groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.2);
        }
        
        return groundMaterial;
    }
}

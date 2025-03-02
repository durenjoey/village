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
        this.log("Creating simple terrain with mountains at northern edge");
        
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
                
                // Add mountains at the northern edge (low z values)
                if (nz < 0.2) { // Mountains in the northern 20% of the terrain
                    // Calculate mountain height based on distance from north edge
                    const mountainFactor = 1 - (nz / 0.2); // 1 at edge, 0 at 20% distance
                    
                    // Create varied mountain peaks using sine waves
                    let mountainHeight = 0;
                    
                    // Add several sine waves with different frequencies for natural-looking mountains
                    mountainHeight += Math.sin(nx * 20) * 0.5;
                    mountainHeight += Math.sin(nx * 10) * 0.25;
                    mountainHeight += Math.sin(nx * 5) * 0.75;
                    mountainHeight += Math.sin(nx * 2.5) * 1;
                    
                    // Normalize to 0-1 range and apply mountain factor
                    mountainHeight = ((mountainHeight + 2.5) / 5) * mountainFactor * 25; // Max height of 25
                    
                    // Ensure mountains taper at the edges of the map
                    const edgeFactor = 1 - Math.pow(Math.abs(nx - 0.5) * 2, 2);
                    mountainHeight *= edgeFactor;
                    
                    // Add mountain height to base height
                    height += mountainHeight;
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

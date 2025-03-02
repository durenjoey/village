import * as BABYLON from '@babylonjs/core';

export function createStonePath(scene, terrain) {
    console.log("Creating Whiterun-style stone path");
    
    try {
        // Define path points
        const pathPoints = generatePathPoints();
        
        // Create path mesh
        const path = createPathMesh(scene, pathPoints);
        
        // Create stone material
        const stoneMaterial = createStoneMaterial(scene);
        
        // Apply material to all children
        if (path && path.getChildMeshes) {
            const children = path.getChildMeshes();
            children.forEach(child => {
                child.material = stoneMaterial;
            });
        } else {
            console.warn("Path mesh doesn't have getChildMeshes method, applying material directly");
            path.material = stoneMaterial;
        }
        
        console.log("Whiterun-style stone path created successfully");
        return path;
    } catch (error) {
        console.error("Error creating stone path:", error);
        return null;
    }
}

// Generate points for a Whiterun-style stone path
function generatePathPoints() {
    // Create an array to hold path segments
    const pathSegments = [];
    
    // Define the main path - a curved path from one side to the lake
    // Starting near the edge and leading to the lake at (20, -15)
    const mainPath = [];
    
    // Start point (edge of the scene)
    const startX = -30;
    const startZ = 10;
    
    // End point (near the lake)
    const endX = 15;
    const endZ = -10;
    
    // Create a curved path with multiple segments
    // This creates a path that curves around, similar to Whiterun's walkways
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        
        // Create a curved path using parametric equations
        // This creates a gentle curve that leads to the lake
        const x = startX + (endX - startX) * t;
        const z = startZ + (endZ - startZ) * t + Math.sin(t * Math.PI) * 5;
        
        // Add point to path with minimal variation (Whiterun paths are more structured)
        mainPath.push(new BABYLON.Vector3(x, 0.25, z));
    }
    
    // Add the main path to the segments
    pathSegments.push(mainPath);
    
    return pathSegments;
}

// Create the path mesh based on the path points
function createPathMesh(scene, pathSegments) {
    // Create a parent mesh to hold all path segments
    const pathParent = new BABYLON.Mesh("stonePath", scene);
    
    // Create individual stone slabs along the path
    pathSegments.forEach((segment, segmentIndex) => {
        for (let i = 0; i < segment.length - 1; i++) {
            // Get current and next points
            const current = segment[i];
            const next = segment[i + 1];
            
            // Calculate direction vector
            const direction = next.subtract(current);
            const distance = direction.length();
            const normalized = direction.normalize();
            
            // Calculate perpendicular vector for width
            const perpendicular = new BABYLON.Vector3(
                -normalized.z,
                0,
                normalized.x
            );
            
            // Path properties - Whiterun style has wider, flatter stones
            const pathWidth = 3.0; // Width of the path
            const stoneLength = 1.5; // Length of each stone
            const stoneWidth = pathWidth / 3; // Width of each stone
            const stoneHeight = 0.15; // Height of each stone (flatter)
            const gapSize = 0.05; // Small gap between stones
            
            // Calculate how many stones to place in this segment
            const stonesCount = Math.max(1, Math.floor(distance / (stoneLength + gapSize)));
            const actualStoneLength = (distance - (gapSize * (stonesCount - 1))) / stonesCount;
            
            // Create stones for this segment
            for (let j = 0; j < stonesCount; j++) {
                // Calculate position for this stone
                const t = j / stonesCount;
                const stoneCenter = current.add(direction.scale(t + 0.5 / stonesCount));
                
                // Create stones in a row (Whiterun style has 3 stones across)
                for (let side = -1; side <= 1; side++) {
                    // Calculate offset from center
                    const offset = perpendicular.scale(side * stoneWidth);
                    const stonePosition = stoneCenter.add(offset);
                    
                    // Create a stone slab
                    const stone = BABYLON.MeshBuilder.CreateBox(
                        `stone_${segmentIndex}_${i}_${j}_${side}`,
                        {
                            width: stoneWidth - gapSize,
                            depth: actualStoneLength - gapSize,
                            height: stoneHeight
                        },
                        scene
                    );
                    
                    // Position the stone
                    stone.position = new BABYLON.Vector3(
                        stonePosition.x,
                        stonePosition.y + stoneHeight / 2, // Position at ground level
                        stonePosition.z
                    );
                    
                    // Rotate the stone to align with the path
                    const angle = Math.atan2(direction.z, direction.x);
                    stone.rotation.y = angle;
                    
                    // Add very slight random rotation for natural look (minimal for Whiterun style)
                    stone.rotation.x = (Math.random() - 0.5) * 0.02;
                    stone.rotation.z = (Math.random() - 0.5) * 0.02;
                    
                    // Parent to the path
                    stone.parent = pathParent;
                    
                    // Add some subtle height variation to stones
                    if (Math.random() > 0.7) {
                        stone.position.y += (Math.random() * 0.05);
                    }
                }
            }
        }
    });
    
    return pathParent;
}

// Create a stone material for the path
function createStoneMaterial(scene) {
    // Create material for the stones - Whiterun has light gray stones
    const stoneMaterial = new BABYLON.StandardMaterial("stoneMaterial", scene);
    
    // Set stone color properties - light grayish with slight variations
    stoneMaterial.diffuseColor = new BABYLON.Color3(0.75, 0.73, 0.7);
    stoneMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    stoneMaterial.specularPower = 64;
    
    // Add some ambient lighting to the stones
    stoneMaterial.ambientColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    
    // Add slight emissive to make them stand out
    stoneMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    
    // Add a subtle bump texture for stone detail
    try {
        // Use the grass bump texture for now (could be replaced with a stone texture)
        const bumpTexture = new BABYLON.Texture("textures/grass_bump.jpg", scene);
        bumpTexture.uScale = 0.5;
        bumpTexture.vScale = 0.5;
        stoneMaterial.bumpTexture = bumpTexture;
        stoneMaterial.bumpTexture.level = 0.3; // Subtle bump effect
    } catch (e) {
        console.warn("Could not load bump texture for stones:", e);
    }
    
    return stoneMaterial;
}

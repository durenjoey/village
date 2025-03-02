import * as BABYLON from '@babylonjs/core';

export function createRiver(scene, terrain) {
    console.log("Creating lake system");
    
    try {
        // Define lake path
        console.log("Generating lake path...");
        const lakePath = generateLakePath();
        console.log(`Lake path generated with ${lakePath.length} points`);
        
        // Create lake mesh
        console.log("Creating lake mesh...");
        const lake = createLakeMesh(scene, lakePath);
        if (!lake) {
            throw new Error("Failed to create lake mesh");
        }
        console.log("Lake mesh created successfully");
        
        // Create water material
        console.log("Creating water material...");
        const waterMaterial = createWaterMaterial(scene);
        lake.material = waterMaterial;
        console.log("Water material applied to lake");
        
        // Add water animation
        console.log("Adding water animation...");
        animateWater(scene, waterMaterial);
        
        // Disable water sound due to missing or corrupted audio file
        // addWaterSound(scene, lakePath);
        
        console.log("Lake created successfully");
        return lake;
    } catch (error) {
        console.error("Error creating lake:", error);
        
        // Create a fallback lake if there's an error
        try {
            console.log("Creating fallback lake...");
            // Create a simple disc for the lake
            const fallbackLake = BABYLON.MeshBuilder.CreateDisc(
                "fallbackLake",
                { radius: 15, tessellation: 32 },
                scene
            );
            
            // Position the fallback lake
            fallbackLake.position = new BABYLON.Vector3(20, 0.15, -15);
            fallbackLake.rotation.x = Math.PI / 2;
            
            // Create a simple water material
            const fallbackMaterial = new BABYLON.StandardMaterial("fallbackWaterMaterial", scene);
            fallbackMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.6);
            fallbackMaterial.alpha = 0.9;
            fallbackLake.material = fallbackMaterial;
            
            console.log("Fallback lake created successfully");
            return fallbackLake;
        } catch (fallbackError) {
            console.error("Error creating fallback lake:", fallbackError);
            return null;
        }
    }
}

// Generate a natural-looking lake path with bean shape
function generateLakePath() {
    // Create a bean-shaped path for the lake
    const lakePath = [];
    
    // Lake parameters
    const centerX = 20;  // Moved to the right
    const centerZ = -15; // Moved slightly back
    const radiusX = 22;  // Base width radius
    const radiusZ = 14;  // Base height radius
    const segments = 36; // Number of segments for the lake perimeter
    
    // Rotation angle for the bean shape (to orient it naturally)
    const rotationAngle = Math.PI / 4; // 45 degrees rotation
    
    // Pre-generate some random offsets for more natural look
    const randomOffsets = [];
    for (let i = 0; i < segments; i++) {
        randomOffsets.push(Math.random() * 0.2 - 0.1);
    }
    
    // Generate points in a bean shape
    for (let i = 0; i <= segments; i++) {
        // Calculate angle for this segment (go full circle)
        const angle = (i / segments) * Math.PI * 2;
        
        // Get index for random offset (handle the last point wrapping around)
        const offsetIndex = i % segments;
        
        // Create a gentle indentation on one side only (bean shape)
        // This creates a small indentation when angle is around 3π/2 (bottom side)
        // The sine function is shifted by π so the indentation is at the bottom
        const pinchFactor = 0.85 + Math.sin(angle + Math.PI) * 0.15;
        
        // Make one end slightly larger than the other for asymmetry
        // This makes the right side of the bean slightly larger
        const asymmetryFactor = 1.0 + Math.cos(angle) * 0.1;
        
        // Calculate base radius with bean shape characteristics
        let baseRadiusX = radiusX * pinchFactor * asymmetryFactor;
        let baseRadiusZ = radiusZ * pinchFactor;
        
        // Add some very gentle random variation to the base radius
        // This creates a more organic overall shape
        baseRadiusX += randomOffsets[offsetIndex] * radiusX * 0.08;
        baseRadiusZ += randomOffsets[offsetIndex] * radiusZ * 0.08;
        
        // Calculate position before rotation
        let x = Math.cos(angle) * baseRadiusX;
        let z = Math.sin(angle) * baseRadiusZ;
        
        // Rotate the point to orient the bean shape
        const rotatedX = x * Math.cos(rotationAngle) - z * Math.sin(rotationAngle);
        const rotatedZ = x * Math.sin(rotationAngle) + z * Math.cos(rotationAngle);
        
        // Add center offset
        const finalX = centerX + rotatedX;
        const finalZ = centerZ + rotatedZ;
        
        // Add subtle natural shoreline variations
        // Using low-frequency sine waves for gentle undulations
        const undulation = (Math.sin(angle * 2.5) * 0.4 + Math.cos(angle * 1.8) * 0.3) * 0.5;
        
        // Calculate final position with natural variations
        const variationX = undulation * Math.cos(angle + rotationAngle);
        const variationZ = undulation * Math.sin(angle + rotationAngle);
        
        // Add point to path (y will be adjusted later)
        lakePath.push(new BABYLON.Vector3(
            finalX + variationX, 
            0.1, 
            finalZ + variationZ
        ));
    }
    
    // Add the first point again to close the loop perfectly
    if (lakePath.length > 0) {
        lakePath.push(lakePath[0].clone());
    }
    
    return lakePath;
}

// Create the lake mesh based on the path
function createLakeMesh(scene, lakePath) {
    // Create a ribbon for the lake
    const lake = BABYLON.MeshBuilder.CreateRibbon(
        "lake",
        {
            pathArray: [lakePath],
            closeArray: true, // Changed to true to ensure proper closing
            closePath: true,  // Close the path to form a complete loop
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            updatable: true,  // Make it updatable for potential future changes
            width: 0.5        // Reduced width for better edge definition
        },
        scene
    );
    
    // Position the lake slightly above the ground to avoid z-fighting
    lake.position.y = 0.15;  // Raised slightly more to ensure it's above terrain
    
    return lake;
}

// Create realistic water material
function createWaterMaterial(scene) {
    // Create water material
    const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", scene);
    
    // Set water color properties - more vibrant blue
    waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.6);
    waterMaterial.specularColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    waterMaterial.specularPower = 128; // Higher for more focused reflections
    waterMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.15, 0.2);
    
    // Add transparency - more opaque to prevent seeing grass through it
    waterMaterial.alpha = 0.92;
    
    // Add fresnel effect for more realistic water
    waterMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    waterMaterial.reflectionFresnelParameters.bias = 0.05;
    waterMaterial.reflectionFresnelParameters.power = 1.5;
    
    // Add water normal map for ripples with increased detail
    try {
        const bumpTexture = new BABYLON.Texture("textures/water_normal.jpg", scene);
        // Increase texture scale for more detail (higher pixel density)
        bumpTexture.uScale = 8;
        bumpTexture.vScale = 8;
        // Increase bump strength
        waterMaterial.bumpTexture = bumpTexture;
    } catch (e) {
        console.warn("Could not load water normal texture:", e);
    }
    
    return waterMaterial;
}

// Add animation to the water (slower for a lake)
function animateWater(scene, waterMaterial) {
    // Animation variables
    let time = 0;
    
    // Register animation function
    scene.registerBeforeRender(() => {
        time += 0.01;
        
        // Animate water color with subtle variation for still water
        if (waterMaterial.emissiveColor) {
            // Slower, more subtle waves for a lake
            const primaryWave = Math.sin(time * 0.2) * 0.02;
            const secondaryWave = Math.sin(time * 0.5) * 0.01;
            
            waterMaterial.emissiveColor.r = 0.05 + primaryWave;
            waterMaterial.emissiveColor.g = 0.15 + primaryWave + secondaryWave;
            waterMaterial.emissiveColor.b = 0.2 + primaryWave + secondaryWave;
            
            // Subtle diffuse color animation
            waterMaterial.diffuseColor.g = 0.4 + secondaryWave;
            waterMaterial.diffuseColor.b = 0.6 + primaryWave;
        }
        
        // Animate water normal map with slower speeds for a lake
        if (waterMaterial.bumpTexture) {
            // Slower flow for still water
            waterMaterial.bumpTexture.uOffset += 0.0003 + Math.sin(time * 0.1) * 0.0002;
            waterMaterial.bumpTexture.vOffset += 0.0002 + Math.cos(time * 0.15) * 0.0001;
        }
    });
}

// Add water sound
function addWaterSound(scene, lakePath) {
    try {
        console.log("Attempting to load water sound...");
        
        // Check if the audio file exists first
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', "textures/water_flow.mp3", false);
        try {
            xhr.send();
            if (xhr.status >= 400) {
                console.warn("Water sound file not found, skipping audio");
                return null;
            }
        } catch (e) {
            console.warn("Error checking water sound file:", e);
            return null;
        }
        
        // Create water sound with more robust error handling
        const waterSound = new BABYLON.Sound(
            "water", 
            "textures/water_flow.mp3", 
            scene, 
            function() {
                console.log("Water sound loaded successfully");
                
                // Position water sound at the middle of the lake
                const middlePoint = new BABYLON.Vector3(20, 0.5, -15); // Updated center of the lake
                waterSound.setPosition(middlePoint);
                
                // Start playing only after successful load
                waterSound.play();
            }, 
            {
                loop: true,
                autoplay: false, // Don't autoplay, we'll play after successful load
                volume: 0.3,
                spatialSound: true,
                distanceModel: "exponential",
                rolloffFactor: 2
            }
        );
        
        return waterSound;
    } catch (e) {
        console.warn("Could not load water sound:", e);
        return null;
    }
}

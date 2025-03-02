import * as BABYLON from '@babylonjs/core';

export function createRiver(scene, terrain) {
    console.log("Creating river system");
    
    try {
        // Define river path
        const riverPath = generateRiverPath();
        
        // Create river mesh
        const river = createRiverMesh(scene, riverPath);
        
        // Create water material
        const waterMaterial = createWaterMaterial(scene);
        river.material = waterMaterial;
        
        // Add water animation
        animateWater(scene, waterMaterial);
        
        // Disable water sound due to missing or corrupted audio file
        // addWaterSound(scene, riverPath);
        
        console.log("River created successfully");
        return river;
    } catch (error) {
        console.error("Error creating river:", error);
        return null;
    }
}

// Generate a natural-looking river path
function generateRiverPath() {
    // Create a curved path for the river
    const riverPath = [];
    
    // Start point
    const startX = -80;
    const endX = 80;
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = startX + (endX - startX) * t;
        
        // Create a meandering path using sine waves
        const z = 20 * Math.sin(t * Math.PI * 2) + 10 * Math.sin(t * Math.PI * 4);
        
        // Add some random variation
        const randomOffset = (Math.random() - 0.5) * 5;
        
        // Add point to path (y will be adjusted later)
        riverPath.push(new BABYLON.Vector3(x, 0.1, z + randomOffset));
    }
    
    return riverPath;
}

// Create the river mesh based on the path
function createRiverMesh(scene, riverPath) {
    // River width
    const riverWidth = 8;
    
    // Create a ribbon for the river
    const river = BABYLON.MeshBuilder.CreateRibbon(
        "river",
        {
            pathArray: [riverPath],
            closeArray: false,
            closePath: false,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            width: riverWidth
        },
        scene
    );
    
    // Position the river slightly above the ground to avoid z-fighting
    river.position.y = 0.1;
    
    return river;
}

// Create realistic water material
function createWaterMaterial(scene) {
    // Create water material
    const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", scene);
    
    // Set water color properties
    waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
    waterMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    waterMaterial.specularPower = 64;
    waterMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.15);
    
    // Add transparency
    waterMaterial.alpha = 0.8;
    
    // Add fresnel effect for more realistic water
    waterMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    waterMaterial.reflectionFresnelParameters.bias = 0.1;
    waterMaterial.reflectionFresnelParameters.power = 1;
    
    // Add water normal map for ripples
    try {
        const bumpTexture = new BABYLON.Texture("textures/water_normal.jpg", scene);
        bumpTexture.uScale = 5;
        bumpTexture.vScale = 5;
        waterMaterial.bumpTexture = bumpTexture;
    } catch (e) {
        console.warn("Could not load water normal texture:", e);
    }
    
    return waterMaterial;
}

// Add animation to the water
function animateWater(scene, waterMaterial) {
    // Animation variables
    let time = 0;
    
    // Register animation function
    scene.registerBeforeRender(() => {
        time += 0.01;
        
        // Animate water color slightly
        if (waterMaterial.emissiveColor) {
            waterMaterial.emissiveColor.r = 0.05 + Math.sin(time) * 0.025;
            waterMaterial.emissiveColor.g = 0.1 + Math.sin(time) * 0.025;
            waterMaterial.emissiveColor.b = 0.15 + Math.sin(time) * 0.025;
        }
        
        // Animate water normal map
        if (waterMaterial.bumpTexture) {
            waterMaterial.bumpTexture.uOffset += 0.001;
            waterMaterial.bumpTexture.vOffset += 0.0005;
        }
    });
}

// Add water sound
function addWaterSound(scene, riverPath) {
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
                
                // Position water sound at the middle of the river
                const middlePoint = riverPath[Math.floor(riverPath.length / 2)];
                waterSound.setPosition(new BABYLON.Vector3(middlePoint.x, 0.5, middlePoint.z));
                
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

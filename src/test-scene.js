import * as BABYLON from '@babylonjs/core';
import { createRiver } from './river';

export function createTestScene(engine) {
    console.log("Creating realistic landscape scene");
    
    // Create a basic scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.4, 0.6, 0.9); // Sky blue color
    
    // Add a camera with better starting position
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 20, -50), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(engine.getRenderingCanvas(), true);
    camera.speed = 1.0; // Faster movement for large terrain
    
    // Add ambient light for overall scene illumination
    const ambientLight = new BABYLON.HemisphericLight(
        "ambientLight", 
        new BABYLON.Vector3(0, 1, 0), 
        scene
    );
    ambientLight.intensity = 0.5;
    ambientLight.diffuse = new BABYLON.Color3(1, 1, 1);
    ambientLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    
    // Add directional light for sun effect with shadows
    const directionalLight = new BABYLON.DirectionalLight(
        "directionalLight",
        new BABYLON.Vector3(-0.5, -1, -0.5),
        scene
    );
    directionalLight.intensity = 0.7;
    directionalLight.position = new BABYLON.Vector3(50, 100, 50);
    
    // Enable shadows
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurScale = 2;
    shadowGenerator.setDarkness(0.2);
    
    // Create skybox
    createSkybox(scene);
    
    // Create large terrain with height variations
    const terrain = createTerrain(scene, shadowGenerator);
    
    // Add river to the landscape
    const river = createRiver(scene, terrain);
    
    // Add some trees and rocks for visual interest
    addEnvironmentalElements(scene, terrain, shadowGenerator);
    
    // Add subtle fog for distance effect
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogColor = scene.clearColor;
    scene.fogDensity = 0.005;
    
    // Add keyboard instructions
    addInstructions(scene);
    
    console.log("Landscape scene created successfully");
    return scene;
}

// Create a skybox
function createSkybox(scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    
    // Use the skybox textures
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    
    return skybox;
}

// Create terrain with height variations
function createTerrain(scene, shadowGenerator) {
    // Create a large ground
    const terrainSize = 200;
    const subdivisions = 100;
    
    // Create custom height map for the terrain
    const terrainData = generateTerrainData(subdivisions);
    
    // Create ground from height map
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
        "terrain", 
        null, // No heightmap URL, we'll use the buffer directly
        {
            width: terrainSize,
            height: terrainSize,
            subdivisions: subdivisions - 1,
            minHeight: 0,
            maxHeight: 10,
            updatable: true,
            onReady: (mesh) => {
                mesh.receiveShadows = true;
                mesh.checkCollisions = true;
            },
            // Use our generated height data directly
            bufferWidth: subdivisions,
            bufferHeight: subdivisions,
            buffer: terrainData
        }, 
        scene
    );
    
    // Create and apply ground material with grass texture
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    
    // Apply grass texture
    const grassTexture = new BABYLON.Texture("textures/grass.jpg", scene);
    grassTexture.uScale = 30; // Adjust tiling to avoid obvious repetition
    grassTexture.vScale = 30;
    groundMaterial.diffuseTexture = grassTexture;
    
    // Apply bump texture for depth
    const bumpTexture = new BABYLON.Texture("textures/grass_bump.jpg", scene);
    bumpTexture.uScale = 30;
    bumpTexture.vScale = 30;
    groundMaterial.bumpTexture = bumpTexture;
    bumpTexture.level = 0.8; // Adjust bump intensity
    
    // Adjust material properties for more realism
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    groundMaterial.specularPower = 64;
    
    ground.material = groundMaterial;
    
    return ground;
}

// Generate terrain height data
function generateTerrainData(size) {
    const data = new Float32Array(size * size);
    
    // Parameters for terrain generation
    const scale = 0.1; // Overall scale of the terrain
    const persistence = 0.5; // How much each octave contributes
    const octaves = 6; // Number of layers of detail
    
    for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
            // Generate base height using multiple frequencies (octaves)
            let height = 0;
            let amplitude = 1.0;
            let frequency = scale;
            
            for (let i = 0; i < octaves; i++) {
                // Use simplex-like noise approximation
                const nx = x * frequency;
                const nz = z * frequency;
                
                // Simple noise function approximation
                const noise = Math.sin(nx * 0.1) * Math.cos(nz * 0.1) * 0.5 + 0.5;
                height += noise * amplitude;
                
                amplitude *= persistence;
                frequency *= 2;
            }
            
            // Add a general hill in the center
            const centerX = size / 2;
            const centerZ = size / 2;
            const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(z - centerZ, 2)) / (size / 2);
            const centerBump = Math.max(0, 1 - distanceFromCenter) * 3;
            
            // Combine height components
            data[x + z * size] = height * 5 + centerBump;
        }
    }
    
    return data;
}

// Add trees, rocks and other elements
function addEnvironmentalElements(scene, terrain, shadowGenerator) {
    // Create a few trees
    const treePositions = [
        new BABYLON.Vector3(10, 0, 10),
        new BABYLON.Vector3(-15, 0, 20),
        new BABYLON.Vector3(25, 0, -15),
        new BABYLON.Vector3(-20, 0, -25),
        new BABYLON.Vector3(0, 0, 30)
    ];
    
    treePositions.forEach(position => {
        // Adjust Y position based on terrain height
        const ray = new BABYLON.Ray(
            new BABYLON.Vector3(position.x, 100, position.z),
            new BABYLON.Vector3(0, -1, 0)
        );
        
        const hit = scene.pickWithRay(ray);
        if (hit.hit) {
            position.y = hit.pickedPoint.y;
        }
        
        // Create a simple tree
        const tree = createTree(scene, position);
        
        // Add shadow casting
        if (shadowGenerator) {
            shadowGenerator.addShadowCaster(tree);
        }
    });
    
    // Add ambient sound
    try {
        const ambientSound = new BABYLON.Sound(
            "ambient", 
            "textures/ambient_nature.mp3", 
            scene, 
            null, 
            {
                loop: true,
                autoplay: true,
                volume: 0.5
            }
        );
    } catch (e) {
        console.log("Could not load ambient sound:", e);
    }
}

// Create a simple tree
function createTree(scene, position) {
    // Create trunk
    const trunk = BABYLON.MeshBuilder.CreateCylinder(
        "trunk", 
        { height: 4, diameter: 1 }, 
        scene
    );
    
    // Create trunk material
    const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
    trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
    trunk.material = trunkMat;
    
    // Create foliage
    const foliage = BABYLON.MeshBuilder.CreateSphere(
        "foliage", 
        { diameter: 6, segments: 8 }, 
        scene
    );
    
    // Create foliage material
    const foliageMat = new BABYLON.StandardMaterial("foliageMat", scene);
    foliageMat.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.1);
    foliage.material = foliageMat;
    
    // Position foliage on top of trunk
    foliage.position.y = 4;
    
    // Create parent container for the tree
    const tree = new BABYLON.Mesh("tree", scene);
    trunk.parent = tree;
    foliage.parent = tree;
    
    // Position the tree
    tree.position = position;
    
    return tree;
}

// Add instructions for keyboard controls
function addInstructions(scene) {
    // Create instruction text element
    const instructionsElement = document.createElement("div");
    instructionsElement.style.position = "absolute";
    instructionsElement.style.bottom = "10px";
    instructionsElement.style.left = "10px";
    instructionsElement.style.color = "white";
    instructionsElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    instructionsElement.style.padding = "10px";
    instructionsElement.style.borderRadius = "5px";
    instructionsElement.style.fontFamily = "Arial, sans-serif";
    instructionsElement.style.fontSize = "14px";
    instructionsElement.style.maxWidth = "300px";
    instructionsElement.style.zIndex = "10";
    
    // Add keyboard control instructions
    instructionsElement.innerHTML = `
        <h3 style="margin-top: 0;">Keyboard Controls</h3>
        <ul style="padding-left: 20px; margin-bottom: 0;">
            <li>WASD: Move around</li>
            <li>Mouse: Look around</li>
            <li>Shift: Speed boost</li>
            <li>Space: Jump</li>
            <li>G: Toggle gravity</li>
            <li>F: Fly mode (move up)</li>
            <li>C: Crouch (move down)</li>
            <li>R: Reset position</li>
            <li>I: Toggle position indicator</li>
            <li>Mouse Wheel: Adjust height</li>
        </ul>
    `;
    
    // Add to document
    document.body.appendChild(instructionsElement);
    
    // Add toggle button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Hide Controls";
    toggleButton.style.position = "absolute";
    toggleButton.style.bottom = "10px";
    toggleButton.style.right = "10px";
    toggleButton.style.zIndex = "10";
    
    // Toggle instructions visibility
    toggleButton.onclick = () => {
        if (instructionsElement.style.display === "none") {
            instructionsElement.style.display = "block";
            toggleButton.textContent = "Hide Controls";
        } else {
            instructionsElement.style.display = "none";
            toggleButton.textContent = "Show Controls";
        }
    };
    
    document.body.appendChild(toggleButton);
}

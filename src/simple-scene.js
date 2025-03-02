import * as BABYLON from '@babylonjs/core';
import { createRiver } from './river';

export function createSimpleScene(engine) {
    console.log("Creating scene with grass textured ground");
    
    // Create a basic scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.4, 0.6, 0.9); // Sky blue color
    
    // Add an ArcRotateCamera for easier panning and movement
    const camera = new BABYLON.ArcRotateCamera(
        "arcCamera", 
        -Math.PI / 2, // Alpha (rotation around Y axis)
        Math.PI / 3,  // Beta (rotation around X axis)
        50,           // Radius (distance from target) - increased for better landscape view
        new BABYLON.Vector3(0, 0, 0), // Target position
        scene
    );
    
    // Set camera limits
    camera.lowerRadiusLimit = 5;   // Minimum zoom distance
    camera.upperRadiusLimit = 200; // Maximum zoom distance - increased for the larger landscape
    camera.wheelDeltaPercentage = 0.01; // Slower zoom speed
    
    // Set camera movement speeds
    camera.panningSensibility = 100; // Lower value = more sensitive panning
    camera.angularSensibilityX = 500; // Horizontal rotation sensitivity
    camera.angularSensibilityY = 500; // Vertical rotation sensitivity
    
    // Enable camera controls
    camera.attachControl(engine.getRenderingCanvas(), true);
    
    // Add keyboard controls for camera movement
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            const speed = 1;
            
            // WASD keys for panning
            if (kbInfo.event.keyCode === 87) { // W key
                camera.target.z += speed;
                camera.position.z += speed;
            }
            if (kbInfo.event.keyCode === 83) { // S key
                camera.target.z -= speed;
                camera.position.z -= speed;
            }
            if (kbInfo.event.keyCode === 65) { // A key
                camera.target.x -= speed;
                camera.position.x -= speed;
            }
            if (kbInfo.event.keyCode === 68) { // D key
                camera.target.x += speed;
                camera.position.x += speed;
            }
            
            // Q and E for height adjustment
            if (kbInfo.event.keyCode === 81) { // Q key
                camera.target.y -= speed;
                camera.position.y -= speed;
            }
            if (kbInfo.event.keyCode === 69) { // E key
                camera.target.y += speed;
                camera.position.y += speed;
            }
            
            // R key to reset camera
            if (kbInfo.event.keyCode === 82) { // R key
                camera.alpha = -Math.PI / 2;
                camera.beta = Math.PI / 3;
                camera.radius = 50; // Match the initial radius
                camera.target = new BABYLON.Vector3(0, 0, 0);
            }
        }
    });
    
    // Add a light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Create a larger ground with grass texture to accommodate the river
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 200, height: 200}, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    
    // Apply grass texture with error handling
    try {
        console.log("Loading grass texture...");
        const grassTexture = new BABYLON.Texture("textures/grass.jpg", scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE, 
            function() {
                console.log("Grass texture loaded successfully");
            }, 
            function(error) {
                console.error("Error loading grass texture:", error);
                // Fallback to color if texture fails to load
                groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
            }
        );
        
        // Set texture scaling to avoid obvious repetition
        grassTexture.uScale = 20;
        grassTexture.vScale = 20;
        groundMaterial.diffuseTexture = grassTexture;
        
        // Apply bump texture for depth
        console.log("Loading grass bump texture...");
        const bumpTexture = new BABYLON.Texture("textures/grass_bump.jpg", scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE,
            function() {
                console.log("Grass bump texture loaded successfully");
            },
            function(error) {
                console.error("Error loading grass bump texture:", error);
            }
        );
        
        bumpTexture.uScale = 20;
        bumpTexture.vScale = 20;
        groundMaterial.bumpTexture = bumpTexture;
        groundMaterial.bumpTexture.level = 0.8; // Adjust bump intensity
        
        // Optimize material properties for grass
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        groundMaterial.specularPower = 64;
        
    } catch (e) {
        console.error("Exception while setting up grass texture:", e);
        // Fallback to a simple color if textures fail to load
        groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
    }
    
    ground.material = groundMaterial;
    
    // Create a river that runs across the landscape
    console.log("Adding river to the landscape");
    const river = createRiver(scene, ground);
    
    // Add a simple sphere to verify rendering
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2}, scene);
    sphere.position.y = 1;
    const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
    sphereMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red color
    sphere.material = sphereMaterial;
    
    // Add a simple box to verify rendering
    const box = BABYLON.MeshBuilder.CreateBox("box", {size: 2}, scene);
    box.position = new BABYLON.Vector3(3, 1, 0);
    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue color
    box.material = boxMaterial;
    
    // Add animation to verify the scene is running
    scene.registerBeforeRender(() => {
        sphere.rotation.y += 0.01;
        box.rotation.y -= 0.01;
    });
    
    // Add debug info
    const debugText = document.createElement("div");
    debugText.style.position = "absolute";
    debugText.style.top = "10px";
    debugText.style.left = "10px";
    debugText.style.color = "white";
    debugText.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    debugText.style.padding = "10px";
    debugText.style.fontFamily = "monospace";
    debugText.style.zIndex = "100";
    debugText.innerHTML = `
        <h3 style="margin-top: 0;">Babylon.js Landscape</h3>
        <p>Grass Textured Ground with Flowing River</p>
        <h4>Camera Controls:</h4>
        <ul style="padding-left: 20px; margin-bottom: 0;">
            <li>Left Mouse: Rotate camera</li>
            <li>Right Mouse: Pan camera</li>
            <li>Mouse Wheel: Zoom in/out</li>
            <li>WASD: Pan camera position</li>
            <li>Q/E: Adjust height</li>
            <li>R: Reset camera</li>
        </ul>
    `;
    document.body.appendChild(debugText);
    
    console.log("Basic scene created successfully");
    return scene;
}

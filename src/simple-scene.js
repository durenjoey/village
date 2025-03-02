import * as BABYLON from '@babylonjs/core';

export function createSimpleScene(engine) {
    console.log("Creating scene with grass textured ground");
    
    // Create a basic scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.4, 0.6, 0.9); // Sky blue color
    
    // Add a camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(engine.getRenderingCanvas(), true);
    
    // Add a light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    // Create a ground with grass texture
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 50}, scene);
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
    debugText.innerHTML = "Babylon.js Scene - Grass Textured Ground with Red Sphere and Blue Box";
    document.body.appendChild(debugText);
    
    console.log("Basic scene created successfully");
    return scene;
}

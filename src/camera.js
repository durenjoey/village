import * as BABYLON from '@babylonjs/core';

export function initCamera(scene, canvas) {
    console.log("Initializing enhanced camera for landscape exploration");
    
    try {
        // Create a camera better suited for landscape exploration
        const camera = new BABYLON.FreeCamera(
            "landscapeCamera", 
            new BABYLON.Vector3(0, 15, -40), // Start higher up to see more of the landscape
            scene
        );
        
        // Set camera controls
        camera.attachControl(canvas, true);
        camera.speed = 1.0; // Faster for large terrain
        camera.angularSensibility = 3000; // More sensitive rotation
        camera.keysUp.push(87); // W
        camera.keysDown.push(83); // S
        camera.keysLeft.push(65); // A
        camera.keysRight.push(68); // D
        
        // Add gravity and collision detection
        camera.applyGravity = false; // Start with gravity off for easier exploration
        camera.checkCollisions = true;
        camera.ellipsoid = new BABYLON.Vector3(2, 2, 2); // Larger collision ellipsoid
        
        // Set the camera's initial target
        camera.setTarget(new BABYLON.Vector3(0, 5, 0));
        
        // Add camera controls
        setupCameraControls(scene, camera);
        
        // Add camera position indicator
        addCameraPositionIndicator(scene, camera);
        
        console.log("Enhanced camera initialized successfully");
        return camera;
    } catch (error) {
        console.error("Error initializing camera:", error);
        
        // Create a fallback camera
        console.log("Creating fallback camera");
        const fallbackCamera = new BABYLON.FreeCamera("fallbackCamera", new BABYLON.Vector3(0, 20, -40), scene);
        fallbackCamera.setTarget(BABYLON.Vector3.Zero());
        fallbackCamera.attachControl(canvas, true);
        
        return fallbackCamera;
    }
}

// Setup additional camera controls
function setupCameraControls(scene, camera) {
    // Camera control variables
    let isJumping = false;
    const jumpHeight = 5;
    let cameraHeight = 15; // Default camera height
    
    // Add keyboard controls
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            // Space key for jumping
            if (kbInfo.event.keyCode === 32 && !isJumping) {
                isJumping = true;
                camera.cameraDirection.y = jumpHeight;
                
                // Reset jumping state after a short delay
                setTimeout(() => {
                    isJumping = false;
                }, 1000);
            }
            
            // G key to toggle gravity
            if (kbInfo.event.keyCode === 71) {
                camera.applyGravity = !camera.applyGravity;
                console.log(`Gravity ${camera.applyGravity ? 'enabled' : 'disabled'}`);
            }
            
            // F key for fly mode (toggle gravity and move up)
            if (kbInfo.event.keyCode === 70) {
                camera.applyGravity = false;
                camera.position.y += 5;
                console.log("Fly mode activated");
            }
            
            // C key for crouch (move down)
            if (kbInfo.event.keyCode === 67) {
                camera.position.y -= 2;
                console.log("Camera lowered");
            }
            
            // R key to reset position
            if (kbInfo.event.keyCode === 82) {
                camera.position = new BABYLON.Vector3(0, 15, -40);
                camera.setTarget(new BABYLON.Vector3(0, 5, 0));
                console.log("Camera position reset");
            }
            
            // Shift key for speed boost
            if (kbInfo.event.keyCode === 16) {
                camera.speed = 2.0;
            }
        }
        
        // Reset speed when shift is released
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
            if (kbInfo.event.keyCode === 16) {
                camera.speed = 1.0;
            }
        }
    });
    
    // Add mouse wheel control for height adjustment
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
            // Adjust camera height with mouse wheel
            if (pointerInfo.event.deltaY < 0) {
                camera.position.y += 1;
            } else {
                camera.position.y = Math.max(1, camera.position.y - 1);
            }
        }
    });
}

// Add a visual indicator showing camera position on the terrain
function addCameraPositionIndicator(scene, camera) {
    // Create a small sphere to show camera position from above
    const indicator = BABYLON.MeshBuilder.CreateSphere("cameraIndicator", {diameter: 1}, scene);
    const indicatorMaterial = new BABYLON.StandardMaterial("indicatorMaterial", scene);
    indicatorMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    indicatorMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
    indicator.material = indicatorMaterial;
    
    // Update indicator position to follow camera (only x and z)
    scene.registerBeforeRender(() => {
        // Cast ray down from camera to find ground height
        const ray = new BABYLON.Ray(
            new BABYLON.Vector3(camera.position.x, 100, camera.position.z),
            new BABYLON.Vector3(0, -1, 0)
        );
        
        const hit = scene.pickWithRay(ray);
        if (hit.hit) {
            indicator.position.x = camera.position.x;
            indicator.position.z = camera.position.z;
            indicator.position.y = hit.pickedPoint.y + 0.5; // Slightly above ground
        } else {
            indicator.position.x = camera.position.x;
            indicator.position.z = camera.position.z;
            indicator.position.y = 0.5; // Default height if no ground found
        }
    });
    
    // Hide indicator initially
    indicator.isVisible = false;
    
    // Toggle indicator visibility with I key
    scene.onKeyboardObservable.add((kbInfo) => {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            if (kbInfo.event.keyCode === 73) { // I key
                indicator.isVisible = !indicator.isVisible;
                console.log(`Position indicator ${indicator.isVisible ? 'shown' : 'hidden'}`);
            }
        }
    });
}

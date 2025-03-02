import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import { createSimpleScene } from './simple-scene';

// Initialize Babylon.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

// Get loading screen
const loadingScreen = document.getElementById("loadingScreen");

// Error display
const errorDisplay = document.createElement("div");
errorDisplay.style.position = "absolute";
errorDisplay.style.bottom = "10px";
errorDisplay.style.left = "10px";
errorDisplay.style.color = "red";
errorDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
errorDisplay.style.padding = "10px";
errorDisplay.style.borderRadius = "5px";
errorDisplay.style.fontFamily = "monospace";
errorDisplay.style.fontSize = "12px";
errorDisplay.style.maxWidth = "80%";
errorDisplay.style.maxHeight = "200px";
errorDisplay.style.overflow = "auto";
errorDisplay.style.display = "none";
document.body.appendChild(errorDisplay);

// Global error handler
window.addEventListener("error", (event) => {
    console.error("Global error:", event.error || event.message);
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML += `<div>${event.message}</div>`;
    
    // Force hide loading screen after error
    if (loadingScreen.style.display !== "none") {
        loadingScreen.style.display = "none";
    }
    
    return false;
});

// Create simple scene
console.log("Creating simple scene");
const scene = createSimpleScene(engine);

// Hide loading screen when scene is ready
scene.executeWhenReady(() => {
    console.log("Scene is ready, hiding loading screen");
    loadingScreen.style.display = "none";
});

// Run the render loop
console.log("Starting render loop");
engine.runRenderLoop(() => {
    scene.render();
});

// Resize handling
window.addEventListener("resize", () => {
    engine.resize();
});

// Force hide loading screen after 5 seconds in case scene never gets ready
setTimeout(() => {
    if (loadingScreen.style.display !== "none") {
        console.log("Forcing loading screen to hide after timeout");
        loadingScreen.style.display = "none";
    }
}, 5000);

import * as BABYLON from '@babylonjs/core';
import '@babylonjs/core/Particles';

export class CloudSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Cloud system properties
        this.clouds = [];
        this.cloudParticles = [];
        this.numClouds = 15; // Number of cloud clusters
        this.cloudHeight = 150; // Height of clouds above ground
        this.cloudAreaSize = 400; // Size of area where clouds can appear
        
        // Initialize
        this.createClouds();
    }
    
    createClouds() {
        console.log("Creating cloud system");
        
        // Create cloud material
        const cloudMaterial = new BABYLON.StandardMaterial("cloudMaterial", this.scene);
        cloudMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        cloudMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        cloudMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        cloudMaterial.alpha = 0.6;
        
        // Create clouds at random positions
        for (let i = 0; i < this.numClouds; i++) {
            // Create a cloud cluster
            this.createCloudCluster(i, cloudMaterial);
        }
        
        console.log(`Created ${this.clouds.length} clouds`);
    }
    
    createCloudCluster(index, material) {
        // Random position within cloud area
        const x = (Math.random() - 0.5) * this.cloudAreaSize;
        const z = (Math.random() - 0.5) * this.cloudAreaSize;
        const y = this.cloudHeight + (Math.random() - 0.5) * 20; // Vary height slightly
        
        // Create a parent mesh for the cloud cluster
        const cloudParent = new BABYLON.Mesh(`cloud_parent_${index}`, this.scene);
        cloudParent.position = new BABYLON.Vector3(x, y, z);
        
        // Random rotation
        cloudParent.rotation.y = Math.random() * Math.PI * 2;
        
        // Random scale
        const scale = 1 + Math.random() * 1.5;
        cloudParent.scaling = new BABYLON.Vector3(scale, scale * 0.6, scale);
        
        // Create cloud particles
        this.createCloudParticles(cloudParent, material, index);
        
        // Add to clouds array
        this.clouds.push(cloudParent);
        
        // Initially set visibility to 0
        cloudParent.visibility = 0;
        
        return cloudParent;
    }
    
    createCloudParticles(parent, material, index) {
        // Create several billboards to form a cloud
        const numBillboards = 5 + Math.floor(Math.random() * 5); // 5-9 billboards per cloud
        
        for (let i = 0; i < numBillboards; i++) {
            // Create a billboard for each cloud puff
            const cloudPuff = BABYLON.MeshBuilder.CreatePlane(
                `cloud_${index}_puff_${i}`,
                { width: 20, height: 10 },
                this.scene
            );
            
            // Random position within the cloud cluster
            const puffX = (Math.random() - 0.5) * 15;
            const puffY = (Math.random() - 0.5) * 5;
            const puffZ = (Math.random() - 0.5) * 15;
            cloudPuff.position = new BABYLON.Vector3(puffX, puffY, puffZ);
            
            // Random rotation to face random directions
            cloudPuff.rotation.y = Math.random() * Math.PI * 2;
            
            // Random scaling
            const puffScale = 0.8 + Math.random() * 0.7;
            cloudPuff.scaling = new BABYLON.Vector3(puffScale, puffScale, 1);
            
            // Apply material
            cloudPuff.material = material.clone(`cloud_${index}_puff_${i}_material`);
            
            // Billboarding - always face camera
            cloudPuff.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
            
            // Parent to cloud cluster
            cloudPuff.parent = parent;
            
            // Add to cloud particles array
            this.cloudParticles.push(cloudPuff);
        }
    }
    
    // Update clouds based on time of day
    update(normalizedTime, deltaTime) {
        if (this.clouds.length === 0) return;
        
        // Time ranges (normalized)
        const dawn = 5/24;     // 5am
        const morning = 7/24;  // 7am
        const evening = 17/24; // 5pm
        const dusk = 19/24;    // 7pm
        
        let cloudVisibility = 0;
        
        // Calculate cloud visibility based on time
        if (normalizedTime >= dawn && normalizedTime < morning) {
            // Dawn to morning: gradually show clouds
            const t = (normalizedTime - dawn) / (morning - dawn);
            cloudVisibility = t;
        } else if (normalizedTime >= morning && normalizedTime < evening) {
            // Morning to evening: clouds fully visible
            cloudVisibility = 1;
        } else if (normalizedTime >= evening && normalizedTime < dusk) {
            // Evening to dusk: gradually hide clouds
            const t = (normalizedTime - evening) / (dusk - evening);
            cloudVisibility = 1 - t;
        }
        
        // Update cloud visibility and movement
        for (let i = 0; i < this.clouds.length; i++) {
            const cloud = this.clouds[i];
            
            // Update visibility
            cloud.visibility = cloudVisibility;
            
            // Slow cloud movement
            cloud.position.x += 0.05 * deltaTime; // Move clouds slowly along X axis
            
            // Wrap clouds around when they go too far
            if (cloud.position.x > this.cloudAreaSize / 2) {
                cloud.position.x = -this.cloudAreaSize / 2;
                cloud.position.z = (Math.random() - 0.5) * this.cloudAreaSize;
            }
        }
    }
    
    // Dispose of cloud system
    dispose() {
        for (const cloud of this.clouds) {
            cloud.dispose();
        }
        this.clouds = [];
        this.cloudParticles = [];
    }
}

const fs = require('fs');
const path = require('path');
const https = require('https');

// Create textures directory if it doesn't exist
const texturesDir = path.join(__dirname, 'textures');
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir);
}

// Create skybox directory if it doesn't exist
const skyboxDir = path.join(texturesDir, 'skybox');
if (!fs.existsSync(skyboxDir)) {
  fs.mkdirSync(skyboxDir);
}

// Function to download a file
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
        console.log(`Downloaded: ${destination}`);
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Texture URLs (using free textures from various sources)
const textures = [
  {
    name: 'grass.jpg',
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/grass.jpg'
  },
  {
    name: 'grass_bump.jpg',
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/grassn.png'
  },
  {
    name: 'water_normal.jpg',
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/waterbump.png'
  },
  {
    name: 'ambient_nature.mp3',
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/sounds/forest.wav'
  },
  {
    name: 'water_flow.mp3',
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/sounds/waves.wav'
  }
];

// Skybox textures
const skyboxTextures = [
  {
    name: 'px.jpg', // positive x
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/skybox/skybox_px.jpg'
  },
  {
    name: 'nx.jpg', // negative x
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/skybox/skybox_nx.jpg'
  },
  {
    name: 'py.jpg', // positive y
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/skybox/skybox_py.jpg'
  },
  {
    name: 'ny.jpg', // negative y
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/skybox/skybox_ny.jpg'
  },
  {
    name: 'pz.jpg', // positive z
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/skybox/skybox_pz.jpg'
  },
  {
    name: 'nz.jpg', // negative z
    url: 'https://raw.githubusercontent.com/BabylonJS/Babylon.js/master/packages/tools/playground/public/textures/skybox/skybox_nz.jpg'
  }
];

// Download all textures
async function downloadAllTextures() {
  try {
    // Download regular textures
    for (const texture of textures) {
      await downloadFile(texture.url, path.join(texturesDir, texture.name));
    }
    
    // Download skybox textures
    for (const texture of skyboxTextures) {
      await downloadFile(texture.url, path.join(skyboxDir, texture.name));
    }
    
    console.log('All textures downloaded successfully!');
  } catch (error) {
    console.error('Error downloading textures:', error);
  }
}

// Start downloading
downloadAllTextures();

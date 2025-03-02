# Babylon.js Landscape World

A 3D landscape visualization project built with Babylon.js featuring a realistic grassy field and river.

## Features

- Realistic grass-textured terrain
- Flowing river with water effects
- Dynamic lighting and shadows
- Interactive camera controls
- Firebase integration for data persistence

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/babylon-landscape.git
   cd babylon-landscape
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Firebase configuration:
   - Copy `src/firebase-config.template.js` to `src/firebase-config.js`
   - Replace the placeholder values with your Firebase project credentials
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:8080`

## Controls

- **WASD**: Move the camera
- **Mouse**: Look around
- **Shift**: Speed boost
- **Space**: Jump
- **G**: Toggle gravity
- **F**: Fly mode (move up)
- **C**: Crouch (move down)
- **R**: Reset camera position
- **I**: Toggle position indicator
- **Mouse Wheel**: Adjust camera height

## Project Structure

- `src/`: Source code
  - `app.js`: Main application entry point
  - `simple-scene.js`: Scene creation and setup
  - `camera.js`: Camera controls and configuration
  - `firebase-config.js`: Firebase configuration (not tracked in git)
  - `firebase-config.template.js`: Template for Firebase configuration

## Development

### Adding New Features

1. Create new components in the `src/` directory
2. Import and use them in `simple-scene.js`
3. Update this README with any new controls or features

### Building for Production

```
npm run build
```

The production build will be available in the `dist/` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

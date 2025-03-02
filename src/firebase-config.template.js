import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, connectDatabaseEmulator } from 'firebase/database';

// Firebase configuration - Replace these with your own Firebase project credentials
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Add error handling for database connection
const dbConnectionPromise = new Promise((resolve) => {
  try {
    // Create a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('Firebase connection timeout - proceeding anyway');
      resolve(database);
    }, 5000);
    
    // Test database connection using the new API
    const connectedRef = ref(database, '.info/connected');
    onValue(connectedRef, (snap) => {
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (snap.val() === true) {
        console.log('Connected to Firebase database');
      } else {
        console.warn('Not connected to Firebase database');
      }
      resolve(database);
    }, (error) => {
      console.error('Firebase connection error:', error);
      clearTimeout(timeoutId);
      resolve(database); // Still resolve to allow offline operation
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Still resolve to allow offline operation
    resolve(database);
  }
});

export { database, dbConnectionPromise };

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, connectDatabaseEmulator } from 'firebase/database';

// Firebase configuration with provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyBfgvZ4GDuECYY3EOEBzcaVQCnzOreuuL8",
  authDomain: "construction-copilot.firebaseapp.com",
  databaseURL: "https://construction-copilot-default-rtdb.firebaseio.com", // Added default RTDB URL
  projectId: "construction-copilot",
  storageBucket: "construction-copilot.appspot.com",
  messagingSenderId: "303483435423",
  appId: "1:303483435423:web:93a3c5db6678b10a78a5aa",
  measurementId: "G-YNC6KCRFXZ"
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

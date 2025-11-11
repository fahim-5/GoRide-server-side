// config/environment.js

import dotenv from 'dotenv'; 

// Although server.js loads this, running it here ensures 
// environment variables are available when this file is imported first.
dotenv.config();

/**
 * Standardized configuration object
 * Accesses values loaded from the .env file via process.env.
 */
export const config = {
  // Environment (used in app.js /health route)
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Server Configuration
  port: process.env.PORT || 5000,
  apiBaseUrl: process.env.VITE_API_BASE_URL,
  
  // Database Configuration
  mongoUri: process.env.MONGODB_URI,
  
  // Firebase Configuration (for frontend/other use if needed)
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  }
};

// Export as default for flexibility
export default config;
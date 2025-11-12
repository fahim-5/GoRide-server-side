
import dotenv from 'dotenv'; 

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  
  port: process.env.PORT || 5000,
  apiBaseUrl: process.env.VITE_API_BASE_URL,
  
  mongoUri: process.env.MONGODB_URI,
  
  firebase: {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  }
};

export default config;
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
// Standard imports for ES Module path resolution
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Import the application entry point
import app from './app.js'; 

dotenv.config();

// Define __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const initializeFirebase = () => {
  try {
    // Corrected path resolution for ES Modules
    const serviceAccountPath = join(__dirname, 'config', 'firebase-service-account.json');
    
    const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.log('💡 Check if config/firebase-service-account.json exists and is valid.');
    process.exit(1);
  }
};

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message);
    console.log('💡 Check your MONGODB_URI in .env file');
    console.log('💡 Make sure your IP is whitelisted in Atlas');
    return false;
  }
};

// Main function to run everything
const createAppAndStartServer = async () => {
  initializeFirebase();
  const dbConnected = await connectDB();
  
  const PORT = process.env.PORT || 5000;

  // Start the server using the imported 'app' instance
  app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚗 GoRide Server');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
    console.log(`🔐 Firebase: Connected ✅`);
    console.log(`🗄️  Database: ${dbConnected ? 'Connected ✅' : 'Disconnected ❌'}`);
    
    if (dbConnected) {
      console.log(`📊 DB Name: ${mongoose.connection.name}`);
      console.log(`🌍 DB Host: ${mongoose.connection.host}`);
    }
    console.log('=================================');
  });
};


// Main Execution
createAppAndStartServer();
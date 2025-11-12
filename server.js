import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import app from './app.js'; 

dotenv.config();

// Define __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const initializeFirebase = () => {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log('🔧 Initializing Firebase with environment variables...');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    } else {
      console.log('🔧 Initializing Firebase with service account file...');
      const serviceAccountPath = join(__dirname, 'config', 'firebase-service-account.json');
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }
    
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
  try {
    initializeFirebase();
    const dbConnected = await connectDB();
    
    if (!dbConnected) {
      console.warn('⚠️ Server starting without database connection');
    }

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🚗 GoRide Server');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server URL: https://go-ride-server-side.vercel.app`);
      console.log(`🔐 Firebase: Initialized ✅`);
      console.log(`🗄️ Database: ${dbConnected ? 'Connected ✅' : 'Disconnected ❌'}`);
      
      if (dbConnected) {
        console.log(`📊 DB Name: ${mongoose.connection.name}`);
        console.log(`🌍 DB Host: ${mongoose.connection.host}`);
      }
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
createAppAndStartServer();
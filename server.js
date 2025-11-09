const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config();

// Initialize Firebase Admin
const initializeFirebase = () => {
  try {
    const serviceAccount = JSON.parse(
      readFileSync(join(__dirname, 'config', 'firebase-service-account.json'), 'utf8')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
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

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize services
initializeFirebase();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌';
  const dbName = mongoose.connection.name || 'Not connected';
  const dbHost = mongoose.connection.host || 'Not connected';
  
  res.json({ 
    status: 'OK',
    message: '🚗 GoRide Server is running!',
    timestamp: new Date().toISOString(),
    services: {
      firebase: 'Connected ✅',
      database: dbStatus,
      databaseName: dbName,
      databaseHost: dbHost,
      cluster: 'Cluster0.zruszch.mongodb.net'
    }
  });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    // Try to ping the database
    await mongoose.connection.db.admin().ping();
    res.json({ 
      message: '✅ Database connection successful!',
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      cluster: 'Cluster0',
      status: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: '❌ Database connection failed',
      error: error.message,
      status: 'Disconnected'
    });
  }
});

// Add a simple test collection to verify writes work
app.get('/api/test-write', async (req, res) => {
  try {
    const testDoc = {
      message: 'Test document from GoRide API',
      timestamp: new Date(),
      status: 'success'
    };
    
    // Create a test collection and insert document
    const result = await mongoose.connection.db.collection('testConnection').insertOne(testDoc);
    
    res.json({ 
      message: '✅ Database write test successful!',
      insertedId: result.insertedId,
      database: mongoose.connection.name
    });
  } catch (error) {
    res.status(500).json({ 
      message: '❌ Database write test failed',
      error: error.message
    });
  }
});

// Protected route example
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ 
    message: 'This is a protected route!',
    user: req.user
  });
});

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  
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
      console.log(`🔗 Cluster: Cluster0.zruszch.mongodb.net`);
    } else {
      console.log('💡 Check your MongoDB Atlas connection string in .env');
      console.log('💡 Make sure your IP is whitelisted in Atlas Network Access');
    }
    console.log('=================================');
  });
};

startServer();
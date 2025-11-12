import admin from 'firebase-admin';
import { User } from '../models/index.js'; 

const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token); 
    return decodedToken;
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      throw new Error('Token expired');
    }
    if (error.code === 'auth/id-token-revoked') {
      throw new Error('Token revoked');
    }
    throw new Error('Invalid token');
  }
};

const extractAndVerifyToken = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return null;
    }
    const token = authHeader.split(" ")[1];
    
    try {
        return await verifyToken(token);
    } catch (error) {
        res.status(401).json({ message: error.message });
        return null;
    }
};

export const login = async (req, res) => {
  const decodedToken = await extractAndVerifyToken(req, res);
  if (!decodedToken) return;

  try {
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split("@")[0],
        photoURL: decodedToken.picture || "",
      });
      await user.save();
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login database error:", error.message);
    res.status(500).json({ message: "Login failed due to server error" });
  }
};

export const register = async (req, res) => {
  const decodedToken = await extractAndVerifyToken(req, res);
  if (!decodedToken) return;

  try {
    const existingUser = await User.findOne({ 
      $or: [{ uid: decodedToken.uid }, { email: decodedToken.email }] 
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' }); 
    }

    const user = new User({
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email.split('@')[0],
      photoURL: decodedToken.picture || ''
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Register database error:", error.message);
    res.status(500).json({ message: "Registration failed due to server error" });
  }
};

export const verify = async (req, res) => {
  const decodedToken = await extractAndVerifyToken(req, res);
  if (!decodedToken) return;
  
  try {
    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    res.status(200).json({
      message: 'Token verified and user found',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Verify database error:", error.message);
    res.status(500).json({ message: "Verification failed due to server error" });
  }
};
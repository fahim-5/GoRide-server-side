import admin from 'firebase-admin';
import { User } from '../models/index.js';

const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decodedToken = await verifyToken(token);
    
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        photoURL: decodedToken.picture || ''
      });
      await user.save();
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decodedToken = await verifyToken(token);
    
    const existingUser = await User.findOne({ 
      $or: [{ uid: decodedToken.uid }, { email: decodedToken.email }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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
    res.status(400).json({ message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decodedToken = await verifyToken(token);
    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Token verified',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
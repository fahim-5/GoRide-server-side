import { User } from '../models/index.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { displayName, phoneNumber, address } = req.body;
    
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (displayName) user.displayName = displayName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    
    await user.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const users = await User.find().select('-__v');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
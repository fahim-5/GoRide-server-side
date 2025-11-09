import admin from 'firebase-admin';

export const authMiddleware = async (req, res, next) => {
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
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ message: 'Token revoked' });
    }
    
    res.status(401).json({ message: 'Invalid token' });
  }
};
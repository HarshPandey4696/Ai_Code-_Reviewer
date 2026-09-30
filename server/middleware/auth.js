import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { DEMO_CREDENTIALS, DEMO_USER_ID } from '../config/demoAuth.js';

const demoUser = {
  _id: DEMO_USER_ID,
  name: DEMO_CREDENTIALS.name,
  email: DEMO_CREDENTIALS.email,
};

// Hard auth — rejects requests without a valid token
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.demo
      ? demoUser
      : await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
};

// Soft auth — attaches req.user if token present, but never blocks the request
export const optionalProtect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.demo
        ? demoUser
        : await User.findById(decoded.id).select('-password');
    }
  } catch {
    // Token invalid — treat as guest, don't block
    req.user = null;
  }
  next();
};

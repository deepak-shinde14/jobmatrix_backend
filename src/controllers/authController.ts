import { Request, Response } from 'express';
import User from '../models/User';
import { generateTokens } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate tokens
    const tokens = generateTokens(user._id, user.role, user.email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tokens
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = generateTokens(user._id, user.role, user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tokens
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Import here to avoid circular dependency
    const { verifyRefreshToken } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId, decoded.role, decoded.email);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  try {
    // In a real application, you would add the refresh token to a blacklist
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
};
import bcrypt from "bcrypt";
import jwtModule from "../modules/jwt/jwt.module.js";
import notificationService from "../service/notification.service.js";

import { prismaClient } from "../config/database.js";
/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate tokens using JWT module
    const tokens = jwtModule.generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    jwtModule.setTokenCookies(res, tokens)

    // 🎯 Send welcome notification
    await notificationService.sendWelcomeNotification(user.id, user.name);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          email: user.email,
        },
        ...tokens,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }



    // Generate tokens using JWT module
    const tokens = jwtModule.generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // cookies
    jwtModule.setTokenCookies(res, tokens)

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          email: user.email,
        },
        ...tokens,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
};

/**
 * Refresh access token
 */

const refresh = async (req, res) => {
  try {
    const refreshToken = req.refreshToken; // Dari middleware
    const user = req.user; // Decoded dari refresh token

    // Generate new access token
    const newAccessToken = jwtModule.generateToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
    });

    // Optional: Generate new refresh token (rotation strategy)
    const newRefreshToken = jwtModule.generateRefreshToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
    });

    // 🍪 Update cookies
    jwtModule.setTokenCookies(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
};

const logout = (req, res) => {
  try {
    // 🍪 Clear cookies
    jwtModule.clearTokenCookies(res);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};


/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get profile",
    });
  }
};

export default {
  register,
  logout,
  login,
  refresh,
  getProfile,
};

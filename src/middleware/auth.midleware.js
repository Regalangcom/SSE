import jwtModule from '../modules/jwt/jwt.module.js';

/**
 * Authenticate JWT token from request (header atau cookie)
 */
const authenticateToken = (req, res, next) => {
  try {
    // Extract token dari header atau cookie
    const token = jwtModule.extractTokenFromRequest(req, 'access');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    const verification = jwtModule.verifyToken(token);

    if (!verification.valid) {
      return res.status(403).json({
        success: false,
        error: verification.expired ? 'Token expired' : 'Invalid token',
      });
    }

    // Attach user data to request
    req.user = verification.decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = jwtModule.extractTokenFromRequest(req, 'access');

    if (token) {
      const verification = jwtModule.verifyToken(token);
      if (verification.valid) {
        req.user = verification.decoded;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

/**
 * Refresh token middleware
 */
const validateRefreshToken = (req, res, next) => {
  try {
    const refreshToken =
      jwtModule.extractTokenFromCookie(req.cookies, 'refresh') ||
      req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    const verification = jwtModule.verifyToken(refreshToken);

    if (!verification.valid) {
      return res.status(403).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    req.refreshToken = refreshToken;
    req.user = verification.decoded;
    next();
  } catch (error) {
    console.error('Refresh token validation error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid refresh token',
    });
  }
};

export {
  authenticateToken,
  optionalAuth,
  validateRefreshToken
};
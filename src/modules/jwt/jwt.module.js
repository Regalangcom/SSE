import jwt from "jsonwebtoken";
import jwtConfig from "./jwt.config.js";
import { getCookieOptions, COOKIE_NAMES } from "../jwt/jwt.cookies.js";

/**
 * Generate access token
 */
const generateToken = (payload, options = {}) => {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  const tokenOptions = {
    expiresIn: options.expiresIn || jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    ...options,
  };

  return jwt.sign(tokenPayload, jwtConfig.secret, tokenOptions);
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return generateToken(payload, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

/**
 * Generate token pair (access + refresh)
 */
const generateTokenPair = (payload) => {
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify token
 */
const verifyToken = (token, options = {}) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      ...options,
    });
    return { valid: true, decoded };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      expired: error.name === "TokenExpiredError",
    };
  }
};

/**
 * Decode token without verification (for debugging)
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Extract token from cookie
 */
const extractTokenFromCookie = (cookies, tokenType = "access") => {
  if (!cookies) return null;

  const cookieName =
    tokenType === "refresh"
      ? COOKIE_NAMES.REFRESH_TOKEN
      : COOKIE_NAMES.ACCESS_TOKEN;

  return cookies[cookieName] || null;
};

/**
 * Extract token from request (header atau cookie)
 */
const extractTokenFromRequest = (req, tokenType = "access") => {
  // Priority: Header -> Cookie
  const headerToken = extractTokenFromHeader(req.headers.authorization);
  if (headerToken) return headerToken;

  return extractTokenFromCookie(req.cookies, tokenType);
};

/**
 * Get token expiration time
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.payload.exp) return null;

  return new Date(decoded.payload.exp * 1000);
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  return expiration < new Date();
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = (refreshToken) => {
  const verification = verifyToken(refreshToken);

  if (!verification.valid) {
    throw new Error("Invalid refresh token");
  }

  // Remove JWT specific fields
  const { iat, exp, iss, aud, ...payload } = verification.decoded;

  return generateToken(payload);
};

/**
 * Set token cookies
 */
const setTokenCookies = (res, tokens) => {
  // Set access token cookie
  res.cookie(
    COOKIE_NAMES.ACCESS_TOKEN,
    tokens.accessToken,
    getCookieOptions("access")
  );

  // Set refresh token cookie
  res.cookie(
    COOKIE_NAMES.REFRESH_TOKEN,
    tokens.refreshToken,
    getCookieOptions("refresh")
  );
};

/**
 * Clear token cookies (untuk logout)
 */
const clearTokenCookies = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { path: "/" });
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: "/" });
};

export default {
  generateToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  extractTokenFromCookie,
  extractTokenFromRequest,
  getTokenExpiration,
  isTokenExpired,
  refreshAccessToken,
  setTokenCookies,
  clearTokenCookies,
  COOKIE_NAMES,
};

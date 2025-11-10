/**
 * Cookie configuration untuk JWT
 */
const getCookieOptions = (type = "refresh") => {
  const isProduction = process.env.NODE_ENV === "production";

  const baseOptions = {
    httpOnly: true, // Ga bisa diakses via JavaScript (prevent XSS)
    secure: isProduction, // HTTPS only di production
    sameSite: isProduction ? "strict" : "lax", // CSRF protection
    path: "/",
  };

  if (type === "refresh") {
    return {
      ...baseOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
  }

  if (type === "access") {
    return {
      ...baseOptions,
      maxAge: 1 * 60 * 60  * 1000, // 1 h
    };
  }

  return baseOptions;
};

/**
 * Cookie names
 */
const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export  {
  getCookieOptions,
  COOKIE_NAMES,
};

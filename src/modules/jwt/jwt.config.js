import dotenv from "dotenv"
dotenv.config()

export default {
  secret: process.env.JWT_SECRET ,
  expiresIn: process.env.JWT_EXPIRES_IN ,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ,
  issuer: process.env.JWT_ISSUER ,
  audience: process.env.JWT_AUDIENCE 
};

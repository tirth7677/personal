import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLIENT_URL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  port: process.env.PORT as string,
  nodeEnv: process.env.NODE_ENV as string,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
  clientUrl: process.env.CLIENT_URL as string,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID as string,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET as string,
};
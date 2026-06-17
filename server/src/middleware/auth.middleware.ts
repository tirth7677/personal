import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { response } from "../utils/response";

export interface AuthRequest extends Request {
  userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return response(res, 401, false, "Not authenticated. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as unknown as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return response(res, 401, false, "Invalid or expired session. Please log in again.");
  }
};
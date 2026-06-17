import { Request, Response } from "express";
import { prisma } from "../config/db";
import { response } from "../utils/response";

export const getHealth = async (req: Request, res: Response) => {
  try {
    // Simple query to confirm DB connectivity
    await prisma.$queryRaw`SELECT 1`;

    return response(res, 200, true, "Server is healthy", {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error(error);
    return response(res, 503, false, "Server is up but database connection failed", {
      database: "disconnected",
    });
  }
};
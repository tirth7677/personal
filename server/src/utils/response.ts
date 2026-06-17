import { Response } from "express";

export const response = <T = null>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null = null
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};
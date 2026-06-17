import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { config } from "../config/env";
import { signupSchema, loginSchema } from "../utils/validators";
import { response } from "../utils/response";
import { ZodError } from "zod";

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });
};

const generateToken = (userId: number) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: "30d",
  });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.parse(req.body);
    const { email, password } = parsed;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return response(res, 409, false, "An account with this email already exists");
    }

    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    return response(res, 201, true, "Account created successfully", { user });
  } catch (error) {
    if (error instanceof ZodError) {
      return response(res, 400, false, error.issues[0]?.message ?? "Validation failed");
    }
    if (error instanceof Error) {
      return response(res, 400, false, error.message);
    }
    return response(res, 500, false, "Internal server error");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { email, password } = parsed;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return response(res, 401, false, "Invalid email or password");
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return response(res, 401, false, "Invalid email or password");
    }

    const token = generateToken(user.id);
    setAuthCookie(res, token);

    return response(res, 200, true, "Logged in successfully", {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return response(res, 400, false, error.issues[0]?.message ?? "Validation failed");
    }
    if (error instanceof Error) {
      return response(res, 400, false, error.message);
    }
    return response(res, 500, false, "Internal server error");
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  return response(res, 200, true, "Logged out successfully");
};
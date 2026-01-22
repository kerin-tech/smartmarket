import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";
import prisma from "@/config/database";
import { generateToken } from "../utils/jwt.handle";
import { successResponse, errorResponse } from "../utils/response.handle";
import { ERROR_CODES } from "../utils/error.codes";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";

const SALT_ROUNDS = 10;

export const registerController = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(
        res,
        "El correo electrónico ya está registrado",
        ERROR_CODES.BAD_REQUEST.code
      );
    }

    // 2. Encriptar contraseña
    const passwordHash = await hash(password, SALT_ROUNDS);

    // 3. Crear usuario en BD
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    // 4. Generar JWT con id y email (según especificación BE-01)
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
    });

    // 5. Formatear respuesta (sin password)
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.createdAt,
    };

    return successResponse(
      res,
      { user: userResponse, token },
      "Usuario registrado exitosamente",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Verificar credenciales (mismo mensaje para ambos casos - seguridad)
    if (!user) {
      return errorResponse(
        res,
        "Credenciales inválidas",
        ERROR_CODES.BAD_REQUEST.code
      );
    }

    // 3. Comparar contraseña con bcrypt
    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return errorResponse(
        res,
        "Credenciales inválidas",
        ERROR_CODES.BAD_REQUEST.code
      );
    }

    // 4. Generar JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // 5. Formatear respuesta (sin password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return successResponse(
      res,
      { user: userResponse, token },
      "Inicio de sesión exitoso",
      200
    );
  } catch (error) {
    next(error);
  }
};
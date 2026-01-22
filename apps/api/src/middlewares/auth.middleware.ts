import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.handle";

interface JwtPayload {
  id: string;
}

const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Obtener el token del header (Bearer token)
    const jwtByUser = req.headers.authorization || "";
    const jwt = jwtByUser.split(" ").pop(); // Extrae el token del "Bearer <token>"

    // 2. Validar si existe el token
    if (!jwt) {
      return res.status(401).json({ error: "NO_SESSION_FOUND" });
    }

    // 3. Verificar validez del token
    const isUser = verifyToken(jwt) as JwtPayload;

    if (!isUser) {
      return res.status(401).json({ error: "INVALID_TOKEN" });
    }

    // 4. Inyectar el ID del usuario en la request para uso posterior
    (req as any).user = isUser;
    
    next(); // Continuar a la ruta
  } catch (error) {
    res.status(400).json({ error: "SESSION_INVALID_OR_EXPIRED" });
  }
};

export { checkJwt };
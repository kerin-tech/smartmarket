import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpUnAuthorizedError } from '@/errors/api.error';

export const verifyAuthToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    next(new HttpUnAuthorizedError('No token provided'));
    return;
  }

  try {
    const secret = process.env.JWT_SECRET ?? 'secret';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    next(new HttpUnAuthorizedError('Invalid token'));
  }
};

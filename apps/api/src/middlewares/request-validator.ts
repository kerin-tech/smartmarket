import { type NextFunction, type Request, type Response } from 'express';
import { type ZodSchema, ZodError } from 'zod';
import { HttpBadRequestError } from '@/errors/api.error';
import logger from '@/utils/logger';

export default class RequestValidator {
  static validate = (schema: ZodSchema) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errorMessages = error.errors.map((issue) => ({
            message: `${issue.path.join('.')} is ${issue.message}`,
          }));
          const rawErrors = errorMessages.map((e) => e.message);
          logger.error(rawErrors);
          next(
            new HttpBadRequestError('Request validation failed!', rawErrors)
          );
        } else {
          next(error);
        }
      }
    };
  };
}

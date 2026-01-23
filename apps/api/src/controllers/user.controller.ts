import { type NextFunction, type Request } from 'express';
// Prisma genera 'User' en singular
import { type User } from '@prisma/client'; 
import { HttpStatusCode } from 'axios';
import UserService from '@/services/user.service';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/utils/api';

export default class UserController extends Api {
  private readonly userService = new UserService();

  public createUser = async (
    req: Request,
    // CORRECCIÓN: Cambiado de <users> a <User>
    res: CustomResponse<User>, 
    next: NextFunction
  ) => {
    try {
      const user = await this.userService.createUser(req.body);
      this.send(res, user, HttpStatusCode.Created, 'createUser');
    } catch (e) {
      next(e);
    }
  };
}

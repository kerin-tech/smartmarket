import { type users } from '@prisma/client';
import prisma from '@/config/database';
import LogMessage from '@/decorators/log-message.decorator';

export default class UserService {
  @LogMessage<[users]>({ message: 'test-decorator' })
  public async createUser(data: users) {
    const user = await prisma.users.create({ data });
    return user;
  }
}

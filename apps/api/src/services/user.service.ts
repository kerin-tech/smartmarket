// src/services/user.service.ts
import { type User } from '@prisma/client';
import prisma from '@/config/database';
import LogMessage from '@/decorators/log-message.decorator';

export default class UserService {
  @LogMessage<[User]>({ message: 'test-decorator' })
  public async createUser(data: User) {
    const user = await prisma.user.create({ data });
    return user;
  }

  /**
   * Obtiene el perfil del usuario excluyendo el password
   * @param id Identificador único del usuario
   */
  @LogMessage<[string]>({ message: 'Fetching user profile' })
  public async getUserProfile(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }
}
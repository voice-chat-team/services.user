import { Injectable } from '@nestjs/common';
import { User } from 'prisma/generated/client';
import { UserCreateInput, UserWhereUniqueInput } from 'prisma/generated/models';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserBy(
    whereInput: UserWhereUniqueInput,
    withUserPasswordHash: boolean,
  ): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: whereInput.id },
          { username: whereInput.username },
          { email: whereInput.email },
          { avatarUrl: whereInput.avatarUrl },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        passwordHash: withUserPasswordHash ? true : false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: UserCreateInput): Promise<Omit<User, 'passwordHash'>> {
    return await this.prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        passwordHash: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

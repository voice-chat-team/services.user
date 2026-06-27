import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  GetRangeUsersByIdRequest,
  GetUserRequest,
  type CreateUserRequest,
} from '@voice-chat/contracts/gen/user';
import { UserRepository } from './user.repository';
import { User as PrismaUser } from 'prisma/generated/client';
import { RpcStatus } from '@voice-chat/common';
import type { UserProfile } from '@voice-chat/contracts/gen/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRespository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getUser(dto: GetUserRequest) {
    try {
      const user = await this.userRespository.getUserBy({
        id: dto.userId,
        username: dto.username,
        email: dto.email,
      });

      if (!user) return null;

      return this._mapUserEntityToGrpcEntity(user);
    } catch {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Пользователь не найден',
      });
    }
  }

  async createUser(dto: CreateUserRequest) {
    try {
      const user = await this.userRespository.create(dto);
      return this._mapUserEntityToGrpcEntity(user);
    } catch {
      throw new RpcException({
        code: RpcStatus.INVALID_ARGUMENT,
        details: 'Не удалось создать пользователя',
      });
    }
  }

  async getUsersById(request: GetRangeUsersByIdRequest) {
    const { usersId } = request;

    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: usersId,
        },
      },
    });

    if (!users.length) return [];

    return users.map((user) => this._mapUserEntityToGrpcEntity(user));
  }

  private _mapUserEntityToGrpcEntity(user: PrismaUser): UserProfile {
    return {
      ...user,
      avatarUrl: user?.avatarUrl ?? '',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

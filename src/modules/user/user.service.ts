import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  GetRangeUsersByIdRequest,
  GetUserForAuthRequest,
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
      const user = await this.userRespository.getUserBy(
        {
          id: dto.userId,
          username: dto.username,
          email: dto.email,
        },
        false,
      );

      if (!user) return null;

      return this._mapUserEntityToGrpcEntity(user);
    } catch {
      throw new RpcException({
        code: RpcStatus.NOT_FOUND,
        details: 'Пользователь не найден',
      });
    }
  }

  async getUserForAuth(dto: GetUserForAuthRequest) {
    try {
      const user = await this.userRespository.getUserBy(
        {
          id: dto.userId,
          username: dto.username,
          email: dto.email,
        },
        true,
      );

      if (!user) return null;

      return {
        ...user,
        avatarUrl: user?.avatarUrl ?? '',
        createdAt: user.createdAt?.toISOString() ?? '',
        updatedAt: user.updatedAt?.toISOString() ?? '',
      };
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

    if (!users.length) return [];

    return users.map((user) => this._mapUserEntityToGrpcEntity(user));
  }

  private _mapUserEntityToGrpcEntity(
    user: Omit<PrismaUser, 'passwordHash'>,
  ): UserProfile {
    return {
      ...user,
      avatarUrl: user?.avatarUrl ?? '',
      createdAt: user.createdAt?.toISOString() ?? '',
      updatedAt: user.updatedAt?.toISOString() ?? '',
    };
  }
}

import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateUserRequest,
  CreateUserResponse,
  GetRangeUsersByIdRequest,
  GetRangeUsersByIdResponse,
  GetUserRequest,
  GetUserResponse,
} from '@voice-chat/contracts/gen/user';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'GetUser')
  async getUser(dto: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.userService.getUser(dto);
    console.log(user);
    return { user: user ?? undefined };
  }

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(dto: CreateUserRequest): Promise<CreateUserResponse> {
    const user = await this.userService.createUser(dto);
    return { user: user ?? undefined };
  }

  @GrpcMethod('UserService', 'GetRangeUsersById')
  async getUsersById(
    dto: GetRangeUsersByIdRequest,
  ): Promise<GetRangeUsersByIdResponse> {
    const users = await this.userService.getUsersById(dto);

    return { users };
  }
}

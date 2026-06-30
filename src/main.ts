import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PROTO_PATHS } from '@voice-chat/contracts';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const USER_GRPC_URL = configService.getOrThrow<string>('USER_GRPC_URL');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user.v1',
      protoPath: PROTO_PATHS.USER,
      url: USER_GRPC_URL,
    },
  });

  await app.startAllMicroservices();
}
bootstrap();

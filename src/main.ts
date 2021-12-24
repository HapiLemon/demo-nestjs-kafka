import { NestFactory } from '@nestjs/core';
import { KafkaModule } from './module/kafka.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(KafkaModule);
  await app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        // 必须在此处指定 groupId 否则自动使用默认的 groupId
        groupId: 'groupIdA',
      },
      // subscribe: {
      //   fromBeginning: true,
      // },
    },
  });
  await app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        // 必须在此处指定 groupId 否则自动使用默认的 groupId
        groupId: 'groupIdB',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();

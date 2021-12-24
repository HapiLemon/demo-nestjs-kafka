import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConsumerController } from './consumer.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'consumerB',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'clientIdB',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'groupIdB',
          },
          subscribe: {
            fromBeginning: true,
          },
        },
      },
    ]),
  ],
  controllers: [ConsumerController],
})
export class ConsumerModule {}

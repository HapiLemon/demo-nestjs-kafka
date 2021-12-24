import {
  Body,
  Controller,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';

@Controller('/producer')
export class ProducerController implements OnModuleInit {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'producer',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'groupIdC',
      },
      producer: {
        allowAutoTopicCreation: true,
      },
    },
  })
  private readonly kafkaClient: ClientKafka;

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('TOPIC_B');
  }

  @Post('/emit')
  public async emitMessage(@Body() body) {
    const topic = body.topic;
    const data = body.data;
    return this.kafkaClient.emit(topic, data);
  }

  @Post('/send')
  public async sendMessage(@Body() body) {
    const topic = body.topic;
    const data = body.data;
    return this.kafkaClient.send(topic, data);
  }
}

import { Controller } from '@nestjs/common';
import {
  Client,
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { KafkaMessage } from 'kafkajs';

@Controller()
export class ConsumerController {
  
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'clientIdA',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'groupIdA',
      },
    },
  })
  private readonly kafkaClientA: ClientKafka;

  // 两个装饰器都能都到消息
  // @MessagePattern('TOPIC_A')
  @EventPattern('TOPIC_C')
  public async consumeMessage(
    @Payload() message,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Event-based');
    console.log(JSON.stringify(message));
    console.log(JSON.stringify(context));
  }

  // 两个装饰器都能都到消息并返回响应
  // @EventPattern('TOPIC_B')
  @MessagePattern('TOPIC_B')
  public async returnMessage(
    @Payload() message: KafkaMessage,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Request-response');
    console.log(JSON.stringify(message));
    console.log(JSON.stringify(context));
    return {
      trackingNumber: `Hi, I got your message ${JSON.stringify(message.value)}`,
    };
  }
}

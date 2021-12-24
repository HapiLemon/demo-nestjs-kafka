学习如何在 nestjs 框架中应用 kafka
## 在 module 中引入的两种方式
### 1. 在 module 中引入
```sql
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'producerA',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'producerA',
            brokers: ['localhost:9092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
})
```
用 Java 话来说就是在容器中注入了一个名字为 producerA 的 bean，可以通过 bean 的名字在其他地方注入。注意：由 name 来决定，而不是 clientId
### 2. 在需要使用的地方声明
```sql
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'producerB',
        brokers: ['localhost:9092'],
      },
      producer: {
        allowAutoTopicCreation: true,
      },
    },
  })
  private readonly kafkaClient: ClientKafka;
```
        此处就不需要 name 属性了。
## 生产
### 1. Request-response
这种方式最主要的表现是，需要一个额外的 topic 作为响应 topic，默认格式为 ${topic}.reply。需要使用 `ClientKafka.send()`方法来向 topic 推送消息。在推送消息之前会检查是否调动方法`ClientKafka.subscribeToResponseOf(topic)`，若无则报错
> The client consumer did not subscribe to the corresponding reply topic (TOPIC_C.reply).

向 topic 发送消息后，会等待消费者消费消息，消费成功后将得到消费者的响应信息。
当消费者抛出异常后，得到一个报错，但发送的函数还在等待返回
> UnhandledPromiseRejectionWarning: TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received an instance of Object

### 2. Event-based
这种方式只需要一个 topic，使用 `ClientKafka.emit()` 方法向 topic 发送消息。
## 消费
需要在 main.ts 调用方法 `await app.connectMicroservice({})`和`await app.startAllMicroservices()`
> 在 main.ts 中指定从头消费，在 module 中不指定从头消费，还是会从头消费。
> 在 main.ts 中不指定从头消费，在 module 中指定从头消费，不会从头消费。

无论是 Request-response 消息类型还是 Event-based 消息类型，都可以使用注解 `@MessagePattern()` 或者 `@EventPattern()` 消费消息，并且将返回数据放入响应 topic 中（只有在有需要时会放进去）
## 疑问
### 1. @MessagePattern() 和 @EventPattern()
经过测试，这两个注解都是可以成功消费到消息，并且成功将响应消息推送到响应 topic 的。但官方文档中推荐 `@MessagePattern()` 注解和 `ClientKafka.send()` 方法组合使用实现 Request-response 消息模式；`@EventPattern()` 注解和 `ClientKafka.emit()` 方法组合使用实现 Event-based 消息
模式。
### 2. 为什么需要在 main.ts 中使用这两个方法
await app.connectMicroservice({})
await app.startAllMicroservices()

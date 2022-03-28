import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopic,
  EachMessagePayload,
  Kafka,
} from 'kafkajs';
import { KafkaConfig } from 'src/config/schema.config';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly logTag = 'ConsumerService';
  private readonly kafka: Kafka;
  private readonly consumerGroups: { [k in string]: Consumer } = {};

  constructor(
    private readonly configService: ConfigService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {
    const { brokers } = this.configService.get<KafkaConfig>('kafka');
    this.kafka = new Kafka({ brokers });
  }

  private getConsumer(groupId: string): Consumer | undefined {
    return this.consumerGroups[groupId];
  }

  async consume(
    consumerConfig: ConsumerConfig,
    topics: ConsumerSubscribeTopic[],
    consumerRunConfig: ConsumerRunConfig,
  ) {
    const consumer = this.kafka.consumer(consumerConfig);
    try {
      // 컨슈머 그룹당 하나의 연결만 가능하다. => 여러개 선언시? 에러는 나지 않지만 토픽에 컨슈머 그룹이 할당되지 못한다.
      await consumer.connect();
      // 토픽은 여러개 설정 가능하다.
      await Promise.all(
        topics.map(async (topic) =>
          consumer.subscribe({ ...topic, fromBeginning: true }),
        ),
      );
      // 컨슈머 그룹이 토픽을 읽어오는 로직(run)은 1개만 선언이 가능하다. => 여러개 선언시? 최초 선언 이후 무시된다.
      await consumer.run(consumerRunConfig);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw error;
    }
    const { groupId } = consumerConfig;
    this.consumerGroups[groupId] = consumer;
  }

  // 한번에 하나씩만 처리
  async commitOffset(groupId: string, data: EachMessagePayload) {
    const { topic, partition, message } = data;
    try {
      await this.getConsumer(groupId).commitOffsets([
        {
          topic,
          partition,
          offset: String(Number.parseInt(message.offset) + 1),
          // **주의: 문자열 더하기 연산을 하는 경우 에러 없이 결과가 오프셋으로 저장이 된다.
          // ex) '9' + 1 = '91'
          // 현재 오프셋이 9일때 문자열 덧셈으로 결과가 넘어가면 	Consumer Offset은 91이 lag는 -81이 된다.
        },
      ]);
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
      throw error;
    }
  }

  async onApplicationShutdown() {
    try {
      await Promise.all(
        Object.values(this.consumerGroups).map(async (consumer) =>
          consumer.disconnect(),
        ),
      );
    } catch (error) {
      this.logger.error(error, error.stack, this.logTag);
    }
  }
}

import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, logLevel } from 'kafkajs';
import { KafkaConfig } from 'src/config/schema.config';

@Injectable()
export class KafkaService {
  private readonly client: Kafka;

  constructor(
    private readonly configService: ConfigService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {
    const { brokers, product } = this.configService.get<KafkaConfig>('kafka');
    this.client = new Kafka({
      logCreator: this.kafkaLogger.bind(null, this.logger),
      clientId: product.groupId,
      brokers,
    });
  }

  private kafkaLogger(logger: any) {
    return ({ namespace, level, label, log }) => {
      let loggerMethod: string;

      switch (level) {
        case logLevel.ERROR:
        case logLevel.NOTHING:
          loggerMethod = 'error';
          break;
        case logLevel.WARN:
          loggerMethod = 'warn';
          break;
        case logLevel.INFO:
          loggerMethod = 'log';
          break;
        case logLevel.DEBUG:
        default:
          loggerMethod = 'debug';
          break;
      }

      const { message, ...others } = log;
      if (loggerMethod === 'error') {
        logger[loggerMethod](
          `${label} [${namespace}] ${message} ${JSON.stringify(others)}`,
          {},
          'KafkaService',
        );
      } else if (logger[loggerMethod]) {
        logger[loggerMethod](
          `${label} [${namespace}] ${message} ${JSON.stringify(others)}`,
          'KafkaService',
        );
      }
    };
  }

  getClient() {
    return this.client;
  }
}

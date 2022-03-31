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
    const { brokers, stock } = this.configService.get<KafkaConfig>('kafka');
    this.client = new Kafka({
      logCreator: this.kafkaLogger.bind(null, this.logger),
      clientId: stock.groupId,
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
      if (logger[loggerMethod]) {
        logger[loggerMethod](
          `${label} [${namespace}] ${message} ${JSON.stringify(others)}`,
        );
      }
    };
  }

  getClient() {
    return this.client;
  }
}

import { SchemaConfig } from './schema.config';

export default SchemaConfig.from({
  kafka: {
    brokers: [process.env.KAFKA_BROKER_1],
  },
});

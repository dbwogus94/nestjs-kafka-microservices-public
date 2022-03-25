import { SchemaConfig } from './schema.config';

export default SchemaConfig.from({
  database: {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME_DEV,
    port: +process.env.DATABASE_PORT,
    dropSchema: false,
    synchronize: false,
  },

  kafka: {
    brokers: [process.env.KAFKA_BROKER_1],
    stock: {
      groupName: process.env.STOCK_CONSUMER_NAME,
      topics: [
        { topic: process.env.STOCK_CONSUMER_CREATE_TOPIC },
        { topic: process.env.STOCK_CONSUMER_DELETE_TOPIC },
      ],
    },
  },
});

import { SchemaConfig } from './schema.config';

export default SchemaConfig.from({
  port: +process.env.PORT,

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
    product: {
      groupId: process.env.PRODUCT_CONSUMER_ID,
      topics: [
        { topic: process.env.PRODUCT_CONSUMER_CREATE_TOPIC },
        { topic: process.env.PRODUCT_CONSUMER_UPDATE_TOPIC },
        { topic: process.env.PRODUCT_CONSUMER_DELETE_TOPIC },
      ],
    },
  },

  swagger: {
    title: process.env.SWAGGER_TITLE,
    description: process.env.SWAGGER_DESCRIPTION,
    version: process.env.SWAGGER_VERSION,
  },
});

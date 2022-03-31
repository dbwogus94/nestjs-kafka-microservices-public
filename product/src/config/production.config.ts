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
    brokers: [...process.env.KAFKA_BROKERS.split(',')],
    product: {
      groupId: process.env.PRODUCT_CONSUMER_ID,
      topics: [
        { topic: process.env.PRODUCT_CONSUMER_CREATE_TOPIC },
        { topic: process.env.PRODUCT_CONSUMER_UPDATE_TOPIC },
        { topic: process.env.PRODUCT_CONSUMER_DELETE_TOPIC },
      ],
    },
  },

  serviceHost: {
    stockHost: process.env.STOCK_HOST,
  },

  swagger: {
    product: {
      title: process.env.PRODUCT_SWAGGER_TITLE,
      description: process.env.PRODUCT_SWAGGER_DESCRIPTION,
      version: process.env.PRODUCT_SWAGGER_VERSION,
    },
  },
});

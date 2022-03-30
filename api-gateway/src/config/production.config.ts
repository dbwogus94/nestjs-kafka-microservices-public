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

  swagger: {
    product: {
      title: process.env.STOCK_SWAGGER_TITLE,
      description: process.env.STOCK_SWAGGER_DESCRIPTION,
      version: process.env.STOCK_SWAGGER_VERSION,
    },

    stock: {
      title: process.env.STOCK_SWAGGER_TITLE,
      description: process.env.STOCK_SWAGGER_DESCRIPTION,
      version: process.env.STOCK_SWAGGER_VERSION,
    },
  },
});

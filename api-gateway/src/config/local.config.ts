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
    apis: {
      title: process.env.APIS_SWAGGER_TITLE,
      description: process.env.APIS_SWAGGER_DESCRIPTION,
      version: process.env.APIS_SWAGGER_VERSION,
    },

    product: {
      title: process.env.PRODUCT_SWAGGER_TITLE,
      description: process.env.PRODUCT_SWAGGER_DESCRIPTION,
      version: process.env.PRODUCT_SWAGGER_VERSION,
    },

    stock: {
      title: process.env.STOCK_SWAGGER_TITLE,
      description: process.env.STOCK_SWAGGER_DESCRIPTION,
      version: process.env.STOCK_SWAGGER_VERSION,
    },
  },
});

import { SchemaConfig } from './schema.config';

export default SchemaConfig.from({
  port: +process.env.PORT,

  salt: +process.env.BCRYPT_SALT,

  database: {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME_DEV,
    port: +process.env.DATABASE_PORT,
    dropSchema: false,
    synchronize: false,
  },

  jwt: {
    issuer: process.env.JWT_ISSUER,
    access: {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME, // ms 단위
    },
    refresh: {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME, // ms 단위
    },
  },

  cookie: {
    secret: process.env.COOKIE_SECRET,
    jwtCookieConfig: {
      key: process.env.COOKIE_KEY,
      options: {
        domain: process.env.COOKIE_DOMAIN,
        path: process.env.COOKIE_PATH,
        httpOnly: true,
        maxAge: +process.env.COOKIE_MAXAGE, // ms 단위
        sameSite: false,
        signed: true,
        secure: false,
      },
    },
  },

  serviceHost: {
    productHost: process.env.PRODUCT_HOST,
    stockHost: process.env.STOCK_HOST,
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
    auth: {
      title: process.env.AUTH_SWAGGER_TITLE,
      description: process.env.AUTH_SWAGGER_DESCRIPTION,
      version: process.env.AUTH_SWAGGER_VERSION,
    },
  },
});

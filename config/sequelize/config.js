const { join } = require('path');

if ( process.env.NODE_ENV && process.env.NODE_ENV === 'development' ) {
  require('dotenv')
    .config({ path: join(__dirname, '..', '..', '.env') });
}

module.exports = {
  development: {
    username: process.env.DB_LOCAL_USERNAME,
    password: process.env.DB_LOCAL_PASSWORD,
    database: process.env.DB_LOCAL_NAME,
    host: process.env.DB_LOCAL_HOST,
    port: process.env.DB_LOCAL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
    debug: true,
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: process.env.CI_DB_HOST,
    port: process.env.CI_DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  production: {
    username: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_PROD_HOST,
    port: process.env.DB_PROD_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    },
  },
};

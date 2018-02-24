export const dbPasswordSalt = 'asw';
export const jwtSalt = 'asdf';

export const alvisProjectsFilesDir = './static/alvis-project/';

export const dbConfig = {
  developmentLinux: {
    username: 'alviseditor',
    password: 'alviseditor',
    database: 'alviswebeditor',
    options: {
      host: '/var/run/postgresql',
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    },
  },
  development: {
    username: 'postgres',
    password: 'password',
    database: 'alviswebeditor',
    options: {
      host: 'localhost',
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    },
  },
  production: {
    username: 'postgres',
    password: '',
    database: '',
    options: {
      host: null,
      dialect: 'alviswebeditor',
      pool: {
        max: 5,
        min: 0,
        idle: 10000,
      },
    },
  },
};

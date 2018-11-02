export const dbPasswordSalt = 'asw';
export const jwtSalt = 'asdf';

export const alvisProjectsFilesDir = './alvis-projects-files/';

export const dbConfig = {
  development: {
    username: 'postgres',
    password: 'password',
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
  developmentWindows: {
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

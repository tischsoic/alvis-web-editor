export const dbPasswordSalt = 'asw';
export const jwtSalt = 'asdf';

export const alvisProjectsFilesDir = './static/alvis-project/';

export const dbConfig = {
    development: {
        username: 'postgres',
        password: 'haslo',
        database: 'alvis1',
        options: {
            host: 'localhost',
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        }
    },
    production: {
        username: 'postgres',
        password: '',
        database: '',
        options: {
            host: null,
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        }
    }
}
import * as Sequelize from 'sequelize';
import defineFileInSequelize from './models/defineFileInSequelize';
import defineUserInSequelize from './models/defineUserInSequelize';
import { IDbModels } from './models/dbModels';

export let sqlz: Sequelize.Sequelize = null;
export let models: IDbModels = null;

export function initializeSequelize(database: string, username: string, password: string, options: Sequelize.Options) {
    console.log(password);
    sqlz = new Sequelize(database, username, password, options);

    models = {
        File: defineFileInSequelize(sqlz),
        User: defineUserInSequelize(sqlz),
    }
}
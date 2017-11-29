import * as Sequelize from 'sequelize';
import * as tableOptions from './tableOptions.json';
import { IUserInstance, IUserAttribute } from './User';

export const defineUserInSequelize = (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IUserInstance, IUserAttribute>('user',
    {
      id: {
        field: 'id',
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        field: 'email',
        type: Sequelize.STRING(256),
        allowNull: false,
        validate: {
          isEmail: true,
        }
      },
      password: {
        field: 'password',
        type: Sequelize.STRING(128),
        allowNull: true,
      },
      firstname: {
        field: 'firstname',
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      lastname: {
        field: 'lastname',
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      activated: {
        field: 'activated',
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    }, <any>tableOptions);

export default defineUserInSequelize;
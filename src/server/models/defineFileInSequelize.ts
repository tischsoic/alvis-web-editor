import * as Sequelize from 'sequelize';
import * as tableOptions from './tableOptions.json';
import { IFileInstance, IFileAttribute } from './File';

export const defineFileInSequelize = (sequelize: Sequelize.Sequelize) =>
  sequelize.define<IFileInstance, IFileAttribute>('file',
    {
      id: {
        field: 'id',
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        field: 'name',
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      realtive_path: {
        field: 'realtive_path',
        type: Sequelize.STRING(2048),
        allowNull: false,
      },
    }, <any>tableOptions);

export default defineFileInSequelize;
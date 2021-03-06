import * as Sequelize from 'sequelize';
import { IDefaultAttributes } from './IDefaultAttributes';

export interface IFileAttribute extends IDefaultAttributes {
  id?: number;
  realtive_path?: string;
  name?: string;
}

export interface IFileInstance
  extends Sequelize.Instance<IFileAttribute>,
    IFileAttribute {}

export interface IFileModel
  extends Sequelize.Model<IFileInstance, IFileAttribute> {}

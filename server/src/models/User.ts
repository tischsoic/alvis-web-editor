import * as Sequelize from 'sequelize';
import { IDefaultAttributes } from './IDefaultAttributes';

export interface IUserAttribute extends IDefaultAttributes {
  id?: number;
  email?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  activated?: boolean;
}

export interface IUserInstance
  extends Sequelize.Instance<IUserAttribute>,
    IUserAttribute {}

export interface IUserModel
  extends Sequelize.Model<IUserInstance, IUserAttribute> {}

import { IUserModel } from "./User";
import { IFileModel } from "./File";

export interface IDbModels {
    File: IFileModel,
    User: IUserModel,
}
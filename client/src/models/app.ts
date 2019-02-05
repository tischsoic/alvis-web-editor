import { Record, List } from 'immutable';
import { IUserAttribute } from '../../../server/src/models/User';

export interface IApp {
  appOpened: boolean;
  duringSigningIn: boolean; // TO DO: change name: this name is ambiguous - now it is used when login request was sent
  // Maybe: duringServerAuthentication
  duringRegistration: boolean; // TO DO: change name: this name is ambiguous - now it is used when regustration request was sent
  bearerToken: string | null;

  projects: List<IProjectRecord>;
  projectsDuringFetching: boolean;
  projectsAlreadyFetched: boolean;
  openedProject: IProjectRecord | null;

  users: List<IUserRecord>;
  usersDuringFetching: boolean;
  usersAlreadyFetched: boolean;
}
export type IAppRecord = ReturnType<Record.Factory<IApp>>;
const defaultAppRecord: IApp = {
  appOpened: false,
  duringSigningIn: false,
  duringRegistration: false,
  bearerToken: null,

  openedProject: null,

  projects: List(),
  projectsDuringFetching: false,
  projectsAlreadyFetched: false,

  users: List(),
  usersDuringFetching: false,
  usersAlreadyFetched: false,
};
export const appRecordFactory = Record<IApp>(defaultAppRecord);

export interface IProject {
  // TO DO: change name - there are two IProject interfaces another in ./project.ts
  id: number;
  name: string;
}
export type IProjectRecord = ReturnType<Record.Factory<IProject>>;
const defaultProjectRecord: IProject = {
  id: null,
  name: '',
};
export const projectRecordFactory = Record<IProject>(defaultProjectRecord);

export interface IUser extends IUserAttribute {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  activated: boolean;
}
export type IUserRecord = ReturnType<Record.Factory<IUser>>;
const defaultUserRecord: IUser = {
  id: null,
  email: null,
  firstname: null,
  lastname: null,
  activated: null,
};
export const userRecordFactory = Record<IUser>(defaultUserRecord);

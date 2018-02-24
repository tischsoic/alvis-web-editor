import { Record, List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';
import { IUserAttribute } from '../../server/models/User';

export interface IApp {
  readonly appOpened: boolean;
  readonly duringSigningIn: boolean; // TO DO: change name: this name is ambiguous - now it is used when login request was sent
  // Maybe: duringServerAuthentication
  readonly duringRegistration: boolean; // TO DO: change name: this name is ambiguous - now it is used when regustration request was sent
  readonly bearerToken: string | null;

  readonly projects: List<IProjectRecord>;
  readonly projectsDuringFetching: boolean;
  readonly projectsAlreadyFetched: boolean;
  readonly openedProjectName: string | null;
  readonly openedProjectId: number | null;

  readonly users: List<IUserRecord>;
  readonly usersDuringFetching: boolean;
  readonly usersAlreadyFetched: boolean;
}

export interface IAppRecord extends TypedRecord<IAppRecord>, IApp {}

const defaultAppRecord: IApp = {
  appOpened: false,
  duringSigningIn: false,
  duringRegistration: false,
  bearerToken: null,

  openedProjectName: null,
  openedProjectId: null,

  projects: List(),
  projectsDuringFetching: false,
  projectsAlreadyFetched: false,

  users: List(),
  usersDuringFetching: false,
  usersAlreadyFetched: false,
};

export const appRecordFactory = makeTypedFactory<IApp, IAppRecord>(
  defaultAppRecord,
);

export interface IProject {
  // TO DO: change name - there are two IProject interfaces another in ./project.ts
  readonly id: number;
  readonly name: string;
}

export interface IProjectRecord extends TypedRecord<IProjectRecord>, IProject {}

const defaultProjectRecord: IProject = {
  id: null,
  name: '',
};

export const projectRecordFactory = makeTypedFactory<IProject, IProjectRecord>(
  defaultProjectRecord,
);

export interface IUser extends IUserAttribute {
  readonly id: number;
  readonly email: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly activated: boolean;
}

export interface IUserRecord extends TypedRecord<IUserRecord>, IUser {}

const defaultUserRecord: IUser = {
  id: null,
  email: null,
  firstname: null,
  lastname: null,
  activated: null,
};

export const userRecordFactory = makeTypedFactory<IUser, IUserRecord>(
  defaultUserRecord,
);

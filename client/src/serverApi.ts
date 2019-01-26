import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
// import { IUserAttribute } from '../server/models/User';
import { RootState } from './reducers/index';
import { IUser } from './models/app';
import { IProject } from './models/project';

const isDevelopment = process.env.NODE_ENV !== 'production';

console.log(isDevelopment);

export const publicStaticBase = isDevelopment
  ? 'http://localhost:3000/public/'
  : 'http://localhost:3001/public/';
export const urlBase = isDevelopment
  ? 'http://localhost:3000/server'
  : 'http://localhost:3001/server';

export function getServerPublicApi() {
  const api = {
    verifyToken: (token: string) =>
      axios.head(`${urlBase}/system/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  };

  return api;
}

export function getServerApi(state: RootState) {
  const token = state.app.bearerToken;
  const baseConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const api = {
    accounts: {
      emailUnoccupied: (email: string) =>
        axios.head(`${urlBase}/system/email/${email}`, baseConfig),
      getAll: () =>
        axios.get<IUser[]>(`${urlBase}/system/account/`, baseConfig),
      changeStatus: (activated: boolean, userId: number) =>
        axios.post<{ success: boolean; activated: boolean }>(
          `${urlBase}/system/account/${userId}/activated`,
          {
            activated,
          },
          baseConfig,
        ),
    },
    auth: {
      authenticate: (email: string, password: string) =>
        axios.post<{ success: boolean; token: string }>(
          `${urlBase}/auth`,
          {
            email,
            password,
          },
          baseConfig,
        ),
    },
    project: {
      getAll: () =>
        axios.get<IProject[]>(`${urlBase}/system/project`, baseConfig),
      get: (projectId: number) =>
        axios.get<{ sourcecode: string }>(
          `${urlBase}/system/project/${projectId}/sourcecode`,
          baseConfig,
        ),
      save: (projectId: number, sourcecode: string) =>
        axios.post<{ success: boolean }>(
          `${urlBase}/system/project/${projectId}/sourcecode`,
          {
            sourcecode,
          },
          baseConfig,
        ),
      create: (name: string, sourceCode: string) =>
        axios.post<{
          projectId: number;
          projectName: string;
          projectSourceCode: string;
        }>(
          `${urlBase}/system/project/sourcecode`,
          {
            name,
            sourceCode,
          },
          baseConfig,
        ),
      delete: (projectId: number) =>
        axios.delete(`${urlBase}/system/project/${projectId}`, baseConfig),
      fileUpload: (
        projectData: FormData,
        onUploadProgress: (progressEvent: ProgressEvent) => void,
      ) =>
        axios.post<{ id: number; name: string; sourcecode: string }>(
          `${urlBase}/system/project/sourcecodefile`,
          projectData,
          {
            ...baseConfig,
            onUploadProgress,
          },
        ),
    },
    register: {
      register: (
        email: string,
        firstname: string,
        lastname: string,
        password: string,
      ) =>
        axios.post<{ success: boolean }>(
          `${urlBase}/register`,
          {
            email,
            firstname,
            lastname,
            password,
          },
          baseConfig,
        ),
    },
  };

  return api;
}

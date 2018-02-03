import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
// import { IUserAttribute } from '../server/models/User';
import { RootState } from './reducers/index';
import {IUser} from './models/app';

const isDevelopment = process.env.NODE_ENV !== "production";

console.log(isDevelopment);

export const publicStaticBase = isDevelopment ? 'http://localhost:3000/public/' : 'http://localhost:3001/public/';
export const urlBase = isDevelopment ? 'http://localhost:3000/server' : 'http://localhost:3001/server';


export function getServerApi(state: RootState) {
    const baseConfig = {
        headers: {
            Authorization: 'Bearer ' + state.app.bearerToken,
        }
    };

    const api = {
        accounts: {
            email: (email: string) =>
                axios.head(`${urlBase}/system/email/${email}`,
                    baseConfig
                ),
            index: () =>
                axios.get<IUser[]>(`${urlBase}/system/account/`,
                    baseConfig
                ),
            activate: (activated: boolean, userId: number) =>
                axios.post<{ success: boolean, activated: boolean }>(`${urlBase}/system/account/${userId}/activated`,
                    {
                        activated
                    },
                    baseConfig
                )

        },
        auth: {

        },
        project: {

        },
        register: {

        },
    }

    return api;
}

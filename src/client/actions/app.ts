import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as Actions from '../constants/appActions';
import { IUserRecord, IProjectRecord, projectRecordFactory } from '../models/app';
import { RootState } from '../reducers/index';
import { List } from 'immutable';
import { mx } from '../utils/mx';
import * as projectActions from './project';
import parseAlvisProjectXML from '../utils/alvisXmlParser';

const openApp = createAction<boolean, boolean>(
    Actions.APP_OPEN_APP,
    (value: boolean) => value
);

const setBearerToken = createAction<string, string>(
    Actions.APP_SET_BEARER_TOKEN,
    (value: string) => value
);

const setDuringSigningIn = createAction<boolean, boolean>(
    Actions.APP_SET_DURING_SIGNINGIN,
    (value: boolean) => value
);

const setDuringRegistration = createAction<boolean, boolean>(
    Actions.APP_SET_DURING_SIGNINGIN,
    (value: boolean) => value
);

const setProjectsDuringFetching = createAction<boolean, boolean>(
    Actions.APP_SET_PROJECTS_DURING_FETCHING,
    (value: boolean) => value
);

const setUsersDuringFetching = createAction<boolean, boolean>(
    Actions.APP_SET_USERS_DURING_FETCHING,
    (value: boolean) => value
);

const setProjects = createAction<List<IProjectRecord>, List<IProjectRecord>>(
    Actions.APP_SET_PROJECTS,
    (value: List<IProjectRecord>) => value
);

const setUsers = createAction<List<IUserRecord>, List<IUserRecord>>(
    Actions.APP_SET_USERS,
    (value: List<IUserRecord>) => value
);

const setOpenedProjectId = createAction<number, number>(
    Actions.APP_SET_OPENED_PROJECT_ID,
    (value: number) => value
);

const signIn = (email: string, password: string): ((dispatch: redux.Dispatch<any>) => AxiosPromise) => {
    return (dispatch: redux.Dispatch<any>): AxiosPromise => {
        dispatch(setDuringSigningIn(true));

        const promise = axios.post('http://localhost:3000/server/auth', {
            email, password
        });

        promise
            .then((response: AxiosResponse) => {
                console.log(response);

                const responseData = response.data,
                    success = responseData.success,
                    message = responseData.message,
                    token = responseData.token;

                if (success) {
                    dispatch(setBearerToken(token));
                    dispatch(openApp(true));
                    dispatch(setDuringSigningIn(false));
                    return;
                }
                dispatch(setDuringSigningIn(false));
            })
            .catch((error: AxiosError) => {
                console.log(error);

                dispatch(setDuringSigningIn(false));
            });

        return promise;
    }
}

const fetchUsers = (): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch: redux.Dispatch<any>, getState: () => RootState): AxiosPromise => {
        dispatch(setUsersDuringFetching(true));

        const token = getState().app.bearerToken,
            promise = axios.get('http://localhost:3000/server/asystem/account', {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            });

        promise
            .then((response: AxiosResponse) => {
                console.log(response);

                const responseData = response.data;

                dispatch(setUsersDuringFetching(false));
            })
            .catch((error: AxiosError) => {
                console.log(error);

                dispatch(setUsersDuringFetching(false));
            });

        return promise;
    }
}

// TO DO: change to fetchProjectsData
const fetchProjects = (): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch, getState): AxiosPromise => {
        dispatch(setProjectsDuringFetching(true));

        const token = getState().app.bearerToken,
            promise = axios.get('http://localhost:3000/server/system/project', {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            });

        promise
            .then((response: AxiosResponse) => {
                const responseData: { id: number, name: string }[] = response.data;

                let projects = List<IProjectRecord>();
                responseData.forEach(project => {
                    projects = projects.push(projectRecordFactory(project));
                });

                dispatch(setProjects(projects));
                dispatch(setProjectsDuringFetching(false));
            })
            .catch((error: AxiosError) => {
                console.log(error);

                dispatch(setProjectsDuringFetching(false));
            });

        return promise;
    }
}

const openProjectFromServer = (projectId: number): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch, getState): AxiosPromise => {
        // dispatch(setProjectsDuringFetching(true));

        const token = getState().app.bearerToken,
            promise = axios.get('http://localhost:3000/server/system/project/' + projectId + '/sourcecode', {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            });

        promise
            .then((response: AxiosResponse) => {
                const responseData: { sourcecode: string } = response.data;

                const sourcecode = response.data.sourcecode, // TO DO: better name would be 'code' or 'sources', probably 'code' 
                    xmlDocument = mx.mxUtils.parseXml(sourcecode);

                dispatch(projectActions.setProjectXML(sourcecode));
                dispatch(projectActions.setAlvisProject(parseAlvisProjectXML(xmlDocument)));
                dispatch(setOpenedProjectId(projectId));
                // dispatch(setProjectsDuringFetching(false));
            })
            .catch((error: AxiosError) => {
                console.log(error);

                // dispatch(setProjectsDuringFetching(false));
            });

        return promise;
    }
}

export {
    openApp,
    setBearerToken, setDuringSigningIn, setDuringRegistration,
    signIn,
    fetchProjects, setProjects, setProjectsDuringFetching,
    fetchUsers, setUsers, setUsersDuringFetching,
    openProjectFromServer,
};

import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as Actions from '../constants/appActions';
import { IUserRecord, IProjectRecord, projectRecordFactory, userRecordFactory } from '../models/app';
import { RootState } from '../reducers/index';
import { List } from 'immutable';
import { mx } from '../utils/mx';
import * as projectActions from './project';
import parseAlvisProjectXML from '../utils/alvisXmlParser';
import { parseAlvisProjectToXml } from '../utils/toXml';
import { getValidEmptyAlvisProject } from '../utils/alvisProject';
import { IAlvisProjectRecord } from '../models/alvisProject';
import { urlBase } from '../serverApi';

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

const setUserData = createAction<IUserRecord, IUserRecord>(
    Actions.APP_SET_USER_DATA,
    (value: IUserRecord) => value
);

const setOpenedProjectId = createAction<number, number>(
    Actions.APP_SET_OPENED_PROJECT_ID,
    (value: number) => value
);

const signIn = (email: string, password: string): ((dispatch: redux.Dispatch<any>) => AxiosPromise) => {
    return (dispatch: redux.Dispatch<any>): AxiosPromise => {
        dispatch(setDuringSigningIn(true));

        const promise = axios.post(urlBase + '/auth', {
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

const register = (email: string, firstname: string, lastname: string, password: string): ((dispatch: redux.Dispatch<any>) => AxiosPromise) => {
    return (dispatch: redux.Dispatch<any>): AxiosPromise => {
        dispatch(setDuringRegistration(true));

        const promise = axios.post(urlBase + '/register', {
            email, firstname, lastname, password
        });

        promise
            .then((response: AxiosResponse) => {
                console.log(response);

                const responseData = response.data,
                    success = responseData.success;

                dispatch(setDuringRegistration(false));
            })
            .catch((error: AxiosError) => {
                console.log(error);

                dispatch(setDuringRegistration(false));
            });

        return promise;
    }
}

const activateUser = (user: IUserRecord, activated: boolean): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch: redux.Dispatch<any>, getState: () => RootState): AxiosPromise => {
        const token = getState().app.bearerToken,
            promise = axios.post(urlBase + '/system/account/' + user.id + '/activated',
                {
                    activated
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    }
                }
            );

        promise
            .then((response: AxiosResponse) => {
                console.log(response);

                const responseData: { success: boolean, activated: boolean } = response.data,
                    { success, activated } = responseData;

                if (success) {
                    dispatch(setUserData(user.set('activated', activated)));
                }
            })
            .catch((error: AxiosError) => {
                console.log(error);
            });

        return promise;
    }
}

const fetchUsers = (): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch: redux.Dispatch<any>, getState: () => RootState): AxiosPromise => {
        dispatch(setUsersDuringFetching(true));

        const token = getState().app.bearerToken,
            promise = axios.get(urlBase + '/system/account', {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            });

        promise
            .then((response: AxiosResponse) => {
                console.log(response);

                const responseData = response.data,
                    users: List<IUserRecord> = List(responseData.map(userData => userRecordFactory(userData)));

                dispatch(setUsers(users));
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
            promise = axios.get(urlBase + '/system/project', {
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

const openProject = (projectId: number, alvisProject: [IAlvisProjectRecord, number]): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => void) => {
    return (dispatch, getState): void => {
        dispatch(projectActions.setAlvisProject(alvisProject));
        dispatch(setOpenedProjectId(projectId));
    }
}

const closeProject = (projectId: number): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => void) => {
    return (dispatch, getState): void => {
        const emptyAlvisProject = getValidEmptyAlvisProject();
        dispatch(projectActions.setAlvisProject([emptyAlvisProject, 0]));
        dispatch(setOpenedProjectId(null));
    }
}

const openProjectFromServer = (projectId: number): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch, getState): AxiosPromise => {
        // dispatch(setProjectsDuringFetching(true));

        const token = getState().app.bearerToken,
            promise = axios.get(urlBase + '/system/project/' + projectId + '/sourcecode', {
                headers: {
                    Authorization: 'Bearer ' + token,
                }
            });

        promise
            .then((response: AxiosResponse) => {
                const responseData: { sourcecode: string } = response.data,
                    { sourcecode } = responseData, // TO DO: better name would be 'code' or 'sources', probably 'code' 
                    xmlDocument = mx.mxUtils.parseXml(sourcecode);

                dispatch(openProject(projectId, parseAlvisProjectXML(xmlDocument)));
                // dispatch(setProjectsDuringFetching(false));
            })
            .catch((error: AxiosError) => {
                console.log(error);

                // dispatch(setProjectsDuringFetching(false));
            });

        return promise;
    }
}

const saveProjectToServer = (): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch, getState): AxiosPromise => {
        const alvisProject = getState().project.alvisProject,
            alvisProjectXml = parseAlvisProjectToXml(alvisProject);

        const token = getState().app.bearerToken,
            projectId = getState().app.openedProjectId,
            promise = axios.post(
                urlBase + '/system/project/' + projectId + '/sourcecode',
                {
                    sourcecode: alvisProjectXml,
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    }
                });

        promise
            .then((response: AxiosResponse) => {
                const responseData: { success: boolean } = response.data,
                    { success } = responseData;

                console.log('saving project, success:', success); // TO DO: maybe better would be sending some response like 404, 
                // which would be then catched as error?
            })
            .catch((error: AxiosError) => {
                console.log(error);

            });

        return promise;
    }
}

const createProjectFromFile = (projectName: string, sourceCodeFile: File): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch, getState): AxiosPromise => {
        const newProjectData = new FormData();

        newProjectData.append('name', projectName);
        newProjectData.append('alvisProjectFile', sourceCodeFile);

        const token = getState().app.bearerToken,
            promise = axios.post(
                urlBase + '/system/project/sourcecodefile',
                newProjectData,
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    },
                    onUploadProgress: (progressEvent: ProgressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(percentCompleted);
                    }
                });

        promise
            .then((response: AxiosResponse) => {
                const responseData: { id: number, name: string, sourcecode: string } = response.data,
                    { id, name, sourcecode } = responseData,
                    xmlDocument = mx.mxUtils.parseXml(sourcecode);

                dispatch(openProject(id, parseAlvisProjectXML(xmlDocument)));
                dispatch(fetchProjects());

                console.log(responseData);
            })
            .catch((error: AxiosError) => {
                console.log(error);

            });

        return promise;
    }
}

const createEmptyProject = (projectName: string): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch, getState): AxiosPromise => {
        const emptyAlvisProject = getValidEmptyAlvisProject(),
            emptyAlvisProjectXml = parseAlvisProjectToXml(emptyAlvisProject);

        const token = getState().app.bearerToken,
            promise = axios.post(
                urlBase + '/system/project/sourcecode',
                {
                    name: projectName,
                    sourceCode: emptyAlvisProjectXml,
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    }
                });

        promise
            .then((response: AxiosResponse) => {
                const responseData: { projectId: number, projectName: string, projectSourceCode: string } = response.data,
                    { projectId, projectName, projectSourceCode } = responseData,
                    xmlDocument = mx.mxUtils.parseXml(projectSourceCode);

                dispatch(openProject(projectId, parseAlvisProjectXML(xmlDocument)));
                dispatch(fetchProjects());

                console.log(responseData);
            })
            .catch((error: AxiosError) => {
                console.log(error);

            });

        return promise;
    }
}

const deleteProject = (projectId: number): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => AxiosPromise) => {
    return (dispatch, getState): AxiosPromise => {
        const currentProjectId = getState().app.openedProjectId;
        const token = getState().app.bearerToken,
            promise = axios.delete(
                urlBase + '/system/project/' + projectId,
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    }
                });

        promise
            .then((response: AxiosResponse) => {
                const responseData: { success: boolean } = response.data,
                    { success } = responseData;

                if (success) {
                    const allProjects = getState().app.projects,
                        allProjectsWithoutDeleted = allProjects.delete(
                            allProjects.findIndex(el => el.id === projectId)
                        );

                    dispatch(setProjects(allProjectsWithoutDeleted));
                    if (projectId == currentProjectId) {
                        dispatch(closeProject(projectId));
                    }
                } else {
                    // TO DO
                }


                console.log(responseData);
            })
            .catch((error: AxiosError) => {
                console.log(error);

            });

        return promise;
    }
}

export {
    openApp,
    setBearerToken, setDuringSigningIn, setDuringRegistration,
    signIn, register,
    fetchProjects, setProjects, setProjectsDuringFetching,
    fetchUsers, setUsers, setUsersDuringFetching,
    activateUser,
    openProjectFromServer, saveProjectToServer, createProjectFromFile, createEmptyProject,
    deleteProject,
};

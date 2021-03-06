import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as Actions from '../constants/appActions';
import {
  IUserRecord,
  IProjectRecord,
  projectRecordFactory,
  userRecordFactory,
} from '../models/app';
import { RootState } from '../reducers/index';
import { List } from 'immutable';
import { mx } from '../utils/mx';
import * as projectActions from './project/project';
import parseAlvisProjectXML from '../utils/alvisXmlParser';
import { parseAlvisProjectToXml } from '../utils/toXml';
import { getValidEmptyAlvisProject } from '../utils/alvisProject';
import { IAlvisProjectRecord } from '../models/alvisProject';
import { urlBase, getServerApi } from '../serverApi';

const initializeApp = createAction(Actions.APP_INITIALIZE);

const openApp = createAction<boolean, boolean>(
  Actions.APP_OPEN_APP,
  (value: boolean) => value,
);

const setBearerToken = createAction<string, string>(
  Actions.APP_SET_BEARER_TOKEN,
  (value: string) => value,
);

const setDuringSigningIn = createAction<boolean, boolean>(
  Actions.APP_SET_DURING_SIGNINGIN,
  (value: boolean) => value,
);

const setDuringRegistration = createAction<boolean, boolean>(
  Actions.APP_SET_DURING_SIGNINGIN,
  (value: boolean) => value,
);

const setProjectsDuringFetching = createAction<boolean, boolean>(
  Actions.APP_SET_PROJECTS_DURING_FETCHING,
  (value: boolean) => value,
);

const setUsersDuringFetching = createAction<boolean, boolean>(
  Actions.APP_SET_USERS_DURING_FETCHING,
  (value: boolean) => value,
);

const setProjects = createAction<List<IProjectRecord>, List<IProjectRecord>>(
  Actions.APP_SET_PROJECTS,
  (value: List<IProjectRecord>) => value,
);

const setUsers = createAction<List<IUserRecord>, List<IUserRecord>>(
  Actions.APP_SET_USERS,
  (value: List<IUserRecord>) => value,
);

const setUserData = createAction<IUserRecord, IUserRecord>(
  Actions.APP_SET_USER_DATA,
  (value: IUserRecord) => value,
);

const setOpenedProject = createAction<
  IProjectRecord | null,
  IProjectRecord | null
>(Actions.APP_SET_OPENED_PROJECT, (value: IProjectRecord | null) => value);

const signOut = () => {
  return (dispatch: redux.Dispatch<any>): void => {
    dispatch(setBearerToken(null));
    dispatch(openApp(false));
  };
};

const signIn = (email: string, password: string) => {
  return (
    dispatch: redux.Dispatch<any>,
    getState: () => RootState,
  ): AxiosPromise => {
    dispatch(setDuringSigningIn(true));

    const promise = getServerApi(getState()).auth.authenticate(email, password);

    promise
      .then((response: AxiosResponse) => {
        console.log(response);

        const responseData = response.data;
        const success = responseData.success;
        const message = responseData.message;
        const token = responseData.token;

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
  };
};

const register = (
  email: string,
  firstname: string,
  lastname: string,
  password: string,
): ((dispatch: redux.Dispatch<any>) => AxiosPromise) => {
  return (dispatch: redux.Dispatch<any>): AxiosPromise => {
    dispatch(setDuringRegistration(true));

    const promise = axios.post(urlBase + '/register', {
      email,
      firstname,
      lastname,
      password,
    });

    promise
      .then((response: AxiosResponse) => {
        console.log(response);

        const responseData = response.data;
        const success = responseData.success;

        dispatch(setDuringRegistration(false));
      })
      .catch((error: AxiosError) => {
        console.log(error);

        dispatch(setDuringRegistration(false));
      });

    return promise;
  };
};

const activateUser = (
  user: IUserRecord,
  activated: boolean,
): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (
    dispatch: redux.Dispatch<any>,
    getState: () => RootState,
  ): AxiosPromise => {
    const promise = getServerApi(getState()).accounts.changeStatus(
      activated,
      user.id,
    );

    promise
      .then((response) => {
        console.log(response);

        const { success, activated } = response.data;

        if (success) {
          dispatch(setUserData(user.set('activated', activated)));
        }
      })
      .catch((error: AxiosError) => {
        console.log(error);
      });

    return promise;
  };
};

const fetchUsers = (): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (
    dispatch: redux.Dispatch<any>,
    getState: () => RootState,
  ): AxiosPromise => {
    dispatch(setUsersDuringFetching(true));

    const promise = getServerApi(getState()).accounts.getAll();

    promise
      .then((response) => {
        console.log(response);

        const users = List(
          response.data.map((userData) => userRecordFactory(userData)),
        );

        dispatch(setUsers(users));
        dispatch(setUsersDuringFetching(false));
      })
      .catch((error: AxiosError) => {
        console.log(error);

        dispatch(setUsersDuringFetching(false));
      });

    return promise;
  };
};

// TO DO: change to fetchProjectsData
const fetchProjects = (): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (dispatch, getState): AxiosPromise => {
    dispatch(setProjectsDuringFetching(true));

    const promise = getServerApi(getState()).project.getAll();

    promise
      .then((response: AxiosResponse) => {
        let projects = List<IProjectRecord>();

        response.data.forEach((project) => {
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
  };
};

const openProject = (
  project: IProjectRecord,
  alvisProject: IAlvisProjectRecord,
): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => void) => {
  return (dispatch, getState): void => {
    dispatch(projectActions.setAlvisProject(alvisProject));
    dispatch(setOpenedProject(project));
  };
};

const closeProject = (
  projectId: number,
): ((dispatch: redux.Dispatch<any>, getState: () => RootState) => void) => {
  return (dispatch, getState): void => {
    const emptyAlvisProject = getValidEmptyAlvisProject();
    dispatch(projectActions.setAlvisProject(emptyAlvisProject));
    dispatch(setOpenedProject(null));
  };
};

const openProjectFromServer = (
  project: IProjectRecord,
): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (dispatch, getState): AxiosPromise => {
    // dispatch(setProjectsDuringFetching(true));

    const promise = getServerApi(getState()).project.get(project.id);

    promise
      .then((response: AxiosResponse) => {
        const { sourcecode } = response.data; // TO DO: better name would be 'code' or 'sources', probably 'code'
        const xmlDocument = mx.mxUtils.parseXml(sourcecode);

        dispatch(openProject(project, parseAlvisProjectXML(xmlDocument)));
        // dispatch(setProjectsDuringFetching(false));
      })
      .catch((error: AxiosError) => {
        console.log(error);

        // dispatch(setProjectsDuringFetching(false));
      });

    return promise;
  };
};

const saveProjectToServer = (): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (dispatch, getState): AxiosPromise => {
    const alvisProject = getState().project.alvisProject;
    const alvisProjectXml = parseAlvisProjectToXml(alvisProject);

    const projectId = getState().app.openedProject.id;
    const promise = getServerApi(getState()).project.save(
      projectId,
      alvisProjectXml,
    );

    promise
      .then((response) => {
        const { success } = response.data;

        console.log('saving project, success:', success); // TO DO: maybe better would be sending some response like 404,
        // which would be then catched as error?
      })
      .catch((error: AxiosError) => {
        console.log(error);
      });

    return promise;
  };
};

const createProjectFromFile = (
  projectName: string,
  sourceCodeFile: File,
): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (dispatch, getState): AxiosPromise => {
    const newProjectData = new FormData();

    newProjectData.append('name', projectName);
    newProjectData.append('alvisProjectFile', sourceCodeFile);

    const promise = getServerApi(getState()).project.fileUpload(
      newProjectData,
      (progressEvent: ProgressEvent) => {
        const percentCompleted = Math.round(
          progressEvent.loaded * 100 / progressEvent.total,
        );
        console.log(percentCompleted);
      },
    );

    promise
      .then((response) => {
        const { id, name, sourcecode } = response.data;
        const xmlDocument = mx.mxUtils.parseXml(sourcecode);
        const project = projectRecordFactory({ id, name });

        dispatch(openProject(project, parseAlvisProjectXML(xmlDocument)));
        dispatch(fetchProjects());

        console.log(response.data);
      })
      .catch((error: AxiosError) => {
        console.log(error);
      });

    return promise;
  };
};

const createProjectFromCurrent = (
  projectName: string,
): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (dispatch, getState): AxiosPromise => {
    const state = getState();
    const project = state.project.alvisProject;
    const projectXml = parseAlvisProjectToXml(project);

    // TODO: display spinner
    const promise = getServerApi(state).project.create(projectName, projectXml);

    promise
      .then((response) => {
        const { projectId, projectName, projectSourceCode } = response.data;
        const xmlDocument = mx.mxUtils.parseXml(projectSourceCode);
        const project = projectRecordFactory({
          id: projectId,
          name: projectName,
        });

        dispatch(openProject(project, parseAlvisProjectXML(xmlDocument)));
        dispatch(fetchProjects());

        console.log(response.data);
      })
      .catch((error: AxiosError) => {
        console.error(error);
      });

    return promise;
  };
};

const createEmptyProject = (
  projectName: string,
): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (dispatch, getState): AxiosPromise => {
    const emptyAlvisProject = getValidEmptyAlvisProject();
    const emptyAlvisProjectXml = parseAlvisProjectToXml(emptyAlvisProject);

    const promise = getServerApi(getState()).project.create(
      projectName,
      emptyAlvisProjectXml,
    );

    promise
      .then((response) => {
        const { projectId, projectName, projectSourceCode } = response.data;
        const xmlDocument = mx.mxUtils.parseXml(projectSourceCode);
        const project = projectRecordFactory({
          id: projectId,
          name: projectName,
        });

        dispatch(openProject(project, parseAlvisProjectXML(xmlDocument)));
        dispatch(fetchProjects());

        console.log(response.data);
      })
      .catch((error: AxiosError) => {
        console.log(error);
      });

    return promise;
  };
};

const deleteProject = (
  projectId: number,
): ((
  dispatch: redux.Dispatch<any>,
  getState: () => RootState,
) => AxiosPromise) => {
  return (dispatch, getState): AxiosPromise => {
    const currentProjectId = getState().app.openedProject.id;
    const promise = getServerApi(getState()).project.delete(projectId);

    promise
      .then((response) => {
        const responseData: { success: boolean } = response.data;
        const { success } = responseData;

        if (success) {
          const allProjects = getState().app.projects;
          const allProjectsWithoutDeleted = allProjects.delete(
            allProjects.findIndex((el) => el.id === projectId),
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
  };
};

export {
  openApp,
  setBearerToken,
  setDuringSigningIn,
  setDuringRegistration,
  signIn,
  signOut,
  register,
  fetchProjects,
  setProjects,
  setProjectsDuringFetching,
  fetchUsers,
  setUsers,
  setUsersDuringFetching,
  activateUser,
  openProjectFromServer,
  saveProjectToServer,
  createProjectFromFile,
  createProjectFromCurrent,
  createEmptyProject,
  deleteProject,
  initializeApp,
};

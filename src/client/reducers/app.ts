import { List } from 'immutable';
import { handleActions, Action } from 'redux-actions';
import * as appActions from '../constants/appActions';

import {
  IAppRecord,
  appRecordFactory,
  IUserRecord,
  IProjectRecord,
} from '../models/app';

const initialState: IAppRecord = appRecordFactory();

export default handleActions<
  IAppRecord,
  | string
  | number
  | boolean
  | IUserRecord
  | List<IUserRecord>
  | List<IProjectRecord>
>(
  {
    [appActions.APP_SET_BEARER_TOKEN]: (
      state: IAppRecord,
      action: Action<string>,
    ) => {
      return state.set('bearerToken', action.payload);
    },
    [appActions.APP_SET_DURING_SIGNINGIN]: (
      state: IAppRecord,
      action: Action<boolean>,
    ) => {
      return state.set('duringSigningIn', action.payload);
    },
    [appActions.APP_SET_DURING_REGISTRATION]: (
      state: IAppRecord,
      action: Action<boolean>,
    ) => {
      return state.set('duringRegistration', action.payload);
    },
    [appActions.APP_OPEN_APP]: (state: IAppRecord, action: Action<boolean>) => {
      return state.set('appOpened', action.payload);
    },
    [appActions.APP_SET_PROJECTS]: (
      state: IAppRecord,
      action: Action<List<IProjectRecord>>,
    ) => {
      return state
        .set('projects', action.payload)
        .set('projectsAlreadyFetched', true);
    },
    [appActions.APP_SET_PROJECTS_DURING_FETCHING]: (
      state: IAppRecord,
      action: Action<boolean>,
    ) => {
      return state.set('projectsDuringFetching', action.payload);
    },
    [appActions.APP_SET_USERS]: (
      state: IAppRecord,
      action: Action<List<IUserRecord>>,
    ) => {
      return state
        .set('users', action.payload)
        .set('usersAlreadyFetched', true);
    },
    [appActions.APP_SET_USER_DATA]: (
      state: IAppRecord,
      action: Action<IUserRecord>,
    ) => {
      return state.update('users', (users: List<IUserRecord>) => {
        return users.update(
          users.findIndex((el) => el.id == action.payload.id),
          () => action.payload,
        );
      });
    },
    [appActions.APP_SET_USERS_DURING_FETCHING]: (
      state: IAppRecord,
      action: Action<boolean>,
    ) => {
      return state.set('usersDuringFetching', action.payload);
    },
    [appActions.APP_SET_OPENED_PROJECT_ID]: (
      state: IAppRecord,
      action: Action<number>,
    ) => {
      return state.set('openedProjectId', action.payload);
    },
  },
  initialState,
);

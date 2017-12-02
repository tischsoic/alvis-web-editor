import { handleActions, Action } from 'redux-actions';
import * as appActions from '../constants/appActions';

import { IAppRecord, appRecordFactory } from '../models/app';

const initialState: IAppRecord = appRecordFactory();

export default handleActions<IAppRecord, string | boolean>({
    [appActions.APP_SET_BEARER_TOKEN]: (state: IAppRecord, action: Action<string>) => {
        return state.set('bearerToken', action.payload);
    },
    [appActions.APP_SET_DURING_SIGNINGIN]: (state: IAppRecord, action: Action<boolean>) => {
        return state.set('duringSigningIn', action.payload);
    },
    [appActions.APP_SET_DURING_REGISTRATION]: (state: IAppRecord, action: Action<boolean>) => {
        return state.set('duringRegistration', action.payload);
    },
    [appActions.APP_OPEN_APP]: (state: IAppRecord, action: Action<boolean>) => {
        return state.set('appOpened', action.payload);
    },
}, initialState)
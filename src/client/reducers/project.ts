import { handleActions, Action } from 'redux-actions';
import * as Actions from '../constants/actions';
import {
    IAlvisProjectRecord,
} from '../models/alvisProject';
import {
    IProjectRecord,
    projectRecordFactory,
} from '../models/project';

const initialState: IProjectRecord = projectRecordFactory({
    xml: null,
    alvisProject: null,
});

export default handleActions<IProjectRecord, string | IAlvisProjectRecord>({
    [Actions.PROJECT_SET_XML]: (state: IProjectRecord, action: Action<string>) => {
        console.log("reducers project:");
        console.log(action.payload)
        return state.set('xml', action.payload);
    },
    [Actions.PROJECT_SET_ALVIS_PROJECT]: (state: IProjectRecord, action: Action<IAlvisProjectRecord>) => {
        console.log("reducers set alvis proj.")
        return state.set('alvisProject', action.payload);
    },
}, initialState)
import { handleActions, Action } from 'redux-actions';
import * as Actions from '../constants/actions';
import {
    IAlvisProjectRecord,
    IAgentRecord,
} from '../models/alvisProject';
import {
    IProjectRecord,
    projectRecordFactory,
} from '../models/project';

import {
    getValidEmptyAlvisProject,
    addAgentToAlvisProject, deleteAgentFromAlvisProject, modifyAgentInAlvisProject,
    getAgentByInaternalId,
} from '../utils/alvisProject';

const initialState: IProjectRecord = projectRecordFactory({
    xml: null,
    alvisProject: getValidEmptyAlvisProject(),
});

export default handleActions<IProjectRecord, string | IAlvisProjectRecord | IAgentRecord>({
    [Actions.PROJECT_SET_XML]: (state: IProjectRecord, action: Action<string>) => {
        console.log("reducers project:");
        console.log(action.payload)
        return state.set('xml', action.payload);
    },
    [Actions.PROJECT_SET_ALVIS_PROJECT]: (state: IProjectRecord, action: Action<IAlvisProjectRecord>) => {
        console.log("reducers set alvis proj.")
        return state.set('alvisProject', action.payload);
    },
    [Actions.PROJECT_ADD_AGENT]: (state: IProjectRecord, action: Action<IAgentRecord>) => {
        console.log("reducers add agent -- alvis proj.")
        return state.set('alvisProject', addAgentToAlvisProject(action.payload, '0', state.alvisProject));
    },
    [Actions.PROJECT_DELETE_AGENT]: (state: IProjectRecord, action: Action<string>) => {
        console.log("reducers delete agent -- alvis proj.")
        const agentToDelete = getAgentByInaternalId(action.payload, state.alvisProject);
        return state.set('alvisProject', deleteAgentFromAlvisProject(agentToDelete, '0', state.alvisProject));
    },
    [Actions.PROJECT_MODIFY_AGENT]: (state: IProjectRecord, action: Action<IAgentRecord>) => {
        console.log("reducers modify agent -- alvis proj.")
        return state.set('alvisProject', modifyAgentInAlvisProject(action.payload, state.alvisProject));
    },
}, initialState)
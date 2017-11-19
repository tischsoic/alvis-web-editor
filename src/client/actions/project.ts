import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Dimension, Dimensions } from '../models';
import * as Actions from '../constants/actions';

import {
    IAgentRecord, IPortRecord, IConnectionRecord,
} from "../models/alvisProject";
import { List } from 'immutable'

const setProjectXML = createAction<string, string>(
    Actions.PROJECT_SET_XML,
    (value: string) => value
);

function createAddElementAction<T extends IAgentRecord | IPortRecord | IConnectionRecord>(actionType: string) {
    return createAction<T, T>(
        actionType,
        (element: T) => element
    );
}

function createDeleteElementAction(actionType) {
    return createAction<string, string>(
        actionType,
        (elementInternalId: string) => elementInternalId
    );
}

function createModifyElementAction<T extends IAgentRecord | IPortRecord | IConnectionRecord>(actionType) {
    return createAction<T, T>(
        actionType,
        (element: T) => element
    );
}

const addAgent = createAddElementAction<IAgentRecord>(Actions.PROJECT_ADD_AGENT);
const deleteAgent = createDeleteElementAction(Actions.PROJECT_DELETE_AGENT);
const modifyAgent = createModifyElementAction<IAgentRecord>(Actions.PROJECT_MODIFY_AGENT);

const addPort = createAddElementAction<IPortRecord>(Actions.PROJECT_ADD_PORT);
const deletePort = createDeleteElementAction(Actions.PROJECT_DELETE_PORT);
const modifyPort = createModifyElementAction<IPortRecord>(Actions.PROJECT_MODIFY_PORT);

const addConnection = createAddElementAction<IConnectionRecord>(Actions.PROJECT_ADD_CONNECTION);
const deleteConnection = createDeleteElementAction(Actions.PROJECT_DELETE_CONNECTION);
const modifyConnection = createModifyElementAction<IConnectionRecord>(Actions.PROJECT_MODIFY_CONNECTION);

const fetchProjectXML = (): ((dispatch: redux.Dispatch<any>) => void) => {
    return (dispatch: redux.Dispatch<any>) => {
        axios.get('http://localhost:3000/server/projects')
            .then((response: AxiosResponse) => {
                console.log(response);
                dispatch(setProjectXML(response.data.projectXML));
            })
            .catch((error: AxiosError) => {
                console.log(error);
            })
    }
}

export {
    setProjectXML,
    addAgent, deleteAgent, modifyAgent,
    addPort, deletePort, modifyPort,
    addConnection, deleteConnection, modifyConnection,
    fetchProjectXML,
};

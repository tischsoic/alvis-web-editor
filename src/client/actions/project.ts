import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as Actions from '../constants/projectActions';
import { urlBase } from '../serverApi';

import {
    IAgentRecord, IPortRecord, IConnectionRecord,
    IAlvisProjectRecord,
    IPageRecord,
} from "../models/alvisProject";
import { List } from 'immutable'

import parseAlvisProjectXML from '../utils/alvisXmlParser';

const setProjectXML = createAction<string, string>(
    Actions.PROJECT_SET_XML,
    (value: string) => value
);

const setAlvisProject = createAction<[IAlvisProjectRecord, number], [IAlvisProjectRecord, number]>(
    Actions.PROJECT_SET_ALVIS_PROJECT,
    (value: [IAlvisProjectRecord, number]) => value
);

function createAddElementAction<T extends IAgentRecord | IPortRecord | IConnectionRecord | IPageRecord>(actionType: string) {
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

function createModifyElementAction<T extends IAgentRecord | IPortRecord | IConnectionRecord | IPageRecord>(actionType) {
    return createAction<T, T>(
        actionType,
        (element: T) => element
    );
}

const addPage = createAddElementAction<IPageRecord>(Actions.PROJECT_ADD_PAGE);
const deletePage = createDeleteElementAction(Actions.PROJECT_DELETE_PAGE);
const modifyPage = createModifyElementAction<IPageRecord>(Actions.PROJECT_MODIFY_PAGE);

const addAgent = createAddElementAction<IAgentRecord>(Actions.PROJECT_ADD_AGENT);
const deleteAgent = createDeleteElementAction(Actions.PROJECT_DELETE_AGENT);
const modifyAgent = createModifyElementAction<IAgentRecord>(Actions.PROJECT_MODIFY_AGENT);

const addPort = createAddElementAction<IPortRecord>(Actions.PROJECT_ADD_PORT);
const deletePort = createDeleteElementAction(Actions.PROJECT_DELETE_PORT);
const modifyPort = createModifyElementAction<IPortRecord>(Actions.PROJECT_MODIFY_PORT);

const addConnection = createAddElementAction<IConnectionRecord>(Actions.PROJECT_ADD_CONNECTION);
const deleteConnection = createDeleteElementAction(Actions.PROJECT_DELETE_CONNECTION);
const modifyConnection = createModifyElementAction<IConnectionRecord>(Actions.PROJECT_MODIFY_CONNECTION);

export {
    setProjectXML,
    addPage, deletePage, modifyPage,
    addAgent, deleteAgent, modifyAgent,
    addPort, deletePort, modifyPort,
    addConnection, deleteConnection, modifyConnection,
    setAlvisProject,
};

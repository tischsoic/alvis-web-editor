import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Dimension, Dimensions } from '../models';
import * as Actions from '../constants/actions';

import {
    IAgentRecord,
} from "../models/alvisProject";
import { List } from 'immutable'

const setProjectXML = createAction<string, string>(
    Actions.PROJECT_SET_XML,
    (value: string) => value
);

const addAgent = createAction<IAgentRecord, IAgentRecord>(
    Actions.PROJECT_ADD_AGENT,
    (agent: IAgentRecord) => agent,
)

const deleteAgent = createAction<string, string>(
    Actions.PROJECT_DELETE_AGENT,
    (agentInternalId: string) => agentInternalId,
)

const modifyAgent = createAction<IAgentRecord, IAgentRecord>(
    Actions.PROJECT_MODIFY_AGENT,
    (agent: IAgentRecord) => agent,
)

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
    fetchProjectXML,
};

import { handleActions, Action } from 'redux-actions';
import * as Actions from '../constants/projectActions';
import {
  IAlvisProjectRecord,
  IAgentRecord,
  IAgent,
  IPortRecord,
  IConnectionRecord,
  IPageRecord,
} from '../models/alvisProject';
import { IProjectRecord, projectRecordFactory } from '../models/project';

import * as apManager from '../utils/alvisProject';
import { getValidEmptyAlvisProject } from '../utils/alvisProject';

const initialState: IProjectRecord = projectRecordFactory({
  xml: null,
  alvisProject: getValidEmptyAlvisProject(),
  lastInternalId: 0,
});

function addElementToState<
  T extends IAgentRecord | IPortRecord | IConnectionRecord | IPageRecord
>(
  state: IProjectRecord,
  elementRecord: T,
  fnToModifyAlvisProjectRecord: (
    p: IAlvisProjectRecord,
  ) => (el: T) => IAlvisProjectRecord,
) {
  const newElementInternalId = state.lastInternalId + 1,
    elementToAdd: T = <T>elementRecord.set('internalId', newElementInternalId), // TO DO: Check why without casting it does not work?
    stateAfterLastInternalIdUpdated = state.set(
      'lastInternalId',
      newElementInternalId,
    ),
    stateAfterElementAdded = stateAfterLastInternalIdUpdated.set(
      'alvisProject',
      fnToModifyAlvisProjectRecord(
        stateAfterLastInternalIdUpdated.alvisProject,
      )(elementToAdd),
    );

  return stateAfterElementAdded;
}

export default handleActions<
  IProjectRecord,
  | string
  | [IAlvisProjectRecord, number]
  | IAgentRecord
  | IPortRecord
  | IConnectionRecord
  | IPageRecord
>(
  {
    [Actions.PROJECT_SET_XML]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      console.log('reducers project:');
      console.log(action.payload);
      return state.set('xml', action.payload);
    },
    [Actions.PROJECT_SET_ALVIS_PROJECT]: (
      state: IProjectRecord,
      action: Action<[IAlvisProjectRecord, number]>,
    ) => {
      const afterProjectSet = state.set('alvisProject', action.payload[0]),
        afterlastInternalIdSet = afterProjectSet.set(
          'lastInternalId',
          action.payload[1],
        );

      return afterlastInternalIdSet;
    },
    [Actions.PROJECT_ADD_PAGE]: (
      state: IProjectRecord,
      action: Action<IPageRecord>,
    ) => {
      return addElementToState(
        state,
        action.payload,
        apManager.addPageToAlvisProject,
      );
    },
    [Actions.PROJECT_DELETE_PAGE]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.deletePageInAlvisProject(state.alvisProject)(action.payload),
      );
    },
    [Actions.PROJECT_MODIFY_PAGE]: (
      state: IProjectRecord,
      action: Action<IPageRecord>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.modifyPageInAlvisProject(state.alvisProject)(action.payload),
      );
    },
    [Actions.PROJECT_ADD_AGENT]: (
      state: IProjectRecord,
      action: Action<IAgentRecord>,
    ) => {
      return addElementToState(
        state,
        action.payload,
        apManager.addAgentToAlvisProject,
      );
    },
    [Actions.PROJECT_DELETE_AGENT]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.deleteAgentInAlvisProject(state.alvisProject)(action.payload),
      );
    },
    [Actions.PROJECT_MODIFY_AGENT]: (
      state: IProjectRecord,
      action: Action<IAgentRecord>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.modifyAgentInAlvisProject(state.alvisProject)(action.payload),
      );
    },
    [Actions.PROJECT_ADD_PORT]: (
      state: IProjectRecord,
      action: Action<IPortRecord>,
    ) => {
      return addElementToState(
        state,
        action.payload,
        apManager.addPortToAlvisProject,
      );
    },
    [Actions.PROJECT_DELETE_PORT]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.deletePortInAlvisProject(state.alvisProject)(action.payload),
      );
    },
    [Actions.PROJECT_MODIFY_PORT]: (
      state: IProjectRecord,
      action: Action<IPortRecord>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.modifyPortInAlvisProject(state.alvisProject)(action.payload),
      );
    },
    [Actions.PROJECT_ADD_CONNECTION]: (
      state: IProjectRecord,
      action: Action<IConnectionRecord>,
    ) => {
      return addElementToState(
        state,
        action.payload,
        apManager.addConnectionToAlvisProject,
      );
    },
    [Actions.PROJECT_DELETE_CONNECTION]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.deleteConnectionInAlvisProject(state.alvisProject)(
          action.payload,
        ),
      );
    },
    [Actions.PROJECT_MODIFY_CONNECTION]: (
      state: IProjectRecord,
      action: Action<IConnectionRecord>,
    ) => {
      return state.set(
        'alvisProject',
        apManager.modifyConnectionInAlvisProject(state.alvisProject)(
          action.payload,
        ),
      );
    },
  },
  initialState,
);

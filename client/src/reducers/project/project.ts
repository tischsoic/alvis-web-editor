import { handleActions, Action } from 'redux-actions';
import * as Actions from '../../constants/projectActions';
import {
  IAlvisProjectRecord,
  IAgentRecord,
  IAgent,
  IPortRecord,
  IConnectionRecord,
  IPageRecord,
  IIdentifiableElement,
  IInternalRecord,
} from '../../models/alvisProject';
import {
  IProjectRecord,
  projectRecordFactory,
  IProjectModification,
  IOppositeModificationsRecord,
  IProjectModificationRecord,
  oppositeModificationsFactory,
} from '../../models/project';

import alvisProject, * as apManager from '../../utils/alvisProject';
import { List } from 'immutable';

/**
 * semiModification - modification incomplete e.g. if modification deletes agent with port
 *   modification with deletion of only agent would be semi,
 *   where modifications with deletion of agent and port would be fullModification
 * fullModification - (see semiModification definition above)
 */
// TO DO: remark: fullModification is modifications with all deletions - additions and modifications stay the same -> maybe change name to something else?

export const initialState: IProjectRecord = projectRecordFactory({
  xml: null,
  alvisProject: apManager.getValidEmptyAlvisProject(),
  oppositeModifications: List<IOppositeModificationsRecord>(),
  oppositeModificationCurrentIdx: 0,
});

export default handleActions<
  IProjectRecord,
  // void | string | [IAlvisProjectRecord, number] | IProjectModification
  string | IAlvisProjectRecord | IProjectModificationRecord | void
>(
  {
    [Actions.MODIFY_PROJECT]: (
      state: IProjectRecord,
      action: Action<IProjectModificationRecord>,
    ) => {
      const modification = action.payload;
      const project = state;
      const alvisProject = project.alvisProject;
      const fullModification = apManager.generateFullModification(
        modification,
        alvisProject,
      );
      const antiModification = apManager.generateAntiModification(
        modification,
        alvisProject,
      );

      const modifiedAlvisProject = apManager.applyModification(
        project.alvisProject,
      )(fullModification);
      const afterDo = apManager.addOppositeModifications(project)(
        oppositeModificationsFactory({
          antiModification,
          modification: fullModification,
        }),
      );

      return afterDo.set('alvisProject', modifiedAlvisProject);
    },
    [Actions.PROJECT_UNDO]: (state: IProjectRecord) => {
      const [project, oppositeModifications] = apManager.shiftAntiModifications(
        state,
        true,
      );

      if (!oppositeModifications) {
        return state;
      }

      const modifiedAlvisProject = apManager.applyModification(
        state.alvisProject,
      )(oppositeModifications.antiModification);

      return project.set('alvisProject', modifiedAlvisProject);
    },
    [Actions.PROJECT_REDO]: (state: IProjectRecord) => {
      const [project, oppositeModifications] = apManager.shiftAntiModifications(
        state,
        false,
      );

      if (!oppositeModifications) {
        return state;
      }

      const modifiedAlvisProject = apManager.applyModification(
        state.alvisProject,
      )(oppositeModifications.modification);

      return project.set('alvisProject', modifiedAlvisProject);
    },

    [Actions.PROJECT_SET_XML]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      return state.set('xml', action.payload);
    },
    [Actions.PROJECT_SET_ALVIS_PROJECT]: (
      state: IProjectRecord,
      action: Action<IAlvisProjectRecord>,
    ) => {
      return state.merge({
        alvisProject: action.payload,
      });
    },
    // [Actions.PROJECT_ADD_PAGE]: (
    //   state: IProjectRecord,
    //   action: Action<IPageRecord>,
    // ) => {
    //   return addElementToState(
    //     state,
    //     action.payload,
    //     apManager.addPageToAlvisProject,
    //   );
    // },
    // [Actions.PROJECT_DELETE_PAGE]: (
    //   state: IProjectRecord,
    //   action: Action<string>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.deletePageInAlvisProject(state.alvisProject)(action.payload),
    //   );
    // },
    // [Actions.PROJECT_MODIFY_PAGE]: (
    //   state: IProjectRecord,
    //   action: Action<IPageRecord>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.modifyPageInAlvisProject(state.alvisProject)(action.payload),
    //   );
    // },
    // [Actions.PROJECT_ADD_AGENT]: (
    //   state: IProjectRecord,
    //   action: Action<IAgentRecord>,
    // ) => {
    //   return addElementToState(
    //     state,
    //     action.payload,
    //     apManager.addAgentToAlvisProject,
    //   );
    // },
    // [Actions.PROJECT_DELETE_AGENT]: (
    //   state: IProjectRecord,
    //   action: Action<string>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.deleteAgentInAlvisProject(state.alvisProject)(action.payload),
    //   );
    // },
    // [Actions.PROJECT_MODIFY_AGENT]: (
    //   state: IProjectRecord,
    //   action: Action<IAgentRecord>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.modifyAgentInAlvisProject(state.alvisProject)(action.payload),
    //   );
    // },
    // [Actions.PROJECT_ADD_PORT]: (
    //   state: IProjectRecord,
    //   action: Action<IPortRecord>,
    // ) => {
    //   return addElementToState(
    //     state,
    //     action.payload,
    //     apManager.addPortToAlvisProject,
    //   );
    // },
    // [Actions.PROJECT_DELETE_PORT]: (
    //   state: IProjectRecord,
    //   action: Action<string>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.deletePortInAlvisProject(state.alvisProject)(action.payload),
    //   );
    // },
    // [Actions.PROJECT_MODIFY_PORT]: (
    //   state: IProjectRecord,
    //   action: Action<IPortRecord>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.modifyPortInAlvisProject(state.alvisProject)(action.payload),
    //   );
    // },
    // [Actions.PROJECT_ADD_CONNECTION]: (
    //   state: IProjectRecord,
    //   action: Action<IConnectionRecord>,
    // ) => {
    //   return addElementToState(
    //     state,
    //     action.payload,
    //     apManager.addConnectionToAlvisProject,
    //   );
    // },
    // [Actions.PROJECT_DELETE_CONNECTION]: (
    //   state: IProjectRecord,
    //   action: Action<string>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.deleteConnectionInAlvisProject(state.alvisProject)(
    //       action.payload,
    //     ),
    //   );
    // },
    // [Actions.PROJECT_MODIFY_CONNECTION]: (
    //   state: IProjectRecord,
    //   action: Action<IConnectionRecord>,
    // ) => {
    //   return state.set(
    //     'alvisProject',
    //     apManager.modifyConnectionInAlvisProject(state.alvisProject)(
    //       action.payload,
    //     ),
    //   );
    // },
  },
  initialState,
);

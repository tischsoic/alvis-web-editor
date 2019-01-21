import { handleActions, Action } from 'redux-actions';
import * as Actions from '../../constants/projectActions';
import { IAlvisProjectRecord } from '../../models/alvisProject';
import {
  IProjectRecord,
  projectRecordFactory,
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
  string | string[] | IAlvisProjectRecord | IProjectModificationRecord | void
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
    [Actions.PROJECT_COPY]: (
      state: IProjectRecord,
      action: Action<string[]>,
    ) => {
      const elementsIds = action.payload;
      const copyModification = apManager.getCopyModification(
        elementsIds,
        state.alvisProject,
      );

      return state.setIn(['copyModification'], copyModification);
    },
    [Actions.PROJECT_CUT]: (
      state: IProjectRecord,
      action: Action<string[]>,
    ) => {
      const alvisProject = state.alvisProject;
      const elementsIds = action.payload;
      const copyModification = apManager.getCopyModification(
        elementsIds,
        state.alvisProject,
      );
      const cutModification = apManager.generateAntiModification(
        copyModification,
        state.alvisProject,
      );

      const fullCutModification = apManager.generateFullModification(
        cutModification,
        alvisProject,
      );
      const antiCutModification = apManager.generateAntiModification(
        cutModification,
        alvisProject,
      );

      const modifiedAlvisProject = apManager.applyModification(alvisProject)(
        fullCutModification,
      );
      const afterDo = apManager.addOppositeModifications(state)(
        oppositeModificationsFactory({
          antiModification: antiCutModification,
          modification: fullCutModification,
        }),
      );

      return afterDo
        .setIn(['alvisProject'], modifiedAlvisProject)
        .setIn(['copyModification'], copyModification);
    },
    [Actions.PROJECT_PASTE]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      const alvisProject = state.alvisProject;
      const copyModification = state.copyModification;

      const { setParentPage, changeIds, shiftAgentsBy } = apManager;
      const parentPageId = action.payload;
      const pasteModification = shiftAgentsBy(
        changeIds(setParentPage(copyModification, parentPageId)),
        20,
      );

      const fullPasteModification = apManager.generateFullModification(
        pasteModification,
        alvisProject,
      );
      const antiPasteModification = apManager.generateAntiModification(
        pasteModification,
        alvisProject,
      );

      const modifiedAlvisProject = apManager.applyModification(alvisProject)(
        fullPasteModification,
      );
      const afterDo = apManager.addOppositeModifications(state)(
        oppositeModificationsFactory({
          antiModification: antiPasteModification,
          modification: fullPasteModification,
        }),
      );

      return afterDo
        .setIn(['alvisProject'], modifiedAlvisProject)
        .setIn(['copyModification'], copyModification);
    },
    [Actions.PROJECT_REMOVE_HIERARCHY]: (
      state: IProjectRecord,
      action: Action<string>,
    ) => {
      const alvisProject = state.alvisProject;
      const agentId = action.payload;
      const removeHierarchyModification = apManager.getRemoveHierarchyModification(
        agentId,
        alvisProject,
      );

      const modification = removeHierarchyModification;
      const project = state;
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
  },
  initialState,
);

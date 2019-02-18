import { createAction } from 'redux-actions';

import * as Actions from '../../constants/projectActions';
import { IAlvisProjectRecord } from '../../models/alvisProject';

import {
  projectModificationRecordFactoryPartial,
  IProjectModificationRecord,
  IPartialModification,
} from '../../models/project';

const setProjectXML = createAction<string, string>(
  Actions.PROJECT_SET_XML,
  (value: string) => value,
);

const setAlvisProject = createAction<IAlvisProjectRecord, IAlvisProjectRecord>(
  Actions.PROJECT_SET_ALVIS_PROJECT,
  (value: IAlvisProjectRecord) => value,
);

const applyModification = createAction<
  IPartialModification,
  IProjectModificationRecord
>(Actions.MODIFY_PROJECT, (partialModification: IPartialModification) =>
  projectModificationRecordFactoryPartial(partialModification),
);

const undo = createAction(Actions.PROJECT_UNDO);
const redo = createAction(Actions.PROJECT_REDO);

const copy = createAction<string[], string[]>(
  Actions.PROJECT_COPY,
  (elementsIds) => elementsIds,
);
const cut = createAction<string[], string[]>(
  Actions.PROJECT_CUT,
  (elementsIds) => elementsIds,
);
const paste = createAction<string, string>(
  Actions.PROJECT_PASTE,
  (pageId) => pageId,
);

const removeHierarchy = createAction<string, string>(
  Actions.PROJECT_REMOVE_HIERARCHY,
  (agentId) => agentId,
);

export {
  setProjectXML,
  applyModification,
  setAlvisProject,
  undo,
  redo,
  copy,
  cut,
  paste,
  removeHierarchy,
};

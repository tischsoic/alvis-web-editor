import * as redux from 'redux';
import { createAction, Action } from 'redux-actions';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as Actions from '../../constants/projectActions';
import { urlBase } from '../../serverApi';

import {
  IAlvisProjectRecord,
  IAlvisElement,
  IAgent,
  IPort,
  IConnection,
  IPage,
} from '../../models/alvisProject';
import { List } from 'immutable';

import parseAlvisProjectXML from '../../utils/alvisXmlParser';
import {
  projectModificationRecordFactoryPartial,
  IProjectModification,
  IProjectElementModification,
} from '../../models/project';

const setProjectXML = createAction<string, string>(
  Actions.PROJECT_SET_XML,
  (value: string) => value,
);

const setAlvisProject = createAction<
  [IAlvisProjectRecord, number],
  [IAlvisProjectRecord, number]
>(
  Actions.PROJECT_SET_ALVIS_PROJECT,
  (value: [IAlvisProjectRecord, number]) => value,
);

function createElementAction<T extends IAlvisElement>(
  modification: keyof IProjectElementModification<T> & ('added' | 'modified'), // TO DO: check other places where it can be used (?)
  elementsType: keyof IProjectModification, // TO DO: change it to IAlvisElementTag?
) {
  return createAction<IProjectModification, T>(
    Actions.MODIFY_PROJECT,
    (element: T) =>
      projectModificationRecordFactoryPartial({
        [elementsType]: {
          [modification]: List([element]),
        },
      }),
  );
}

// TO DO: Enable delete by Record not only by id.
function createElementDeleteAction(elementsType: keyof IProjectModification) {
  return createAction<IProjectModification, string>(
    Actions.MODIFY_PROJECT,
    (elementInternalId: string) =>
      projectModificationRecordFactoryPartial({
        [elementsType]: {
          deleted: List(elementInternalId),
        },
      }),
  );
}

const addPage = createElementAction<IPage>('added', 'pages');
const modifyPage = createElementAction<IPage>('modified', 'pages');
const deletePage = createElementDeleteAction('pages');

const addAgent = createElementAction<IAgent>('added', 'agents');
const modifyAgent = createElementAction<IAgent>('modified', 'agents');
const deleteAgent = createElementDeleteAction('agents');

const addPort = createElementAction<IPort>('added', 'ports');
const modifyPort = createElementAction<IPort>('modified', 'ports');
const deletePort = createElementDeleteAction('ports');

const addConnection = createElementAction<IConnection>('added', 'connections');
const modifyConnection = createElementAction<IConnection>(
  'modified',
  'connections',
);
const deleteConnection = createElementDeleteAction('connections');

const undo = createAction(Actions.PROJECT_UNDO);
const redo = createAction(Actions.PROJECT_REDO);

export {
  setProjectXML,
  addPage,
  deletePage,
  modifyPage,
  addAgent,
  deleteAgent,
  modifyAgent,
  addPort,
  deletePort,
  modifyPort,
  addConnection,
  deleteConnection,
  modifyConnection,
  setAlvisProject,
  undo,
  redo,
};

import {
  addPage,
  modifyPage,
  deletePage,
  addAgent,
  addPort,
  addConnection,
  modifyAgent,
  deleteAgent,
  modifyPort,
  deletePort,
  modifyConnection,
  deleteConnection,
} from './project';
import {
  pageRecordFactory,
  IAlvisElement,
  IAlvisElementRecord,
  agentRecordFactory,
  portRecordFactory,
  connectionRecordFactory,
} from '../../models/alvisProject';
import {
  projectModificationRecordFactory,
  projectModificationRecordFactoryPartial,
  IProjectModification,
} from '../../models/project';
import { List } from 'immutable';
import { MODIFY_PROJECT } from '../../constants/projectActions';
import { Action } from 'redux-actions';

describe('Project actions', () => {
  it('creates action adding, modifying and deleting elements to/in/from project', () => {
    type addOrModifyElementFnCreatingAction = (
      r: IAlvisElement,
    ) => Action<IProjectModification>;
    const functionsParameters: [
      string,
      (el?: IAlvisElement) => IAlvisElement,
      addOrModifyElementFnCreatingAction,
      addOrModifyElementFnCreatingAction,
      (i: string) => Action<IProjectModification>
    ][] = [
      ['pages', pageRecordFactory, addPage, modifyPage, deletePage],
      ['agents', agentRecordFactory, addAgent, modifyAgent, deleteAgent],
      ['ports', portRecordFactory, addPort, modifyPort, deletePort],
      [
        'connections',
        connectionRecordFactory,
        addConnection,
        modifyConnection,
        deleteConnection,
      ],
    ];
    for (const fnParams of functionsParameters) {
      const elementsName = fnParams[0];
      const elementToAddOrModifyRecord = fnParams[1]();
      const elementToDeleteInternalId = '1';
      const addingElementAction = fnParams[2](elementToAddOrModifyRecord);
      const modifyingElementAction = fnParams[3](elementToAddOrModifyRecord);
      const deletingElementAction = fnParams[4](elementToDeleteInternalId);

      expect(addingElementAction).toEqual({
        type: MODIFY_PROJECT,
        payload: projectModificationRecordFactoryPartial({
          [elementsName]: {
            added: List([elementToAddOrModifyRecord]),
          },
        }),
      });

      expect(modifyingElementAction).toEqual({
        type: MODIFY_PROJECT,
        payload: projectModificationRecordFactoryPartial({
          [elementsName]: {
            modified: List([elementToAddOrModifyRecord]),
          },
        }),
      });

      expect(deletingElementAction).toEqual({
        type: MODIFY_PROJECT,
        payload: projectModificationRecordFactoryPartial({
          [elementsName]: {
            deleted: List([elementToDeleteInternalId]),
          },
        }),
      });
    }
  });
});

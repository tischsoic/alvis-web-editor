import project, { initialState } from './project';
import {
  projectRecordFactory,
  IProjectModification,
  projectModificationRecordFactoryPartial,
  IProjectRecord,
  IOppositeModifications,
  oppositeModificationsFactory,
  IProjectModificationRecord,
  PartialPartial,
} from '../../models/project';
import {
  alvisProjectRecordFactory,
  IPageRecord,
  pageRecordFactory,
  IAgentRecord,
  IPortRecord,
  IConnectionRecord,
  alvisCodeRecordFactory,
  agentRecordFactory,
  portRecordFactory,
  connectionRecordFactory,
  IAgent,
  IPort,
  IConnection,
  IPage,
  IIdentifiableElement,
  IAlvisElement,
  IAlvisProject,
  IAlvisProjectRecord,
  IInternalRecord,
} from '../../models/alvisProject';
import * as projectActions from '../../constants/projectActions';
import { List, Set } from 'immutable';
import { createAction } from 'redux-actions';
import {
  getBasicAgentRecordForTests,
  getBasicPortRecordForTests,
  getBasicConnectionRecordForTest,
} from '../../utils/test/recordsGenerators';
import {
  getRecordByInternalId,
  AlvisProjectKeysLeadingToLists,
} from '../../utils/alvisProject';
import { newUuid } from '../../utils/uuidGenerator';

function createProjectModificationAction(
  modification: PartialPartial<IProjectModification>,
) {
  return createAction(
    projectActions.MODIFY_PROJECT,
    (): IProjectModificationRecord => {
      return projectModificationRecordFactoryPartial(modification);
    },
  )();
}

const ad1 = {
  pages: [{ internalId: 'System', agents: 'System_A' }],
  agents: [{ internalId: 'System_A', ports: 'System_A_p1' }],
  ports: [{ internalId: 'System_A_p1', name: 'System_A_p1' }],
  connections: [],
};

/**
 * Tests Alvis project reducer
 */
describe('Project reducer', () => {
  let state = initialState;

  // We want to have IDs in form of: PageName_AgentName_portName
  state = state.setIn(['alvisProject', 'pages', 0, 'internalId'], 'System');
  const initialStateModel = {
    pages: [{ internalId: 'System' }],
  };

  expect(state).toMatchModel(initialStateModel);

  it('Adds SystemPage_A agent to System page', () => {
    const agent = getBasicAgentRecordForTests('A', '0', null, 'System_A');
    const action = createProjectModificationAction({
      agents: {
        added: List([agent]),
      },
    });
    const stateModel = {
      pages: [{ internalId: 'System', agentsInternalIds: ['System_A'] }],
      agents: [{ internalId: 'System_A' }],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  // TODO:  test copy paste ???
});

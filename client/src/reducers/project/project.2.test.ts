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
  getElementById,
  AlvisProjectKeysLeadingToElements,
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

function createUndoAction() {
  return createAction(projectActions.PROJECT_UNDO)();
}

function createRedoAction() {
  return createAction(projectActions.PROJECT_REDO)();
}

// TODO: add test with deleting unexisting elements of Alvis diagram
/**
 * Tests Alvis project reducer
 */
describe('Project reducer', () => {
  let state = initialState;

  // We want to have IDs in form of: PageName_AgentName_portName
  const rootPage = state.alvisProject.pages
    .get('0')
    .set('internalId', 'System');
  state = state
    .setIn(['alvisProject', 'pages', 'System'], rootPage)
    .deleteIn(['alvisProject', 'pages', '0']);
  // TODO: TODO: Good idea would be to create state based on model and then compare them
  // + it would be easier to check if states match
  // + it would remove test dependency - currently later test depends on changes form previous test
  const initialStateModel = {
    pages: [{ internalId: 'System' }],
  };

  expect(state).toMatchModel(initialStateModel);

  it('Adds agent to non-existing page', () => {
    // TODO: make test with adding agent with wrong page ID - it should not be added
    const agent = getBasicAgentRecordForTests('A', '0', null, 'System_A');
    const action = createProjectModificationAction({
      agents: {
        added: List([agent]),
      },
    });
    // Agent should not be added
    const stateModel = {
      pages: [{ internalId: 'System' }],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Adds System_A agent to the System page', () => {
    const agent = getBasicAgentRecordForTests('A', 'System', null, 'System_A');
    const action = createProjectModificationAction({
      agents: {
        added: List([agent]),
      },
    });
    const stateModel = {
      pages: [{ internalId: 'System', agentsInternalIds: ['System_A'] }],
      agents: [{ internalId: 'System_A', pageInternalId: 'System' }],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Adds System_B agent to the System page', () => {
    const agent = getBasicAgentRecordForTests('B', 'System', null, 'System_B');
    const action = createProjectModificationAction({
      agents: {
        added: List([agent]),
      },
    });
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'] },
      ],
      agents: [{ internalId: 'System_A' }, { internalId: 'System_B' }],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Adds System_A_p1 port to the System_A agent', () => {
    const port = getBasicPortRecordForTests('System_A_p1', 'System_A', 'p1');
    const action = createProjectModificationAction({
      ports: {
        added: List([port]),
      },
    });
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'] },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'] },
        { internalId: 'System_B' },
      ],
      ports: [{ internalId: 'System_A_p1' }],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Adds System_B_p1 port to the System_B agent', () => {
    const port = getBasicPortRecordForTests('System_B_p1', 'System_B', 'p1');
    const action = createProjectModificationAction({
      ports: {
        added: List([port]),
      },
    });
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'] },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'] },
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'] },
      ],
      ports: [{ internalId: 'System_A_p1' }, { internalId: 'System_B_p1' }],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Adds System_connection1 connection between System_A_p1 and System_B_p1', () => {
    const connection = getBasicConnectionRecordForTest(
      'System_connection1',
      'System_A_p1',
      'System_B_p1',
    );
    const action = createProjectModificationAction({
      connections: {
        added: List([connection]),
      },
    });
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'] },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'] },
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'] },
      ],
      ports: [
        { internalId: 'System_A_p1', name: 'p1' },
        { internalId: 'System_B_p1' },
      ],
      connections: [
        {
          internalId: 'System_connection1',
          sourcePortInternalId: 'System_A_p1',
          targetPortInternalId: 'System_B_p1',
        },
      ],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Adds SubpageA to the agent A', () => {
    const page = pageRecordFactory({
      internalId: 'SubpageA',
      supAgentInternalId: 'System_A',
      name: 'SubpageA',
    });
    const action = createProjectModificationAction({
      pages: {
        added: List([page]),
      },
    });
    // prettier-ignore
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'], subPagesInternalIds: ['SubpageA'] },
        { internalId: 'SubpageA', agentsInternalIds: [], supAgentInternalId: 'System_A' },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'], subPageInternalId: 'SubpageA' },
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'] },
      ],
      ports: [
        { internalId: 'System_A_p1', name: 'p1' },
        { internalId: 'System_B_p1' },
      ],
      connections: [
        {
          internalId: 'System_connection1',
          sourcePortInternalId: 'System_A_p1',
          targetPortInternalId: 'System_B_p1',
        },
      ],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  // it('tries to remove non-existing page', () => {
  //   // nothing should happen
  // })

  it('removes agent A', () => {
    const action = createProjectModificationAction({
      agents: {
        deleted: List(['System_A']),
      },
    });
    // prettier-ignore
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_B'], subPagesInternalIds: [] },
      ],
      agents: [
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'] },
      ],
      ports: [
        { internalId: 'System_B_p1' },
      ],
      connections: [],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Undoes removal of agent A', () => {
    const action = createUndoAction();
    // prettier-ignore
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'], subPagesInternalIds: ['SubpageA'] },
        { internalId: 'SubpageA', agentsInternalIds: [], supAgentInternalId: 'System_A' },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'], subPageInternalId: 'SubpageA' },
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'] },
      ],
      ports: [
        { internalId: 'System_A_p1', name: 'p1' },
        { internalId: 'System_B_p1' },
      ],
      connections: [
        {
          internalId: 'System_connection1',
          sourcePortInternalId: 'System_A_p1',
          targetPortInternalId: 'System_B_p1',
        },
      ],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Adds agent SubpageA_C and page SubpageC', () => {
    const agent = getBasicAgentRecordForTests(
      'C',
      'SubpageA',
      null,
      'SubpageA_C',
    );
    const page = pageRecordFactory({
      internalId: 'SubpageC',
      supAgentInternalId: 'SubpageA_C',
      name: 'SubpageC',
    });
    const action = createProjectModificationAction({
      agents: {
        added: List([agent]),
      },
      pages: {
        added: List([page]),
      },
    });
    // prettier-ignore
    const stateModel = {
      pages: [ // TODO: on second thought, wouldn't it be better to make models Immutable.JS records with type Record<any> and modify them from test to test? 
                // correcting every model in case of mistake...
                // ...but it would be harder to read and analyze. :/
                // we may also store basic elements data in records and every time set such data as agentsInterlaIds, subPageInternaId etc.
                // we wouldn't have to repeat everything
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'], subPagesInternalIds: ['SubpageA'] },
        { internalId: 'SubpageA', agentsInternalIds: ['SubpageA_C'], subPagesInternalIds: ['SubpageC'], supAgentInternalId: 'System_A' },
        { internalId: 'SubpageC', agentsInternalIds: [], subPagesInternalIds: [], supAgentInternalId: 'SubpageA_C' },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'], subPageInternalId: 'SubpageA' },
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'], subPageInternalId: null },
        { internalId: 'SubpageA_C', portsInternalIds: [], subPageInternalId: 'SubpageC' },
      ],
      ports: [
        { internalId: 'System_A_p1', name: 'p1' },
        { internalId: 'System_B_p1' },
      ],
      connections: [
        {
          internalId: 'System_connection1',
          sourcePortInternalId: 'System_A_p1',
          targetPortInternalId: 'System_B_p1',
        },
      ],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('removes agent A - once again', () => {
    const action = createProjectModificationAction({
      agents: {
        deleted: List(['System_A']),
      },
    });
    // prettier-ignore
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_B'], subPagesInternalIds: [] },
      ],
      agents: [
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'] },
      ],
      ports: [
        { internalId: 'System_B_p1' },
      ],
      connections: [],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Undoes removal of agent A - once again', () => {
    const action = createUndoAction();
    // prettier-ignore
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'], subPagesInternalIds: ['SubpageA'] },
        { internalId: 'SubpageA', agentsInternalIds: ['SubpageA_C'], subPagesInternalIds: ['SubpageC'], supAgentInternalId: 'System_A' },
        { internalId: 'SubpageC', agentsInternalIds: [], subPagesInternalIds: [], supAgentInternalId: 'SubpageA_C' },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'], subPageInternalId: 'SubpageA' },
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'], subPageInternalId: null },
        { internalId: 'SubpageA_C', portsInternalIds: [], subPageInternalId: 'SubpageC' },
      ],
      ports: [
        { internalId: 'System_A_p1', name: 'p1' },
        { internalId: 'System_B_p1' },
      ],
      connections: [
        {
          internalId: 'System_connection1',
          sourcePortInternalId: 'System_A_p1',
          targetPortInternalId: 'System_B_p1',
        },
      ],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Removes port `System_B_p1`', () => {
    const action = createProjectModificationAction({
      ports: {
        deleted: List(['System_B_p1']),
      },
    });
    // prettier-ignore
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'], subPagesInternalIds: ['SubpageA'] },
        { internalId: 'SubpageA', agentsInternalIds: ['SubpageA_C'], subPagesInternalIds: ['SubpageC'], supAgentInternalId: 'System_A' },
        { internalId: 'SubpageC', agentsInternalIds: [], subPagesInternalIds: [], supAgentInternalId: 'SubpageA_C' },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'], subPageInternalId: 'SubpageA' },
        { internalId: 'System_B', portsInternalIds: [], subPageInternalId: null },
        { internalId: 'SubpageA_C', portsInternalIds: [], subPageInternalId: 'SubpageC' },
      ],
      ports: [
        { internalId: 'System_A_p1', name: 'p1' },
      ],
      connections: [],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  it('Undoes removal of port `System_B_p1`', () => {
    const action = createUndoAction();
    // prettier-ignore
    const stateModel = {
      pages: [
        { internalId: 'System', agentsInternalIds: ['System_A', 'System_B'], subPagesInternalIds: ['SubpageA'] },
        { internalId: 'SubpageA', agentsInternalIds: ['SubpageA_C'], subPagesInternalIds: ['SubpageC'], supAgentInternalId: 'System_A' },
        { internalId: 'SubpageC', agentsInternalIds: [], subPagesInternalIds: [], supAgentInternalId: 'SubpageA_C' },
      ],
      agents: [
        { internalId: 'System_A', portsInternalIds: ['System_A_p1'], subPageInternalId: 'SubpageA' },
        { internalId: 'System_B', portsInternalIds: ['System_B_p1'], subPageInternalId: null },
        { internalId: 'SubpageA_C', portsInternalIds: [], subPageInternalId: 'SubpageC' },
      ],
      ports: [
        { internalId: 'System_A_p1', name: 'p1' },
        { internalId: 'System_B_p1' },
      ],
      connections: [
        {
          internalId: 'System_connection1',
          sourcePortInternalId: 'System_A_p1',
          targetPortInternalId: 'System_B_p1',
        },
      ],
    };

    state = project(state, action);

    expect(state).toMatchModel(stateModel);
  });

  // TODO:  test copy paste ???
});

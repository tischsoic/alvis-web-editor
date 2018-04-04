import project, { initialState } from './project';
import {
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
} from '../../actions/project/project';
import {
  projectRecordFactory,
  IProjectModification,
  projectModificationRecordFactoryPartial,
  IProjectRecord,
  IOppositeModifications,
  oppositeModificationsFactory,
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
  IInternalRecord,
  IAlvisElement,
} from '../../models/alvisProject';
import * as projectActions from '../../constants/projectActions';
import { List } from 'immutable';
import { createAction } from 'redux-actions';

const getRecordByInternalId = <T extends IInternalRecord>(
  list: List<T>,
  internalId: string,
): T => list.find((el) => el.internalId === internalId);

function getBasicAgentRecordForTests(
  name: string,
  pageInternalId: string,
  subPageInternalId: string = null,
  internalId: string = null,
  portsInternalIds: List<string> = List(),
): IAgentRecord {
  return agentRecordFactory({
    internalId,
    pageInternalId,
    subPageInternalId,
    name,
    portsInternalIds,
    index: null,
    active: null,
    running: null,
    height: null,
    width: null,
    x: 0,
    y: 0,
    color: null,
  });
}

function getBasicPortRecordForTests(
  internalId: string,
  agentInternalId: string,
  name: string,
): IPortRecord {
  return portRecordFactory({
    internalId,
    agentInternalId,
    name,
    x: null,
    y: null,
    color: null,
  });
}

function getBasicConnectionRecordForTest(
  internalId: string,
  sourcePortInternalId: string,
  targetPortInternalId: string,
): IConnectionRecord {
  return connectionRecordFactory({
    internalId,
    sourcePortInternalId,
    targetPortInternalId,
    direction: null,
    style: null,
  });
}

describe('Project reducer', () => {
  const emptyState = initialState;
  const notEmptyState = projectRecordFactory({
    xml: null,
    alvisProject: alvisProjectRecordFactory({
      pages: List<IPageRecord>([
        pageRecordFactory({
          internalId: '0',
          name: 'System',
          agentsInternalIds: List<string>(['4', '5']),
          subPagesInternalIds: List<string>(['1']),
          supAgentInternalId: null,
        }),
        pageRecordFactory({
          internalId: '1',
          name: 'SubSystem',
          agentsInternalIds: List<string>(['6', '7', '8']),
          subPagesInternalIds: List<string>(['2', '3']),
          supAgentInternalId: '5',
        }),
        pageRecordFactory({
          internalId: '2',
          name: 'SubSubSystem',
          agentsInternalIds: List<string>(['9', '10']),
          subPagesInternalIds: List<string>([]),
          supAgentInternalId: '9',
        }),
        pageRecordFactory({
          internalId: '3',
          name: 'AnotherPage',
          agentsInternalIds: List<string>(['11', '12', '13']),
          subPagesInternalIds: List<string>([]),
          supAgentInternalId: '8',
        }),
      ]),
      agents: List<IAgentRecord>([
        getBasicAgentRecordForTests('A1', '0', '1', '4', List(['14', '15'])),
        getBasicAgentRecordForTests('A2', '0', null, '5', List(['16'])),
        getBasicAgentRecordForTests('A3', '1', null, '6', List(['17'])),
        getBasicAgentRecordForTests('A4', '1', '3', '7', List(['18', '19'])),
        getBasicAgentRecordForTests('A5', '1', '2', '8', List(['20'])),
        getBasicAgentRecordForTests('A6', '2', null, '9', List(['21'])),
        getBasicAgentRecordForTests('A7', '2', null, '10', List(['22'])),
        getBasicAgentRecordForTests('A8', '3', null, '11', List(['23', '24'])),
        getBasicAgentRecordForTests('A9', '3', null, '12', List(['25'])),
        getBasicAgentRecordForTests('A10', '3', null, '13', List(['26'])),
      ]),
      ports: List<IPortRecord>([
        getBasicPortRecordForTests('14', '4', 'p_1'),
        getBasicPortRecordForTests('15', '4', 'p_2'),
        getBasicPortRecordForTests('16', '5', 'p_3'),
        getBasicPortRecordForTests('17', '6', 'p_4'),
        getBasicPortRecordForTests('18', '7', 'p_5'),
        getBasicPortRecordForTests('19', '7', 'p_6'),
        getBasicPortRecordForTests('20', '8', 'p_7'),
        getBasicPortRecordForTests('21', '9', 'p_8'),
        getBasicPortRecordForTests('22', '10', 'p_9'),
        getBasicPortRecordForTests('23', '11', 'p_10'),
        getBasicPortRecordForTests('24', '11', 'p_11'),
        getBasicPortRecordForTests('25', '12', 'p_12'),
        getBasicPortRecordForTests('26', '13', 'p_13'),
      ]),
      connections: List<IConnectionRecord>([
        getBasicConnectionRecordForTest('27', '14', '16'),
        getBasicConnectionRecordForTest('28', '15', '16'),
        getBasicConnectionRecordForTest('29', '17', '18'),
        getBasicConnectionRecordForTest('30', '17', '19'),
        getBasicConnectionRecordForTest('31', '19', '20'),
        getBasicConnectionRecordForTest('32', '21', '22'),
        getBasicConnectionRecordForTest('33', '23', '24'),
        getBasicConnectionRecordForTest('34', '25', '26'),
      ]),
      code: alvisCodeRecordFactory({
        text: '',
      }),
    }),
    lastInternalId: 34,
    oppositeModifications: List(),
    oppositeModificationCurrentIdx: null,
  });

  it('adds Alvis diagram elements', () => {
    const agentToAddRecord = getBasicAgentRecordForTests('A_x', '0');
    const addedAgentInternalId = '35';
    const portToAddRecord = getBasicPortRecordForTests(
      null,
      addedAgentInternalId,
      'p_x',
    );
    const addedPortInternalId = '36';
    const stateAfterAgentWithPortAdded = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          agents: {
            added: List([agentToAddRecord]),
          },
          ports: {
            added: List([portToAddRecord]),
          },
        });
      })(),
    );

    expect(stateAfterAgentWithPortAdded.alvisProject.pages).toEqual(
      notEmptyState.alvisProject.pages,
    );

    expect(
      stateAfterAgentWithPortAdded.alvisProject.agents.find(
        (el) => el.internalId === addedAgentInternalId,
      ),
    ).toEqual(agentToAddRecord);

    expect(
      stateAfterAgentWithPortAdded.alvisProject.ports.find(
        (port) => port.internalId === addedPortInternalId,
      ),
    ).toEqual(portToAddRecord);

    expect(stateAfterAgentWithPortAdded.alvisProject.connections).toEqual(
      notEmptyState.alvisProject.connections,
    );

    // TO DO: add checking if other elements stay the same - unchanged, not deleted and so on...
  });

  it('modifies Alvis diagram elements changing only elements which should be changed;', () => {
    const modifiedPage = pageRecordFactory({
      internalId: '2',
      name: 'SubSubSystem_modified',
      agentsInternalIds: List<string>(['9', '10']),
      subPagesInternalIds: List<string>([]),
      supAgentInternalId: '9',
    });
    const modifiedAgent = getBasicAgentRecordForTests(
      'A8_modified',
      '3',
      null,
      '11',
      List(['23', '24']),
    );
    const modifiedPort = getBasicPortRecordForTests('23', '11', 'p_10');
    const modifiedConnection = getBasicConnectionRecordForTest(
      '33',
      '23',
      '24',
    );
    const modifiedState = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          pages: {
            modified: List([modifiedPage]),
          },
          agents: {
            modified: List([modifiedAgent]),
          },
          ports: {
            modified: List([modifiedPort]),
          },
          connections: {
            modified: List([modifiedConnection]),
          },
        });
      })(),
    );

    const modifiedRecsAndKeys: [IAlvisElement, string][] = [
      [modifiedPage, 'pages'],
      [modifiedAgent, 'agents'],
      [modifiedPort, 'ports'],
      [modifiedConnection, 'connections'],
    ];
    for (const modifiedRecAndKey of modifiedRecsAndKeys) {
      const modifiedRecord = modifiedRecAndKey[0];
      const keyInState = modifiedRecAndKey[1];
      expect(
        getRecordByInternalId(
          modifiedState.alvisProject[keyInState],
          modifiedRecord.internalId,
        ),
      ).toEqual(modifiedRecord);
    }

    // other records should stay unchanged
    let stateWithoutModifiedRecs = notEmptyState;
    let modifiedStateWithoutModifiedRecs = modifiedState;
    const removeModifiedRecord = (
      state: IProjectRecord,
      keyInState: string,
      modifiedRecord: IAlvisElement,
    ): IProjectRecord =>
      state.update('alvisProject', (alvisProject) =>
        alvisProject.update(keyInState, (elements: List<IInternalRecord>) =>
          elements.filter((el) => el.internalId === modifiedRecord.internalId),
        ),
      );
    for (const modifiedRecAndKey of modifiedRecsAndKeys) {
      const modifiedRecord = modifiedRecAndKey[0];
      const keyInState = modifiedRecAndKey[1];

      stateWithoutModifiedRecs = removeModifiedRecord(
        stateWithoutModifiedRecs,
        keyInState,
        modifiedRecord,
      );
      modifiedStateWithoutModifiedRecs = removeModifiedRecord(
        modifiedStateWithoutModifiedRecs,
        keyInState,
        modifiedRecord,
      );
    }

    expect(modifiedStateWithoutModifiedRecs).toEqual(stateWithoutModifiedRecs);
  });

  // TO DO: Think over: changes in agentsInternalId etc. should be discarded or in such cases, whole change should be discarded?
  it("doesn't violate data that value depends on other diagram elements", () => {
    const modifiedPage = pageRecordFactory({
      internalId: '2',
      name: 'SubSubSystem_modified',
      agentsInternalIds: List<string>([
        '9',
        '10',
        'should not be changed',
        '11',
      ]),
      subPagesInternalIds: List<string>(['2', '<- should not be changed']),
      supAgentInternalId: '11', // <- should not be changed
    });
    const modifiedAgent = getBasicAgentRecordForTests(
      'A8_modified',
      '2', // <- should not be changed
      '2', // <- should not be changed
      '11',
      List(['23', '24', '22', 'should not be changed']),
    );

    const modifiedState = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          pages: {
            modified: List([modifiedPage]),
          },
          agents: {
            modified: List([modifiedAgent]),
          },
        });
      })(),
    );

    const oldPage = getRecordByInternalId(
      notEmptyState.alvisProject.pages,
      modifiedPage.internalId,
    );
    const newPage = getRecordByInternalId(
      modifiedState.alvisProject.pages,
      modifiedPage.internalId,
    );
    expect(newPage.agentsInternalIds).toEqual(oldPage.agentsInternalIds);
    expect(newPage.subPagesInternalIds).toEqual(oldPage.subPagesInternalIds);
    expect(newPage.supAgentInternalId).toEqual(oldPage.supAgentInternalId);

    const oldAgent = getRecordByInternalId(
      notEmptyState.alvisProject.agents,
      modifiedAgent.internalId,
    );
    const newAgent = getRecordByInternalId(
      modifiedState.alvisProject.agents,
      modifiedAgent.internalId,
    );
    expect(newAgent.pageInternalId).toEqual(oldAgent.pageInternalId);
    expect(newAgent.portsInternalIds).toEqual(oldAgent.portsInternalIds);
    expect(newAgent.subPageInternalId).toEqual(oldAgent.subPageInternalId);
  });

  it("sets ID based on lastInternalId and updates 'lastInternalId' field after element was added", () => {
    const initialState = notEmptyState;
    const initialLastInternalId = initialState.lastInternalId;

    const agentToAddRecord = getBasicAgentRecordForTests('A_x', '0');
    const stateAfterAgentAdded = project(
      initialState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          agents: {
            added: List([agentToAddRecord]),
          },
        });
      })(),
    );
    const properAddedAgentInternalId = String(
      Number(initialLastInternalId) + 1,
    );

    expect(stateAfterAgentAdded.lastInternalId).toEqual(
      properAddedAgentInternalId,
    );

    const portToAddRecord = getBasicPortRecordForTests(
      null,
      properAddedAgentInternalId,
      'p_x',
    );
    const stateAfterPortAdded = project(
      stateAfterAgentAdded,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          ports: {
            added: List([portToAddRecord]),
          },
        });
      })(),
    );
    const properAddedPortInternalId = String(
      Number(stateAfterAgentAdded.lastInternalId) + 1,
    );

    expect(stateAfterPortAdded.lastInternalId).toEqual(
      properAddedPortInternalId,
    );
  });

  it("removes port and port's connections if port is removed", () => {
    const removedPortInternalId = '17';
    const stateAfterPortRemoved = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          ports: {
            deleted: List([removedPortInternalId]),
          },
        });
      })(),
    );

    expect(
      stateAfterPortRemoved.alvisProject.ports.map((port) => port.internalId),
    ).not.toEqual(expect.arrayContaining([removedPortInternalId]));

    expect(
      stateAfterPortRemoved.alvisProject.connections.map(
        (connection) => connection.internalId,
      ),
    ).not.toEqual(expect.arrayContaining(['29', '30']));
  });

  it("removes agent and agent's elements if agent is removed", () => {
    const removedAgentInternalId = '7';
    const stateAfterAgentRemoved = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          agents: {
            deleted: List([removedAgentInternalId]),
          },
        });
      })(),
    );

    expect(
      stateAfterAgentRemoved.alvisProject.agents.map(
        (agent) => agent.internalId,
      ),
    ).not.toEqual(expect.arrayContaining([removedAgentInternalId]));

    expect(
      stateAfterAgentRemoved.alvisProject.ports.map((port) => port.internalId),
    ).not.toEqual(expect.arrayContaining(['17']));

    expect(
      stateAfterAgentRemoved.alvisProject.connections.map(
        (connection) => connection.internalId,
      ),
    ).not.toEqual(expect.arrayContaining(['29', '30']));
  });

  it("removes agent and agent's subpage if agent is removed", () => {
    const removedAgentInternalId = '9';
    const stateAfterAgentRemoved = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          agents: {
            deleted: List([removedAgentInternalId]),
          },
        });
      })(),
    );

    expect(
      stateAfterAgentRemoved.alvisProject.agents.map(
        (agent) => agent.internalId,
      ),
    ).not.toEqual(expect.arrayContaining([removedAgentInternalId]));

    expect(
      stateAfterAgentRemoved.alvisProject.pages.map((page) => page.internalId),
    ).not.toEqual(expect.arrayContaining(['2']));
  });

  it("removes page and page's connections, ports & agents if the page is removed", () => {
    const pageToRemoveInternalId = '2';
    const stateAfterPage1Removed = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          pages: {
            deleted: List([pageToRemoveInternalId]),
          },
        });
      })(),
    );

    expect(
      stateAfterPage1Removed.alvisProject.pages.map((page) => page.internalId),
    ).toEqual(
      List(['0', '1', '2', '3'].filter((el) => el !== pageToRemoveInternalId)),
    );

    expect(
      stateAfterPage1Removed.alvisProject.agents.map(
        (agent) => agent.internalId,
      ),
    ).not.toEqual(expect.arrayContaining(['10', '11']));

    expect(
      stateAfterPage1Removed.alvisProject.ports.map((port) => port.internalId),
    ).not.toEqual(expect.arrayContaining(['21', '22']));

    expect(
      stateAfterPage1Removed.alvisProject.connections.map(
        (connection) => connection.internalId,
      ),
    ).not.toEqual(expect.arrayContaining(['32']));
  });

  it('removes subpages of the page if page is removed', () => {
    const stateAfterPage1Removed = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return projectModificationRecordFactoryPartial({
          pages: {
            deleted: List(['1']),
          },
        });
      })(),
    );

    expect(
      stateAfterPage1Removed.alvisProject.pages.map((page) => page.internalId),
    ).toEqual(List(['0']));
  });

  function getStatesModifications(
    state: IProjectRecord,
  ): [IProjectRecord, IOppositeModifications][] {
    const agentToAddRecord = getBasicAgentRecordForTests('A_x', '0');
    const addAgentModifications = {
      modification: projectModificationRecordFactoryPartial({
        agents: {
          added: List([agentToAddRecord]),
        },
      }),
      antiModification: projectModificationRecordFactoryPartial({
        agents: {
          deleted: List(['35']),
        },
      }),
    };
    const stateAfterAgentAdded = project(
      notEmptyState,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return addAgentModifications.modification;
      })(),
    );
    const addedAgentInternalId = addAgentModifications.antiModification.agents.deleted.first();

    const portToAddRecord = getBasicPortRecordForTests(
      null,
      addedAgentInternalId,
      'p_x',
    );
    const addPortModifications = {
      modification: projectModificationRecordFactoryPartial({
        ports: {
          added: List([portToAddRecord]),
        },
      }),
      antiModification: projectModificationRecordFactoryPartial({
        ports: {
          deleted: List(['36']),
        },
      }),
    };
    const stateAfterPortAdded = project(
      stateAfterAgentAdded,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return addPortModifications.modification;
      })(),
    );
    const addedPortInternalId = addPortModifications.antiModification.ports.deleted.first();

    const deleteAgentModifications = {
      modification: projectModificationRecordFactoryPartial({
        agents: {
          deleted: List([addedAgentInternalId]),
        },
        ports: {
          deleted: List([addedPortInternalId]),
        },
      }),
      antiModification: projectModificationRecordFactoryPartial({
        agents: {
          added: List([agentToAddRecord]),
        },
        ports: {
          added: List([portToAddRecord]),
        },
      }),
    };
    const stateAfterAgentDeleted = project(
      stateAfterPortAdded,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return deleteAgentModifications.modification;
      })(),
    );

    return [
      [stateAfterAgentAdded, addAgentModifications],
      [stateAfterPortAdded, addPortModifications],
      [stateAfterAgentDeleted, deleteAgentModifications],
    ];
  }
  const stateModifications1 = getStatesModifications(notEmptyState);

  it('creates proper anti-modifications for changes and stores them with modifications', () => {
    for (let i = 0; i < stateModifications1.length; i += 1) {
      const stateModification = stateModifications1[i];
      const state = stateModification[0];
      const modification = stateModification[1].modification;
      const antiModification = stateModification[1].antiModification;

      expect(state.oppositeModifications.get(i).antiModification).toBeDefined();
      expect(state.oppositeModifications.get(i).antiModification).toEqual(
        antiModification,
      );

      expect(state.oppositeModifications.get(i).modification).toBeDefined();
      expect(state.oppositeModifications.get(i).modification).toEqual(
        modification,
      );
    }
  });

  it("updates properly 'antiModificationCurrIdx' field after change, redo, undo", () => {
    expect(notEmptyState.oppositeModificationCurrentIdx).toEqual(-1);

    for (let i = 0; i < stateModifications1.length; i += 1) {
      const stateModification = stateModifications1[i];
      const state = stateModification[0];

      expect(state.oppositeModificationCurrentIdx).toEqual(i);
    }

    const lastStateModification =
      stateModifications1[stateModifications1.length - 1];
    let lastState = lastStateModification[0];

    for (let i = stateModifications1.length - 2; i >= 0; i -= 1) {
      const stateModification = stateModifications1[i];
      const state = stateModification[0];

      lastState = project(
        lastState,
        createAction(projectActions.PROJECT_UNDO)(),
      );
      expect(lastState.oppositeModificationCurrentIdx).toEqual(i - 1);
    }

    const stateAfterUndoWithNothingToUndo = project(
      lastState,
      createAction(projectActions.PROJECT_UNDO)(),
    );
    expect(
      stateAfterUndoWithNothingToUndo.oppositeModificationCurrentIdx,
    ).toEqual(-1);

    for (let i = 0; i < stateModifications1.length; i += 1) {
      const stateModification = stateModifications1[i];
      const state = stateModification[0];

      lastState = project(
        lastState,
        createAction(projectActions.PROJECT_REDO)(),
      );
      expect(lastState.oppositeModificationCurrentIdx).toEqual(i);
    }
  });

  it('performs undo and redo', () => {
    const statesLastToInitial: IProjectRecord[] = [
      ...getStatesModifications(notEmptyState)
        .map((el) => el[0])
        .reverse(),
      notEmptyState,
    ];

    const lastState = statesLastToInitial.shift();
    let state = lastState;

    for (const previousState of statesLastToInitial) {
      state = project(state, createAction(projectActions.PROJECT_UNDO)());

      expect(state.alvisProject).toEqual(previousState.alvisProject);
    }

    const statesPostInitialToLast: IProjectRecord[] = [
      ...statesLastToInitial.reverse().splice(0, 1),
      lastState,
    ];
    for (const nextState of statesPostInitialToLast) {
      state = project(state, createAction(projectActions.PROJECT_REDO)());

      expect(state.alvisProject).toEqual(nextState.alvisProject);
    }
  });

  // it('modifies anti-modification after undo so that redo is possible', () => { });

  // it('performs redo');

  // it('modifies anti-modification after redo so that undo is possible');

  it('deletes oppositeModifications for redo after change other than undo', () => {
    const statesInitialToLast: IProjectRecord[] = [
      notEmptyState,
      ...getStatesModifications(notEmptyState).map((el) => el[0]),
    ];

    const lastState = statesInitialToLast.pop();
    const stateAfterUndo = project(
      lastState,
      createAction(projectActions.PROJECT_UNDO)(),
    );
    const oppositeModificationsAfterUndo = stateAfterUndo.oppositeModifications;

    const agentToAddRecord = getBasicAgentRecordForTests('A_x2', '0');
    const addedAgentInternalId = String(
      Number(stateAfterUndo.lastInternalId) + 1,
    );
    const addAgentModifications = oppositeModificationsFactory({
      modification: projectModificationRecordFactoryPartial({
        agents: {
          added: List([agentToAddRecord]),
        },
      }),
      antiModification: projectModificationRecordFactoryPartial({
        agents: {
          deleted: List([addedAgentInternalId]),
        },
      }),
    });
    const stateAfterAgentAdded = project(
      stateAfterUndo,
      createAction(projectActions.MODIFY_PROJECT, (): IProjectModification => {
        return addAgentModifications.modification;
      })(),
    );

    expect(stateAfterAgentAdded.oppositeModifications).toEqual(
      oppositeModificationsAfterUndo
        .butLast()
        .toList()
        .push(addAgentModifications),
    );
  });

  ////////////////////

  it(
    "updates related records - e.g. if agent is added field agentsInternalIds in agent's page record should be updated",
  );
});

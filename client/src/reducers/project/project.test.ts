import project, { initialState } from './project';
import {
  projectRecordFactory,
  IProjectModification,
  projectModificationRecordFactoryPartial,
  IProjectRecord,
  IOppositeModifications,
  oppositeModificationsFactory,
  IProjectModificationRecord,
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
import { List, Set, Map } from 'immutable';
import { createAction } from 'redux-actions';
import { state as exampleState1 } from '../../utils/test/exampleState1';
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

describe('Project reducer', () => {
  const emptyState = initialState;
  const notEmptyState = exampleState1;

  it('adds Alvis diagram elements', () => {
    const agentToAddRecord = getBasicAgentRecordForTests('A_x', '0');
    // const portToAddRecord = getBasicPortRecordForTests(
    //   null,
    //   addedAgentInternalId, // TODO: we dont know unadded agent ID! e.g. there is no guaranteed order of assigning ids to added elements
    //   'p_x',
    // );
    // const addedPortInternalId = '36';
    const stateAfterAgentWithPortAdded = project(
      notEmptyState,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return projectModificationRecordFactoryPartial({
            agents: {
              added: List([agentToAddRecord]),
            },
            ports: {
              // added: List([portToAddRecord]),
            },
          });
        },
      )(),
    );

    // TODO: should we improve it? Pages were changed because they store ids of their agents
    // expect(stateAfterAgentWithPortAdded.alvisProject.pages).toEqual(
    //   notEmptyState.alvisProject.pages,
    // );

    console.log(stateAfterAgentWithPortAdded.alvisProject.agents)
    expect(
      stateAfterAgentWithPortAdded.alvisProject.agents.get(
        agentToAddRecord.internalId,
      ),
    ).toEqual(agentToAddRecord.set('internalId', agentToAddRecord.internalId));

    // expect(
    //   stateAfterAgentWithPortAdded.alvisProject.ports.find(
    //     (port) => port.internalId === addedPortInternalId,
    //   ),
    // ).toEqual(portToAddRecord);

    expect(stateAfterAgentWithPortAdded.alvisProject.connections).toEqual(
      notEmptyState.alvisProject.connections,
    );

    // TO DO: add checking if other elements stay the same - unchanged, not deleted and so on...
  });

  // TO DO: what about modification of element which is added in the same modification?
  // Now it is impossible because for modification we must know element id, which is not known before adding of element
  // 07.09 We should be careful, example:
  // 1. add agent A; 2. add port P; 3. delete A, P; 4. undo delete
  // in 4th, during applying antimodification to 3 modification, we may insert agent with already set `portsInternalIds`
  // and after adding port P (during undo), we may end up with portsInternalIds with two identical ids of port P
  it('modifies Alvis diagram elements changing only elements which should be changed;', () => {
    const modifiedPage = pageRecordFactory({
      internalId: '2',
      name: 'SubSubSystem_modified',
      agentsInternalIds: Set(['9', '10']),
      subPagesInternalIds: Set(),
      supAgentInternalId: '8',
    });
    const modifiedAgent = getBasicAgentRecordForTests(
      'A8_modified',
      '3',
      null,
      '11',
      Set(['23', '24']),
    );
    const modifiedPort = getBasicPortRecordForTests('23', '11', 'p_10_mod');
    const modifiedConnection = getBasicConnectionRecordForTest(
      // TODO: this does not modify connection, because data are the same
      '33',
      '23',
      '24',
    );
    const modifiedState = project(
      notEmptyState,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
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
        },
      )(),
    );

    const modifiedRecsAndKeys: [
      IAlvisElement,
      AlvisProjectKeysLeadingToElements
    ][] = [
      [modifiedPage, 'pages'],
      [modifiedAgent, 'agents'],
      [modifiedPort, 'ports'],
      [modifiedConnection, 'connections'],
    ];
    for (const modifiedRecAndKey of modifiedRecsAndKeys) {
      const modifiedRecord = modifiedRecAndKey[0];
      const keyInState = modifiedRecAndKey[1];
      expect(
        getElementById(
          modifiedState.alvisProject[keyInState] as Map<
            string,
            IInternalRecord
          >, // TODO: is it good idea to cast it to List<IInternalRecordF>?
          modifiedRecord.internalId,
        ),
      ).toEqual(modifiedRecord);
    }

    // other records should stay unchanged
    let stateWithoutModifiedRecs = notEmptyState;
    let modifiedStateWithoutModifiedRecs = modifiedState;
    const removeModifiedRecord = (
      state: IProjectRecord,
      keyInState: AlvisProjectKeysLeadingToElements,
      modifiedRecord: IAlvisElement,
    ): IProjectRecord =>
      state.update('alvisProject', (alvisProject: IAlvisProjectRecord) =>
        alvisProject.update(keyInState, (elements) => {
          // https://stackoverflow.com/questions/42427393/cannot-invoke-an-expression-whose-type-lacks-a-call-signature
          // https://github.com/Microsoft/TypeScript/issues/7294
          return <IAlvisProjectRecord[AlvisProjectKeysLeadingToElements]>(elements as Map<
            string,
            IInternalRecord
          >).filter((el) => el.internalId !== modifiedRecord.internalId);
        }),
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
    modifiedStateWithoutModifiedRecs = modifiedStateWithoutModifiedRecs.set(
      'oppositeModifications',
      List(),
    );
    modifiedStateWithoutModifiedRecs = modifiedStateWithoutModifiedRecs.set(
      'oppositeModificationCurrentIdx',
      -1,
    );

    expect(modifiedStateWithoutModifiedRecs).toEqual(stateWithoutModifiedRecs);
  });

  // TO DO: Think over: changes in agentsInternalId etc. should be discarded or in such cases, whole change should be discarded?
  it("doesn't violate data that value depends on other diagram elements", () => {
    const modifiedPage = pageRecordFactory({
      internalId: '2',
      name: 'SubSubSystem_modified',
      agentsInternalIds: Set(['9', '10', 'should not be changed', '11']),
      subPagesInternalIds: Set(['2', '<- should not be changed']),
      supAgentInternalId: '11', // <- should not be changed
    });
    const modifiedAgent = getBasicAgentRecordForTests(
      'A8_modified',
      '2', // <- should not be changed
      '2', // <- should not be changed
      '11',
      Set(['23', '24', '22', 'should not be changed']),
    );

    const modifiedState = project(
      notEmptyState,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return projectModificationRecordFactoryPartial({
            pages: {
              modified: List([modifiedPage]),
            },
            agents: {
              modified: List([modifiedAgent]),
            },
          });
        },
      )(),
    );

    const oldPage = getElementById(
      notEmptyState.alvisProject.pages,
      modifiedPage.internalId,
    );
    const newPage = getElementById(
      modifiedState.alvisProject.pages,
      modifiedPage.internalId,
    );
    expect(newPage.agentsInternalIds).toEqual(oldPage.agentsInternalIds);
    expect(newPage.subPagesInternalIds).toEqual(oldPage.subPagesInternalIds);
    expect(newPage.supAgentInternalId).toEqual(oldPage.supAgentInternalId);

    const oldAgent = getElementById(
      notEmptyState.alvisProject.agents,
      modifiedAgent.internalId,
    );
    const newAgent = getElementById(
      modifiedState.alvisProject.agents,
      modifiedAgent.internalId,
    );
    expect(newAgent.pageInternalId).toEqual(oldAgent.pageInternalId);
    expect(newAgent.portsInternalIds).toEqual(oldAgent.portsInternalIds);
    expect(newAgent.subPageInternalId).toEqual(oldAgent.subPageInternalId);
  });

  it("removes port and port's connections if port is removed", () => {
    const removedPortInternalId = '17';
    const stateAfterPortRemoved = project(
      notEmptyState,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return projectModificationRecordFactoryPartial({
            ports: {
              deleted: List([removedPortInternalId]),
            },
          });
        },
      )(),
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
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return projectModificationRecordFactoryPartial({
            agents: {
              deleted: List([removedAgentInternalId]),
            },
          });
        },
      )(),
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
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return projectModificationRecordFactoryPartial({
            agents: {
              deleted: List([removedAgentInternalId]),
            },
          });
        },
      )(),
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
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return projectModificationRecordFactoryPartial({
            pages: {
              deleted: List([pageToRemoveInternalId]),
            },
          });
        },
      )(),
    );

    expect(
      stateAfterPage1Removed.alvisProject.pages.toList().map((page) => page.internalId),
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
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return projectModificationRecordFactoryPartial({
            pages: {
              deleted: List(['1']),
            },
          });
        },
      )(),
    );

    expect(
      stateAfterPage1Removed.alvisProject.pages.toList().map((page) => page.internalId),
    ).toEqual(List(['0']));
  });

  function getStatesModifications(
    state: IProjectRecord,
  ): [IProjectRecord, IOppositeModifications][] {
    const agentToAddRecord = getBasicAgentRecordForTests('A_x', '0', null); // TODO: would't it be better to remove 'Record' from variable name -> information about this is already stored in type of variable
    const addAgentModifications = {
      modification: projectModificationRecordFactoryPartial({
        agents: {
          added: List([agentToAddRecord]),
        },
      }),
      antiModification: projectModificationRecordFactoryPartial({
        agents: {
          deleted: List([agentToAddRecord.internalId]),
        },
      }),
    };
    const stateAfterAgentAdded = project(
      notEmptyState,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return addAgentModifications.modification;
        },
      )(),
    );

    const portToAddRecord = getBasicPortRecordForTests(
      newUuid(),
      agentToAddRecord.internalId,
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
          deleted: List([portToAddRecord.internalId]),
        },
      }),
    };
    const addedAgentAfterPortAdded = agentToAddRecord.set(
      'portsInternalIds',
      Set([portToAddRecord.internalId]),
    );
    const stateAfterPortAdded = project(
      stateAfterAgentAdded,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return addPortModifications.modification;
        },
      )(),
    );

    const deleteAgentModifications = {
      modification: projectModificationRecordFactoryPartial({
        agents: {
          deleted: List([agentToAddRecord.internalId]),
        },
        // Do not comment out 'ports', we assume it is full modification - we are not testing creation of full modification
        ports: {
          deleted: List([portToAddRecord.internalId]),
        },
      }),
      antiModification: projectModificationRecordFactoryPartial({
        agents: {
          added: List([addedAgentAfterPortAdded]),
        },
        ports: {
          added: List([portToAddRecord]),
        },
      }),
    };
    const stateAfterAgentDeleted = project(
      stateAfterPortAdded,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return deleteAgentModifications.modification;
        },
      )(),
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

    for (let i = stateModifications1.length - 1; i >= 0; i -= 1) {
      // const stateModification = stateModifications1[i];
      // const state = stateModification[0];

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
      ...stateModifications1.map((el) => el[0]).reverse(),
      notEmptyState,
    ];

    const statesPostLastToInitial = statesLastToInitial.slice();
    const lastState = statesPostLastToInitial.shift();
    let state = lastState;

    for (const previousState of statesPostLastToInitial) {
      state = project(state, createAction(projectActions.PROJECT_UNDO)());

      expect(state.alvisProject).toEqual(previousState.alvisProject);
    }

    expect(state.oppositeModificationCurrentIdx).toEqual(-1);

    const statesPostInitialToLast: IProjectRecord[] = [
      ...stateModifications1.map((el) => el[0]),
      // ...statesLastToInitial,//.reverse(),//.splice(0, 1),
      // lastState,
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
      ...stateModifications1.map((el) => el[0]),
    ];

    const lastState = statesInitialToLast.pop();
    const stateAfterUndo = project(
      lastState,
      createAction(projectActions.PROJECT_UNDO)(),
    );
    const oppositeModificationsAfterUndo = stateAfterUndo.oppositeModifications;

    const agentToAddRecord = getBasicAgentRecordForTests('A_x2', '0', null); // TODO: is it OK to set ID here in context of future?
    const addAgentModifications = oppositeModificationsFactory({
      modification: projectModificationRecordFactoryPartial({
        agents: {
          added: List([agentToAddRecord]),
        },
      }),
      antiModification: projectModificationRecordFactoryPartial({
        agents: {
          deleted: List([agentToAddRecord.internalId]),
        },
      }),
    });
    const stateAfterAgentAdded = project(
      stateAfterUndo,
      createAction(
        projectActions.MODIFY_PROJECT,
        (): IProjectModificationRecord => {
          return addAgentModifications.modification;
        },
      )(),
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

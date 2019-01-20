import { state as exampleState1 } from './test/exampleState1';
import {
  getBasicAgentRecordForTests,
  getBasicPortRecordForTests,
  getBasicConnectionRecordForTest,
} from './test/recordsGenerators';
import project from '../reducers/project/project';
import { createAction } from 'redux-actions';
import {
  IProjectModification,
  projectModificationRecordFactoryPartial,
  IProjectModificationRecord,
  IProjectRecord,
} from '../models/project';
import { List, Set } from 'immutable';
import * as projectActions from '../constants/projectActions';
import { pageRecordFactory } from '../models/alvisProject';
import {
  generateAntiModification,
  getElementById,
  generateFullModification,
  getAllPagesDeleted,
} from './alvisProject';
import { sortProjectModification } from './test/sortHelper';
import { newUuid } from './uuidGenerator';

describe('Alvis project utils', () => {
  describe('generateFullModification', () => {
    it('generates full-modification', () => {
      const stateWithModifications = getStateAndModifications1();
      const state = stateWithModifications[0];
      const semiModification = stateWithModifications[1].semiModification;
      const fullModification = stateWithModifications[1].fullModification;

      const t0 = performance.now();
      const generatedFullModification = generateFullModification(
        semiModification,
        state.alvisProject,
      );
      const t1 = performance.now();
      expect(t1 - t0).toBeLessThan(10); // TODO: make real performance tests

      expect(sortProjectModification(generatedFullModification)).toEqual(
        sortProjectModification(fullModification),
      );
    });
  });

  describe('getAllPagesAndAgentsToDelete', () => {
    it('returns all pages and agents to delete based on semi-modification', () => {
      const [
        state,
        { semiModification, fullModification },
      ] = getStateAndModifications1();

      // TODO: make getAllPagesAndAgentsToDelete function private and test it as private
      // https://github.com/speedskater/babel-plugin-rewire/issues/183
      const pagesToDelete = getAllPagesDeleted(
        semiModification,
        state.alvisProject,
      );

      expect(pagesToDelete.map((page) => page.internalId)).toEqual(
        fullModification.pages.deleted,
      );
    });
  });

  describe('generateAntiModification', () => {
    it('creates anti-modification', () => {
      const stateWithModifications = getStateAndModifications1();
      const state = stateWithModifications[0];
      const semiModification = stateWithModifications[1].semiModification;
      const fullAntiModification =
        stateWithModifications[1].fullAntiModification;

      const generatedFullAntiModification = generateAntiModification(
        semiModification,
        state.alvisProject,
      );
      expect(sortProjectModification(generatedFullAntiModification)).toEqual(
        sortProjectModification(fullAntiModification),
      );
    });
  });
});

function getStateAndModifications1(): [
  // TO DO: come up with better name
  IProjectRecord,
  {
    semiModification: IProjectModificationRecord;
    fullModification: IProjectModificationRecord;
    fullAntiModification: IProjectModificationRecord;
  }
] {
  // TO DO: what about different types or interfaces for semi- and full- modifications
  //        so that they would guard against unintended assignment etc.

  const initialState = exampleState1;
  const agentToAddRecord = getBasicAgentRecordForTests('A_x', '0');
  const portToAddRecord = getBasicPortRecordForTests(
    newUuid(),
    agentToAddRecord.internalId,
    'p_x',
  );
  const modifiedPage = pageRecordFactory({
    internalId: '2',
    name: 'SubSubSystem_modified',
    agentsInternalIds: Set(['9', '10']),
    subPagesInternalIds: Set([]),
    supAgentInternalId: '9',
  });
  const modifiedPageOld = getElementById(
    initialState.alvisProject.pages,
    modifiedPage.internalId,
  );

  const modifiedAgent = getBasicAgentRecordForTests(
    'A8_modified',
    '3',
    null,
    '11',
    Set(['23', '24']),
  );
  const modifiedAgentOld = getElementById(
    initialState.alvisProject.agents,
    modifiedAgent.internalId,
  );

  const modifiedPort = getBasicPortRecordForTests('23', '11', 'p_modified');
  const modifiedPortOld = getElementById(
    initialState.alvisProject.ports,
    modifiedPort.internalId,
  );

  const modifiedConnection = getBasicConnectionRecordForTest('33', '23', '24');
  const modifiedConnectionOld = getElementById(
    initialState.alvisProject.connections,
    modifiedConnection.internalId,
  );

  const agentToDeleteInternalId = '8';

  const semiModification: IProjectModificationRecord = projectModificationRecordFactoryPartial(
    {
      pages: {
        modified: List([modifiedPage]),
      },
      agents: {
        added: List([agentToAddRecord]),
        modified: List([modifiedAgent]),
        deleted: List([agentToDeleteInternalId]),
      },
      ports: {
        added: List([portToAddRecord]),
        modified: List([modifiedPort]),
      },
      connections: {
        modified: List([modifiedConnection]),
      },
    },
  );
  const fullModification: IProjectModificationRecord = projectModificationRecordFactoryPartial(
    {
      pages: {
        deleted: List(['2']),
      },
      agents: {
        added: List([agentToAddRecord]),
        modified: List([modifiedAgent]),
        deleted: List([agentToDeleteInternalId, '9', '10']),
      },
      ports: {
        added: List([portToAddRecord]),
        modified: List([modifiedPort]),
        deleted: List(['20', '21', '22']),
      },
      connections: {
        modified: List([modifiedConnection]),
        deleted: List(['31', '32']),
      },
    },
  );

  const alvisProject = initialState.alvisProject;
  const deletedPage2 = getElementById(alvisProject.pages, '2');
  const deletedAgent8 = getElementById(alvisProject.agents, '8');
  const deletedAgent9 = getElementById(alvisProject.agents, '9');
  const deletedAgent10 = getElementById(alvisProject.agents, '10');
  const deletedPort20 = getElementById(alvisProject.ports, '20');
  const deletedPort21 = getElementById(alvisProject.ports, '21');
  const deletedPort22 = getElementById(alvisProject.ports, '22');
  const deletedConnection31 = getElementById(
    alvisProject.connections,
    '31',
  );
  const deletedConnection32 = getElementById(
    alvisProject.connections,
    '32',
  );

  const fullAntiModification: IProjectModificationRecord = projectModificationRecordFactoryPartial(
    {
      pages: {
        added: List([deletedPage2]),
        // modified: List([modifiedPageOld]),
      },
      agents: {
        added: List([deletedAgent8, deletedAgent9, deletedAgent10]),
        modified: List([modifiedAgentOld]),
        deleted: List([agentToAddRecord.internalId]),
      },
      ports: {
        added: List([deletedPort20, deletedPort21, deletedPort22]),
        modified: List([modifiedPortOld]),
        deleted: List([portToAddRecord.internalId]),
      },
      connections: {
        added: List([deletedConnection31, deletedConnection32]),
        modified: List([modifiedConnectionOld]),
      },
    },
  );

  return [
    initialState,
    {
      semiModification,
      fullModification,
      fullAntiModification,
    },
  ];
}

import { List } from 'immutable';
import {
  IAgentRecord,
  alvisProjectRecordFactory,
  IPageRecord,
  agentRecordFactory,
  IPortRecord,
  portRecordFactory,
  IConnectionRecord,
  connectionRecordFactory,
  pageRecordFactory,
  alvisCodeRecordFactory,
} from '../../models/alvisProject';
import { projectRecordFactory } from '../../models/project';
import {
  getBasicAgentRecordForTests,
  getBasicPortRecordForTests,
  getBasicConnectionRecordForTest,
} from './recordsGenerators';

export const state = projectRecordFactory({
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
  oppositeModifications: List(),
  oppositeModificationCurrentIdx: -1,
});

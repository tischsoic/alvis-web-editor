import { List, Set, Map } from 'immutable';
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
    pages: Map([
      [
        '0',
        pageRecordFactory({
          internalId: '0',
          name: 'System',
          agentsInternalIds: Set(['4', '5']),
          subPagesInternalIds: Set(['1']),
          supAgentInternalId: null,
        }),
      ],
      [
        '1',
        pageRecordFactory({
          internalId: '1',
          name: 'SubSystem',
          agentsInternalIds: Set(['6', '7', '8']),
          subPagesInternalIds: Set(['2', '3']),
          supAgentInternalId: '5',
        }),
      ],
      [
        '2',
        pageRecordFactory({
          internalId: '2',
          name: 'SubSubSystem',
          agentsInternalIds: Set(['9', '10']),
          subPagesInternalIds: Set([]),
          supAgentInternalId: '9',
        }),
      ],
      [
        '3',
        pageRecordFactory({
          internalId: '3',
          name: 'AnotherPage',
          agentsInternalIds: Set(['11', '12', '13']),
          subPagesInternalIds: Set([]),
          supAgentInternalId: '8',
        }),
      ],
    ]),
    agents: Map([
      [
        'A1',
        getBasicAgentRecordForTests('A1', '0', '1', '4', Set(['14', '15'])),
      ],
      ['A2', getBasicAgentRecordForTests('A2', '0', null, '5', Set(['16']))],
      ['A3', getBasicAgentRecordForTests('A3', '1', null, '6', Set(['17']))],
      [
        'A4',
        getBasicAgentRecordForTests('A4', '1', '3', '7', Set(['18', '19'])),
      ],
      ['A5', getBasicAgentRecordForTests('A5', '1', '2', '8', Set(['20']))],
      ['A6', getBasicAgentRecordForTests('A6', '2', null, '9', Set(['21']))],
      ['A7', getBasicAgentRecordForTests('A7', '2', null, '10', Set(['22']))],
      [
        'A8',
        getBasicAgentRecordForTests('A8', '3', null, '11', Set(['23', '24'])),
      ],
      ['A9', getBasicAgentRecordForTests('A9', '3', null, '12', Set(['25']))],
      ['A10', getBasicAgentRecordForTests('A10', '3', null, '13', Set(['26']))],
    ]),
    ports: Map([
      ['14', getBasicPortRecordForTests('14', '4', 'p_1')],
      ['15', getBasicPortRecordForTests('15', '4', 'p_2')],
      ['16', getBasicPortRecordForTests('16', '5', 'p_3')],
      ['17', getBasicPortRecordForTests('17', '6', 'p_4')],
      ['18', getBasicPortRecordForTests('18', '7', 'p_5')],
      ['19', getBasicPortRecordForTests('19', '7', 'p_6')],
      ['20', getBasicPortRecordForTests('20', '8', 'p_7')],
      ['21', getBasicPortRecordForTests('21', '9', 'p_8')],
      ['22', getBasicPortRecordForTests('22', '10', 'p_9')],
      ['23', getBasicPortRecordForTests('23', '11', 'p_10')],
      ['24', getBasicPortRecordForTests('24', '11', 'p_11')],
      ['25', getBasicPortRecordForTests('25', '12', 'p_12')],
      ['26', getBasicPortRecordForTests('26', '13', 'p_13')],
    ]),
    connections: Map([
      ['27', getBasicConnectionRecordForTest('27', '14', '16')],
      ['28', getBasicConnectionRecordForTest('28', '15', '16')],
      ['29', getBasicConnectionRecordForTest('29', '17', '18')],
      ['30', getBasicConnectionRecordForTest('30', '17', '19')],
      ['31', getBasicConnectionRecordForTest('31', '19', '20')],
      ['32', getBasicConnectionRecordForTest('32', '21', '22')],
      ['33', getBasicConnectionRecordForTest('33', '23', '24')],
      ['34', getBasicConnectionRecordForTest('34', '25', '26')],
    ]),
    code: alvisCodeRecordFactory({
      text: '',
    }),
  }),
  oppositeModifications: List(),
  oppositeModificationCurrentIdx: -1,
});

import { List } from 'immutable';
import {
  IAgentRecord,
  agentRecordFactory,
  IPortRecord,
  portRecordFactory,
  IConnectionRecord,
  connectionRecordFactory,
} from '../../models/alvisProject';
import { newUuid } from '../uuidGenerator';

export function getBasicAgentRecordForTests(
  name: string,
  pageInternalId: string,
  subPageInternalId: string = null,
  internalId: string = newUuid(),
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

export function getBasicPortRecordForTests(
  internalId: string = newUuid(),
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

export function getBasicConnectionRecordForTest(
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

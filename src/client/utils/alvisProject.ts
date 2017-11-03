import {
    alvisProjectRecordFactory, IAlvisProjectRecord,
    hierarchyRecordFactory, IHierarchyRecord,
    hierarchyNodeRecordFactory, IHierarchyNodeRecord,
    pageRecordFactory, IPageRecord,
    agentRecordFactory, IAgentRecord,
    portRecordFactory, IPortRecord,
    connectionRecordFactory, IConnectionRecord,
    alvisCodeRecordFactory, IAlvisCodeRecord,
    ConnectionDirection
} from "../models/alvisProject";
import { List } from 'immutable';

export function getAllPages(alvisProject: IAlvisProjectRecord): List<IPageRecord> {
    return alvisProject.pages;
}

export function getAllAgents(page: IPageRecord): List<IAgentRecord> {
    return page.agents;
}

export function getAllPorts(alvisProject: IAlvisProjectRecord): List<IAgentRecord> {
    return (alvisProject.pages.map((page) => page.ports)).flatten(1) as List<IAgentRecord>;
}

export function getAgentPorts(page: IPageRecord, agent: IAgentRecord): List<IPortRecord> {
    return agent.portsIds.map((portId) => getPortById(page, portId)) as List<IPortRecord>;
}

export function getAllConnections(page: IPageRecord): List<IConnectionRecord> {
    return page.connections;
}

export function getPortById(page: IPageRecord, portId: string): IPortRecord {
    return page.ports.find((port) => port.id === portId);
}
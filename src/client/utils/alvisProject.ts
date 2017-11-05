import {
    alvisProjectRecordFactory, IAlvisProjectRecord,
    hierarchyNodeRecordFactory, IHierarchyNodeRecord,
    pageRecordFactory, IPageRecord,
    agentRecordFactory, IAgentRecord,
    portRecordFactory, IPortRecord,
    connectionRecordFactory, IConnectionRecord,
    alvisCodeRecordFactory, IAlvisCodeRecord,
    ConnectionDirection
} from "../models/alvisProject";
import { List } from 'immutable';

export function getValidEmptyAlvisProject(): IAlvisProjectRecord {
    return alvisProjectRecordFactory({
        hierarchyNodes: List([hierarchyNodeRecordFactory({
            internalId: '0',
            agent: '',
            name: 'System',
            subNodesInternalIds: List(),
        })]),
        pages: List<IPageRecord>([
            pageRecordFactory({
                internalId: '0',
                name: 'System',
                agentsInternalIds: List<string>(),
                // connectionsInternalIds: List<string>(),
            })
        ]),
        agents: List<IAgentRecord>(),
        ports: List<IPortRecord>(),
        connections: List<IConnectionRecord>(),
        code: alvisCodeRecordFactory({
            text: '',
        }),
    });
}

// TO DO: check comment about internalID generation!!!
export function addAgentToAlvisProject(agent: IAgentRecord, pageInternalId: string, alvisProject: IAlvisProjectRecord): IAlvisProjectRecord {
    const agentInternalId = alvisProject.agents.count().toString(), // It is very error-prone to set id based on elements count, 
        //what if some elemt will be deleted? Then another added and we may have two elements with the same internalID!!!
        agentToAdd = agent.set('internalId', agentInternalId),
        afterAgentsUpdated = alvisProject.update('agents', (agents: List<IAgentRecord>) => agents.push(agentToAdd)),
        afterPagesUpdated = afterAgentsUpdated.update('pages', (pages: List<IPageRecord>): List<IPageRecord> => {
            return pages.update(pages.findIndex((page) => page.internalId === pageInternalId),
                (page) => page.update('agentsInternalIds', (agentsInternalIds: List<string>) => agentsInternalIds.push(agentInternalId))
            )
        });

    return afterPagesUpdated;
}

export function getAgentByInaternalId(internalId: string, alvisProject: IAlvisProjectRecord): IAgentRecord {
    return alvisProject.agents.find((agent) => agent.internalId === internalId);
}

export function deleteAgentFromAlvisProject(agent: IAgentRecord, pageInternalId: string, alvisProject: IAlvisProjectRecord): IAlvisProjectRecord {
    let afterAgentPortsRemoved = alvisProject;
    agent.portsInternalIds.forEach((port) => {
        afterAgentPortsRemoved = deletePortFromAlvisProject(port, afterAgentPortsRemoved);
    });

    const agentToDeleteInternalId = agent.internalId,
        afterAgentRemoved = afterAgentPortsRemoved.update('agents', (agents: List<IAgentRecord>) => {
            return agents.remove(agents.findIndex((agent) => agent.internalId === agentToDeleteInternalId));
        }),
        afterAgentRemovedFromPages = afterAgentRemoved.update('pages', (pages: List<IPageRecord>) => {
            return pages.update(pages.findIndex((page) => page.internalId === pageInternalId), (page) => {
                return page.update('agentsInternalIds', (agentsInternalIds) => {
                    return agentsInternalIds.remove(agentsInternalIds.findIndex((agentInternalId) => agentInternalId === agentToDeleteInternalId));
                });
            });
        });

    return afterAgentRemovedFromPages;
}

export function modifyAgentInAlvisProject(agentWithNewData: IAgentRecord, alvisProject: IAlvisProjectRecord): IAlvisProjectRecord {
    const agentInternalId = agentWithNewData.internalId,
        afterAgentUpdated = alvisProject.update('agents', (agents: List<IAgentRecord>) => {
            return agents.update(agents.findIndex((agent) => agent.internalId === agentInternalId), (agent) => {
                return agentWithNewData;
            })
        });

    return afterAgentUpdated;
}

export function deletePortFromAlvisProject(portInternalId: string, alvisProject: IAlvisProjectRecord): IAlvisProjectRecord {
    const afterPortRemoved = alvisProject.update('ports', (ports: List<IPortRecord>) => {
        return ports.remove(ports.findIndex((port: IPortRecord) => port.internalId === portInternalId));
    }),
        relatedAgent = afterPortRemoved.agents.find((agent: IAgentRecord) => agent.portsInternalIds.contains(portInternalId)),
        afterAgentUpdated = afterPortRemoved.update('agents', (agents: List<IAgentRecord>) => {
            return agents.update(agents.findIndex((agent) => agent.internalId === relatedAgent.internalId), (agent) => {
                return agent.update('portsInternalIds', (portsInternalIds: List<string>) => {
                    return portsInternalIds.remove(agent.portsInternalIds.findIndex((portInternalId) => portInternalId === portInternalId));
                });
            });
        }),
        afterConnectionsUpdated = deleteConnectionsReletedToPortFromAlvisProject(portInternalId, alvisProject);

    return afterConnectionsUpdated;
}

export function deleteConnectionsReletedToPortFromAlvisProject(portInternalId: string, alvisProject: IAlvisProjectRecord): IAlvisProjectRecord {
    const afterConnectionsRemoved = alvisProject.update('connections', (connections: List<IConnectionRecord>) => {
        return connections.filter((connection) =>
            connection.sourcePortInternalId === portInternalId || connection.targetPortInternalId === portInternalId);
    });

    return afterConnectionsRemoved;
}


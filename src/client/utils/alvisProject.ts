import {
    alvisProjectRecordFactory, IAlvisProjectRecord,
    pageRecordFactory, IPageRecord,
    agentRecordFactory, IAgentRecord,
    portRecordFactory, IPortRecord,
    connectionRecordFactory, IConnectionRecord,
    alvisCodeRecordFactory, IAlvisCodeRecord,
    ConnectionDirection,
    IAlvisProject,
    IInternalRecord,
    IAgent,
    IConnection
} from "../models/alvisProject";
import { List } from 'immutable';

export function getValidEmptyAlvisProject(): IAlvisProjectRecord {
    return alvisProjectRecordFactory({
        pages: List<IPageRecord>([
            pageRecordFactory({
                internalId: '0',
                name: 'System',
                agentsInternalIds: List<string>(),
                subPagesInternalIds: List<string>(),
                supAgentInternalId: null,
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

// ABSTRACT --------------------------------------------

type AlvisProjectKeysLeadingToLists = 'pages' | 'agents' | 'ports' | 'connections';

function getRecord(alvisProject: IAlvisProjectRecord) {
    return (recordInternalId: string, key: AlvisProjectKeysLeadingToLists): IInternalRecord => {
        const records: List<IInternalRecord> = alvisProject[key],
            recordIndex = getListElementIndexWithInternalId(records)(recordInternalId),
            record = records.get(recordIndex);

        return record;
    }
}

function addRecord(alvisProject: IAlvisProjectRecord) {
    return (record: IInternalRecord, key: AlvisProjectKeysLeadingToLists): IAlvisProjectRecord => {
        const projectWithAddedRecord = alvisProject.update(key, (records: List<IInternalRecord>) =>
            records.push(record));

        return projectWithAddedRecord;
    }
}

function changeRecord(alvisProject: IAlvisProjectRecord) {
    return (record: IInternalRecord, key: AlvisProjectKeysLeadingToLists): IAlvisProjectRecord => {
        const projectWithChangedRecord = alvisProject.update(key, (records: List<IInternalRecord>) =>
            updateListElement(records)(record));

        return projectWithChangedRecord;
    }
}

function deleteRecord(alvisProject: IAlvisProjectRecord) {
    return (recordInternalId: string, key: AlvisProjectKeysLeadingToLists): IAlvisProjectRecord => {
        const projectWithDeletedRecord = alvisProject.update(key, (records: List<IInternalRecord>) => {
            const recordIndex = getListElementIndexWithInternalId(records)(recordInternalId);

            if (recordIndex === -1) {
                return records;
            }

            return records.delete(recordIndex);
        });

        return projectWithDeletedRecord;
    }
}

function updateListElement<T extends IInternalRecord | IInternalRecord>(elements: List<T>) {
    return (elementToUpdate: T): List<T> => {
        return elements.update(
            elements.findIndex((element) => element.internalId === elementToUpdate.internalId),
            (): T => elementToUpdate
        );
    }
}

function updateListElementWithInternalId<T extends IInternalRecord | IInternalRecord>(elements: List<T>) {
    return (elementInternalId: string, modifier: (elem: T) => T): List<T> => {
        return elements.update(elements.findIndex((element) => element.internalId === elementInternalId), (element): T => {
            return modifier(element);
        });
    }
}

function deleteListElementWithInternalId<T extends IInternalRecord>(elements: List<T>) {
    return (elementInternalId: string): List<T> => {
        const elementToDeleteIndex = getListElementIndexWithInternalId(elements)(elementInternalId);

        if (elementToDeleteIndex === -1) {
            return elements;
        }

        return elements.delete(elementToDeleteIndex);
    }
}

function getListElementIndexWithInternalId<T extends IInternalRecord>(elements: List<T>) {
    return (elementInternalId: string): number => {
        return elements.findIndex((element) => element.internalId === elementInternalId);
    }
}

function getListElementIndexWithFn<T>(elements: List<T>) {
    return (predicate: (element: T) => boolean): number => {
        return elements.findIndex(predicate);
    }
}

export function getListElementByInternalId<T extends IInternalRecord>(elements: List<T>, internalId: string): T | null {
    const elementIndex = getListElementIndexWithInternalId(elements)(internalId);

    return elementIndex === -1 ? null : elements.get(elementIndex);
}

// PAGE --------------------------------------------

export const addPageToAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (newPage: IPageRecord): IAlvisProjectRecord => {
        const afterPageAddedToProject = addRecord(alvisProject)(newPage, 'pages'),
            supAgent = <IAgentRecord>getRecord(alvisProject)(newPage.supAgentInternalId, 'agents'),
            afterAddedToSupPage = assignSubPageToPage(afterPageAddedToProject)(newPage.internalId, supAgent.pageInternalId),
            afterAssignedToAgent = assignSubPageToAgent(afterAddedToSupPage)(supAgent, newPage.internalId);

        return afterAssignedToAgent;
    }

export const modifyPageInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (modifiedPage: IPageRecord): IAlvisProjectRecord => {
        const afterPageModified = changeRecord(alvisProject)(modifiedPage, 'pages');

        return afterPageModified;
    }

export const deletePageInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (pageToDeleteInternalId: string): IAlvisProjectRecord => {
        const afterPageRemovedFromSupPage = removeSubPageFromPage(alvisProject)(pageToDeleteInternalId),
            afterPageRemovedFromAgent = removeSubPageFromAgent(afterPageRemovedFromSupPage)(pageToDeleteInternalId),
            page = <IPageRecord>getRecord(afterPageRemovedFromAgent)(pageToDeleteInternalId, 'pages');

        let afterPageAgentsRemoved = afterPageRemovedFromAgent;
        page.agentsInternalIds.forEach((agentInternalId) => {
            afterPageAgentsRemoved = deleteAgentInAlvisProject(afterPageAgentsRemoved)(agentInternalId);
        })

        const afterPageRemoved = deleteRecord(afterPageAgentsRemoved)(pageToDeleteInternalId, 'pages');

        return afterPageRemoved;
    }

const assignSubPageToAgent = (alvisProject: IAlvisProjectRecord) =>
    (supAgent: IAgentRecord, pageInternalId: string): IAlvisProjectRecord => {
        const agentWithPageAssigned = supAgent.set('subPageInternalId', pageInternalId),
            updatedProject = changeRecord(alvisProject)(agentWithPageAssigned, 'agents');

        return updatedProject;
    }

// const removeSubPageFromAgent = (alvisProject: IAlvisProjectRecord) =>
//     (supAgent: IAgentRecord, pageInternalId: string): IAlvisProjectRecord => {
//         const agentWithPageAssigned = supAgent.set('subPageInternalId', pageInternalId),
//             updatedProject = changeRecord(alvisProject)(agentWithPageAssigned, 'agents');

//         return updatedProject;
//     }

const assignSubPageToPage = (alvisProject: IAlvisProjectRecord) =>
    (subPageInternalId: string, pageInternalId: string): IAlvisProjectRecord => {
        const page = <IPageRecord>getRecord(alvisProject)(pageInternalId, 'pages'),
            pageWithSubPageAdded = page.update('subPagesInternalIds',
                (subPagesInternalIds) => subPagesInternalIds.push(subPageInternalId)),
            updatedProject = changeRecord(alvisProject)(pageWithSubPageAdded, 'pages');

        return updatedProject;
    }

const removeSubPageFromPage = (alvisProject: IAlvisProjectRecord) =>
    (subPageInternalId: string): IAlvisProjectRecord => {
        const supPage = getPageSupPage(alvisProject)(subPageInternalId),
            subPageInternalIdIndex = getListElementIndexWithFn(supPage.subPagesInternalIds)((id) => id === subPageInternalId),
            pageWithRemovedSubPage = supPage.update('subPagesInternalIds',
                (subPagesInternalIds) => subPageInternalIdIndex !== -1
                    ? subPagesInternalIds.delete(subPageInternalIdIndex)
                    : subPagesInternalIds),
            updatedProject = changeRecord(alvisProject)(pageWithRemovedSubPage, 'pages');

        return updatedProject;
    }

const removeSubPageFromAgent = (alvisProject: IAlvisProjectRecord) =>
    (subPageInternalId: string): IAlvisProjectRecord => {
        const pageAgent = getPageAgent(alvisProject)(subPageInternalId),
            pageAgentWithRemovedSubPage = pageAgent.set('subPageInternalId', null),
            updatedProject = changeRecord(alvisProject)(pageAgentWithRemovedSubPage, 'agents');

        return updatedProject;
    }

const getPageAgent = (alvisProject: IAlvisProjectRecord) =>
    (pageInternalId: string): IAgentRecord => {
        const agents = alvisProject.agents,
            pageAgentIndex = getListElementIndexWithFn(agents)((agent) => agent.subPageInternalId === pageInternalId),
            pageAgent = agents.get(pageAgentIndex);

        return pageAgent;
    }

const getPageSupPage = (alvisProject: IAlvisProjectRecord) =>
    (subPageInternalId: string): IPageRecord => {
        const subPageAgent = getPageAgent(alvisProject)(subPageInternalId),
            supPageInternalId = subPageAgent.pageInternalId,
            supPageRecord = <IPageRecord>getRecord(alvisProject)(supPageInternalId, 'pages');

        return supPageRecord;
    }

const assignAgentToPage = (alvisProject: IAlvisProjectRecord) =>
    (agentInternalId: string, pageInternalId: string): IAlvisProjectRecord => {
        const page = <IPageRecord>getRecord(alvisProject)(pageInternalId, 'pages'),
            pageWithAgentAssigned = page.update('agentsInternalIds', (agentsInternalIds) => agentsInternalIds.push(agentInternalId)),
            updatedProject = changeRecord(alvisProject)(pageWithAgentAssigned, 'pages');

        return updatedProject;
    }

const removeAgentFromPage = (alvisProject: IAlvisProjectRecord) =>
    (agentInternalId: string): IAlvisProjectRecord => {
        const agentPage = getAgentPage(alvisProject)(agentInternalId),
            agentInternalIdToRemoveIndex = getListElementIndexWithFn(agentPage.agentsInternalIds)((id) => id === agentInternalId),
            pageWithRemovedAgent = agentPage.update('agentsInternalIds',
                (agentsInternalIds) => agentInternalIdToRemoveIndex !== -1
                    ? agentsInternalIds.delete(agentInternalIdToRemoveIndex)
                    : agentsInternalIds),
            updatedProject = changeRecord(alvisProject)(pageWithRemovedAgent, 'pages');

        return updatedProject;
    }

// AGENT --------------------------------------------

export const addAgentToAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (newAgent: IAgentRecord): IAlvisProjectRecord => {
        const afterAgentAddedToProject = addRecord(alvisProject)(newAgent, 'agents'),
            afterAgentAssignedToPage = assignAgentToPage(afterAgentAddedToProject)(newAgent.internalId, newAgent.pageInternalId);

        return afterAgentAssignedToPage;
    }

export const modifyAgentInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (modifiedAgent: IAgentRecord): IAlvisProjectRecord => {
        const afterAgentModified = changeRecord(alvisProject)(modifiedAgent, 'agents');

        return afterAgentModified;
    }

export const deleteAgentInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (agentToDeleteInternalId: string): IAlvisProjectRecord => {
        const afterConnectionsRemoved = deleteAgentPortsConnections(alvisProject)(agentToDeleteInternalId),
            afterPortsRemoved = deleteAgentPorts(afterConnectionsRemoved)(agentToDeleteInternalId),
            afterAgentRemovedFromPage = removeAgentFromPage(afterPortsRemoved)(agentToDeleteInternalId),
            afterAgentRemoved = deleteRecord(afterAgentRemovedFromPage)(agentToDeleteInternalId, 'agents');

        return afterAgentRemoved;
    }

// TO DO: delete agent subpage
// export const deleteAgentSubPageIfExists = (alvisProject: IAlvisProjectRecord) =>
//     (agent: IAgentRecord): IAlvisProjectRecord => {
//         const afterConnectionsRemoved = deleteAgentPortsConnections(alvisProject)(agentToDeleteInternalId),
//             afterPortsRemoved = deleteAgentPorts(afterConnectionsRemoved)(agentToDeleteInternalId),
//             afterAgentRemovedFromPage = removeAgentFromPage(afterPortsRemoved)(agentToDeleteInternalId),
//             afterAgentRemoved = deleteRecord(afterAgentRemovedFromPage)(agentToDeleteInternalId, 'agents');

//         return afterAgentRemoved;
//     }

const deleteAgentPorts = (alvisProject: IAlvisProjectRecord) =>
    (agentInternalId: string): IAlvisProjectRecord => {
        const agent = <IAgentRecord>getRecord(alvisProject)(agentInternalId, 'agents'),
            agentPortsInternalIds = agent.portsInternalIds;

        let afterPortsDeleted = alvisProject;
        agentPortsInternalIds.forEach((portInternalId) => {
            afterPortsDeleted = deleteRecord(afterPortsDeleted)(portInternalId, 'ports');
        });

        return afterPortsDeleted;
    }

const deleteAgentPortsConnections = (alvisProject: IAlvisProjectRecord) =>
    (agentInternalId: string): IAlvisProjectRecord => {
        const agent = <IAgentRecord>getRecord(alvisProject)(agentInternalId, 'agents'),
            agentPortsInternalIds = agent.portsInternalIds;

        let afterPortsConnectionsDeleted = alvisProject;
        agentPortsInternalIds.forEach((portInternalId) => {
            afterPortsConnectionsDeleted = deletePortConnections(afterPortsConnectionsDeleted)(portInternalId);
        });

        return afterPortsConnectionsDeleted;
    }

const assignPortToAgent = (alvisProject: IAlvisProjectRecord) =>
    (portInternalId: string, agentInternalId: string): IAlvisProjectRecord => {
        const agent = <IAgentRecord>getRecord(alvisProject)(agentInternalId, 'agents'),
            agentWithPortAssigned = agent.update('portsInternalIds', (portsInternalIds) => portsInternalIds.push(portInternalId)),
            updatedProject = changeRecord(alvisProject)(agentWithPortAssigned, 'agents');

        return updatedProject;
    }

const removePortFromAgent = (alvisProject: IAlvisProjectRecord) =>
    (portInternalId: string): IAlvisProjectRecord => {
        const portAgent = getPortAgent(alvisProject)(portInternalId),
            agentPortsInternalIds: List<string> = portAgent.get('portsInternalIds'),
            portToRemoveIndex = getListElementIndexWithFn(agentPortsInternalIds)((id) => id === portInternalId),
            agentWithRemovedPort = portAgent.set('portsInternalIds', portToRemoveIndex !== -1
                ? agentPortsInternalIds.delete(portToRemoveIndex)
                : agentPortsInternalIds),
            updatedProject = changeRecord(alvisProject)(agentWithRemovedPort, 'agents');

        return updatedProject;
    }

const getAgentPage = (alvisProject: IAlvisProjectRecord) =>
    (agentInternalId: string): IPageRecord => {
        const pages = alvisProject.pages,
            pageIndex = getListElementIndexWithFn(pages)((page) => page.agentsInternalIds.contains(agentInternalId)),
            page = pages.get(pageIndex);

        return page;
    }

// PORT ---------------------------------------------

export const addPortToAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (newPort: IPortRecord): IAlvisProjectRecord => {
        const afterPortAddedToProject = addRecord(alvisProject)(newPort, 'ports'),
            afterPortAssignedToAgent = assignPortToAgent(afterPortAddedToProject)(newPort.internalId, newPort.agentInternalId);

        return afterPortAssignedToAgent;
    }

export const modifyPortInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (modifiedPort: IPortRecord): IAlvisProjectRecord => {
        const afterPortModified = changeRecord(alvisProject)(modifiedPort, 'ports');

        return afterPortModified;
    }

export const deletePortInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (portToDeleteInternalId: string): IAlvisProjectRecord => {
        const afterPortDeleted = deleteRecord(alvisProject)(portToDeleteInternalId, 'ports'),
            afterPortRemovedFromAgent = removePortFromAgent(afterPortDeleted)(portToDeleteInternalId),
            afterPortConnectionsDeleted = deletePortConnections(afterPortRemovedFromAgent)(portToDeleteInternalId);

        return afterPortConnectionsDeleted;
    }

const deletePortConnections = (alvisProject: IAlvisProjectRecord) =>
    (portInternalId: string): IAlvisProjectRecord => {
        const portConnections = getPortAllConnections(alvisProject)(portInternalId);

        let afterPortConnectionsDeleted = alvisProject;
        portConnections.forEach((portConnection) => {
            afterPortConnectionsDeleted = deleteRecord(afterPortConnectionsDeleted)(portConnection.internalId, 'connections');
        })

        return afterPortConnectionsDeleted;
    }

export const getPortAgent = (alvisProject: IAlvisProjectRecord) =>
    (portInternalId: string): IAgentRecord => {
        const agents = alvisProject.agents,
            agentIndex = getListElementIndexWithFn(agents)((agent) => agent.portsInternalIds.contains(portInternalId)),
            agent = agents.get(agentIndex);

        return agent;
    }

const getPortAllConnections = (alvisProject: IAlvisProjectRecord) =>
    (portInternalId: string): List<IConnectionRecord> => {
        const connections = alvisProject.connections,
            portConnections = connections.filter((connection) =>
                connection.sourcePortInternalId === portInternalId || connection.targetPortInternalId === portInternalId).toList();

        return portConnections;
    }

// CONNECTION ---------------------------------------------

export const addConnectionToAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (newConnection: IConnectionRecord): IAlvisProjectRecord => {
        return addRecord(alvisProject)(newConnection, 'connections');
    };

export const modifyConnectionInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (modifiedConnection: IConnection): IAlvisProjectRecord => {
        const afterConnectionModified = changeRecord(alvisProject)(modifiedConnection, 'connections');

        return afterConnectionModified;
    }

export const deleteConnectionInAlvisProject = (alvisProject: IAlvisProjectRecord) =>
    (connectionToDeleteInternalId: string): IAlvisProjectRecord => {
        const afterConnectionDeleted = deleteRecord(alvisProject)(connectionToDeleteInternalId, 'connections');

        return afterConnectionDeleted;
    }

export function deleteConnectionsReletedToPortFromAlvisProject(portInternalId: string, alvisProject: IAlvisProjectRecord): IAlvisProjectRecord {
    const afterConnectionsRemoved = alvisProject.update('connections', (connections: List<IConnectionRecord>) => {
        return connections.filter((connection) =>
            connection.sourcePortInternalId === portInternalId || connection.targetPortInternalId === portInternalId);
    });

    return afterConnectionsRemoved;
}

// --------------------------------------------------------------

export default {
    agents: {
        add: addAgentToAlvisProject,
        modify: modifyAgentInAlvisProject,
        delete: deleteAgentInAlvisProject,
    },
    pages: {
        add: addPageToAlvisProject,
        modify: modifyPageInAlvisProject,
        delete: deletePageInAlvisProject,
    },
    ports: {
        add: addPortToAlvisProject,
        modify: modifyPortInAlvisProject,
        delete: deletePortInAlvisProject,
    },
    connections: {
        add: addConnectionToAlvisProject,
        modify: modifyConnectionInAlvisProject,
        delete: deleteConnectionInAlvisProject,
    },
}



// ----------------------------------------------

export function getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean): T | null {
    const elementIndex = elements.findIndex(fn),
        element = elementIndex !== -1 ? elements.get(elementIndex) : null;

    return element;
}

export function getSystemPage(pages: List<IPageRecord>): IPageRecord | null {
    return this.getElementByFn(pages, (page) => page.name === 'System'); // TO DO: extract "System" as constant in some config
}
import {
  alvisProjectRecordFactory,
  IAlvisProjectRecord,
  pageRecordFactory,
  IPageRecord,
  agentRecordFactory,
  IAgentRecord,
  portRecordFactory,
  IPortRecord,
  connectionRecordFactory,
  IConnectionRecord,
  alvisCodeRecordFactory,
  IAlvisCodeRecord,
  ConnectionDirection,
  IAlvisProject,
  IIdentifiableElement,
  IAgent,
  IConnection,
  IInternalId,
  IAlvisElementTag,
  IAlvisElementRecord,
  IInternalRecord,
} from '../models/alvisProject';
import { List, Stack, Set, Map } from 'immutable';
import {
  IProjectModificationRecord,
  IProjectRecord,
  projectModificationRecordFactory,
  projectModificationRecordFactoryPartial,
  IOppositeModifications,
  IOppositeModificationsRecord,
} from '../models/project';
import { separateBy } from './separateBy';

export function getValidEmptyAlvisProject(): IAlvisProjectRecord {
  return alvisProjectRecordFactory({
    pages: Map([
      [
        '0',
        pageRecordFactory({
          internalId: '0',
          name: 'System',
          agentsInternalIds: Set(),
          subPagesInternalIds: Set(),
          supAgentInternalId: null,
        }),
      ],
    ]),
    agents: Map(),
    ports: Map(),
    connections: Map(),
    code: alvisCodeRecordFactory({
      text: '',
    }),
  });
}

// ABSTRACT --------------------------------------------

export const getElementById = <T extends IInternalRecord>(
  list: Map<string, T>,
  id: string,
): T => list.get(id);

export type AlvisProjectKeysLeadingToElements =
  | 'pages'
  | 'agents'
  | 'ports'
  | 'connections';

export function getRecord(alvisProject: IAlvisProjectRecord) {
  return (
    recordInternalId: string,
    key: AlvisProjectKeysLeadingToElements,
  ): IIdentifiableElement => {
    const records = alvisProject[key];

    return records.get(recordInternalId);
  };
}

function addPageRecord(alvisProject: IAlvisProjectRecord) {
  return (page: IPageRecord): IAlvisProjectRecord =>
    alvisProject.setIn(['pages', page.internalId], page);
}

function addAgentRecord(alvisProject: IAlvisProjectRecord) {
  return (agent: IAgentRecord): IAlvisProjectRecord =>
    alvisProject.setIn(['agents', agent.internalId], agent);
}

function addPortRecord(alvisProject: IAlvisProjectRecord) {
  return (port: IPortRecord): IAlvisProjectRecord =>
    alvisProject.setIn(['ports', port.internalId], port);
}

// TODO: not used (currently)
function addConnectionRecord(alvisProject: IAlvisProjectRecord) {
  return (connection: IConnectionRecord): IAlvisProjectRecord =>
    alvisProject.setIn(['connections', connection.internalId], connection);
}

const changeRecord = (project: IAlvisProjectRecord) => (
  record: IIdentifiableElement,
  key: AlvisProjectKeysLeadingToElements,
): IAlvisProjectRecord => project.setIn([key, record.internalId], record);

function deleteRecord<K extends AlvisProjectKeysLeadingToElements>(
  project: IAlvisProjectRecord,
) {
  return (recordId: string, key: K): IAlvisProjectRecord => {
    const recordExists = !!project[key].get(recordId);

    if (!recordExists) {
      throw new Error(
        `Internal error! Record does not exist! - record of id ${recordId} from ${key}`,
      );
    }

    return project.deleteIn([key, recordId]);
  };
}

function getListElementIndexWithInternalId<T extends IIdentifiableElement>(
  elements: List<T>,
) {
  return (elementInternalId: string): number => {
    return elements.findIndex(
      (element) => element.internalId === elementInternalId,
    );
  };
}

export function getListElementByInternalId<T extends IIdentifiableElement>(
  elements: List<T>,
  internalId: string,
): T | null {
  const elementIndex = getListElementIndexWithInternalId(elements)(internalId);

  return elementIndex === -1 ? null : elements.get(elementIndex);
}

////////////////////////////////////////////////////
// refactor functions - remove above functions
////////////////////////////////////////////////////

//
//
//
//
//
//

export const addOppositeModifications = (project: IProjectRecord) => (
  oppositeModifications: IOppositeModificationsRecord,
): IProjectRecord => {
  const oppositeModificationsCurrentIndex =
    project.oppositeModificationCurrentIdx;
  const oppositeModificationsWithoutRedos = project.oppositeModifications.slice(
    0,
    oppositeModificationsCurrentIndex + 1,
  );
  const oppositeModificationsWithNewOne = oppositeModificationsWithoutRedos.push(
    oppositeModifications,
  );
  const newOppositeModificationCurrentIdx =
    oppositeModificationsWithNewOne.size - 1;

  return project.merge({
    oppositeModifications: oppositeModificationsWithNewOne,
    oppositeModificationCurrentIdx: newOppositeModificationCurrentIdx,
  });
};

// TODO: I think that better name is popAntimofification
export const shiftAntiModifications = (
  project: IProjectRecord,
  isUndo: boolean,
): [IProjectRecord, IOppositeModificationsRecord] => {
  const idx = project.oppositeModificationCurrentIdx;

  if (
    (isUndo && idx === -1) ||
    (!isUndo && idx === project.oppositeModifications.size - 1)
  ) {
    return [project, null];
  }

  const oppositeModificationsCurrentIdxNext =
    project.oppositeModificationCurrentIdx + (isUndo ? -1 : 1);

  const oppositeModificationIdx = isUndo
    ? idx
    : oppositeModificationsCurrentIdxNext;
  const oppositeModifications = project.oppositeModifications.get(
    oppositeModificationIdx,
  );

  const projectWithUpdatedIdx = project.merge({
    oppositeModificationCurrentIdx: oppositeModificationsCurrentIdxNext,
  });

  return [projectWithUpdatedIdx, oppositeModifications];
};

export const applyModification = (project: IAlvisProjectRecord) => (
  fullModification: IProjectModificationRecord,
): IAlvisProjectRecord => {
  let finalProject = project;

  const { agents, connections, pages, ports } = fullModification;

  let anythingChanged = false;

  let pagesToAddNow: List<IPageRecord> = null;
  let pagesToAddLater = pages.added;
  let pagesToModifyNow: List<IPageRecord> = null;
  let pagesToModifyLater = pages.modified;
  let pagesToDeleteNow: List<string> = null;
  let pagesToDeleteLater = pages.deleted;

  let agentsToAddNow: List<IAgentRecord> = null;
  let agentsToAddLater = agents.added;
  let agentsToModifyNow: List<IAgentRecord> = null;
  let agentsToModifyLater = agents.modified;
  let agentsToDeleteNow: List<string> = null;
  let agentsToDeleteLater = agents.deleted;

  let portsToAddNow: List<IPortRecord> = null;
  let portsToAddLater = ports.added;
  let portsToModifyNow: List<IPortRecord> = null;
  let portsToModifyLater = ports.modified;
  let portsToDeleteNow: List<string> = null;
  let portsToDeleteLater = ports.deleted;

  let connectionsToAddNow: List<IConnectionRecord> = null;
  let connectionsToAddLater = connections.added;
  let connectionsToModifyNow: List<IConnectionRecord> = null;
  let connectionsToModifyLater = connections.modified;
  let connectionsToDeleteNow: List<string> = null;
  let connectionsToDeleteLater = connections.deleted;

  do {
    anythingChanged = false;

    [pagesToAddNow, pagesToAddLater] = separateBy(
      pagesToAddLater,
      canPageBeAdded(finalProject),
    );
    [pagesToModifyNow, pagesToModifyLater] = separateBy(
      pagesToModifyLater,
      canPageBeModified(finalProject),
    );
    [pagesToDeleteNow, pagesToDeleteLater] = separateBy(
      pagesToDeleteLater,
      canPageBeDeleted(finalProject),
    );

    [agentsToAddNow, agentsToAddLater] = separateBy(
      agentsToAddLater,
      canAgentBeAdded(finalProject),
    );
    [agentsToModifyNow, agentsToModifyLater] = separateBy(
      agentsToModifyLater,
      canAgentBeModified(finalProject),
    );
    [agentsToDeleteNow, agentsToDeleteLater] = separateBy(
      agentsToDeleteLater,
      canAgentBeDeleted(finalProject),
    );

    [portsToAddNow, portsToAddLater] = separateBy(
      portsToAddLater,
      canPortBeAdded(finalProject),
    );
    [portsToModifyNow, portsToModifyLater] = separateBy(
      portsToModifyLater,
      canPortBeModified(finalProject),
    );
    [portsToDeleteNow, portsToDeleteLater] = separateBy(
      portsToDeleteLater,
      canPortBeDeleted(finalProject),
    );

    [connectionsToAddNow, connectionsToAddLater] = separateBy(
      connectionsToAddLater,
      canConnectionBeAdded(finalProject),
    );
    [connectionsToModifyNow, connectionsToModifyLater] = separateBy(
      connectionsToModifyLater,
      canConnectionBeModified(finalProject),
    );
    [connectionsToDeleteNow, connectionsToDeleteLater] = separateBy(
      connectionsToDeleteLater,
      canConnectionBeDeleted(finalProject),
    );

    pagesToAddNow.forEach((page) => {
      finalProject = addPageToAlvisProject(finalProject)(page);
      anythingChanged = true;
    });
    agentsToAddNow.forEach((agent) => {
      finalProject = addAgentToAlvisProject(finalProject)(agent);
      anythingChanged = true;
    });
    portsToAddNow.forEach((port) => {
      finalProject = addPortToAlvisProject(finalProject)(port);
      anythingChanged = true;
    });
    connectionsToAddNow.forEach((connection) => {
      finalProject = addConnectionToAlvisProject(finalProject)(connection);
      anythingChanged = true;
    });

    pagesToModifyNow.forEach((page) => {
      finalProject = modifyPageInAlvisProject(finalProject)(page);
      anythingChanged = true;
    });
    agentsToModifyNow.forEach((agent) => {
      finalProject = modifyAgentInAlvisProject(finalProject)(agent);
      anythingChanged = true;
    });
    portsToModifyNow.forEach((port) => {
      finalProject = modifyPortInAlvisProject(finalProject)(port);
      anythingChanged = true;
    });
    connectionsToModifyNow.forEach((connection) => {
      finalProject = modifyConnectionInAlvisProject(finalProject)(connection);
      anythingChanged = true;
    });

    agentsToDeleteNow.forEach((agentId) => {
      finalProject = deleteAgentInAlvisProject(finalProject)(agentId);
      anythingChanged = true;
    });
    pagesToDeleteNow.forEach((pageId) => {
      finalProject = deletePageInAlvisProject(finalProject)(pageId);
      anythingChanged = true;
    });
    portsToDeleteNow.forEach((portId) => {
      finalProject = deletePortInAlvisProject(finalProject)(portId);
      anythingChanged = true;
    });
    connectionsToDeleteNow.forEach((connectionId) => {
      finalProject = deleteConnectionInAlvisProject(finalProject)(connectionId);
      anythingChanged = true;
    });
  } while (anythingChanged);

  // TODO: currently, when deleting, during each deletion we manage internal data such us supPageInternalId
  // this means that when we delete whole page we process unnecessarily e.g. agent's data while deleting port
  // in future it should be improved - maybe it would be worth to consider specialized functions
  // such as deletePage which would deal with it without IProjectModification?

  // TODO: @up - this might be simplified if we start storing data in tree structure (?)
  // TODO: what about storing each page elements in separate record? So that page record has agents,ports,connections inside (?)

  return finalProject;
};

//
//
//
//
//
//

// TODO: isn't this whole semi -> full modification idea a bit overkill?
// user usually performs actions only on one page
// TODO: check performance

// TODO: how to indicate copying? Maybe by adding records with elements which already exists?
// id in record which is being added would mean that we want to copy it. It might be nice idea.
// what about moving then? Moving agent from one page to another? And so on.
// We need to think about it!

// TODO: More thoughts on copying: I think that the best possibility (most efficient) is to enable modifications to modify
// also internal parts like agentsInternalIds from Page record
// we may also create special record for modifications or something
// Page {
//    agentsMoved
// }
// Or maybe add `move` modification type to IProjectModification?

// TODO: maybe not semiModification but roughModification?

// NEW
// TODO: Definitely think about shorter names for interfaces
// TODO: Maybe we should purify records here, not during applying modification ???
export function generateFullModification(
  semiModification: IProjectModificationRecord,
  alvisProject: IAlvisProjectRecord,
): IProjectModificationRecord {
  // TODO: What if someone tries to add page to page which was deleted?
  // should we consider such cases? Do we want it to be THAT bulletproof?
  const allPagesDeleted = getAllPagesDeleted(semiModification, alvisProject);
  const allPagesDeletedInternalIds = allPagesDeleted.map((el) => el.internalId);
  // TODO: this is interesting: we may (1) pass `allPagesDeleted` to getAllAgentsDeleted
  // or we may (2) memoize getAllPagesDeleted and use it again in `getAllAgentsDeleted` to make code simpler to read
  // yet as efficient as in first way
  const allAgentsDeleted = getAllAgentsDeleted(semiModification, alvisProject);
  const allAgentsDeletedInternalIds = allAgentsDeleted.map(
    (el) => el.internalId,
  );

  const allConnectionsDeleted = getAllConnectionsDeleted(
    semiModification,
    alvisProject,
  );
  const allConnectionsDeletedInternalIds = allConnectionsDeleted.map(
    (el) => el.internalId,
  );

  const allPortsDeleted = getAllPortsDeleted(semiModification, alvisProject);
  const allPortsDeletedInternalIds = allPortsDeleted.map((el) => el.internalId);

  const allPagesModified = semiModification.pages.modified.filter(
    (page) => !allPagesDeletedInternalIds.contains(page.internalId),
  );
  const allAgentsModified = semiModification.agents.modified.filter(
    (agent) => !allAgentsDeletedInternalIds.contains(agent.internalId),
  );
  const allPortsModified = semiModification.ports.modified.filter(
    (port) => !allPortsDeletedInternalIds.contains(port.internalId),
  );
  const allConnectionsModified = semiModification.connections.modified.filter(
    (connection) =>
      !allConnectionsDeletedInternalIds.contains(connection.internalId),
  );

  const allPagesAdded = semiModification.pages.added.filter(
    (page) => !allAgentsDeletedInternalIds.contains(page.supAgentInternalId), // TODO: is it enough? what if agent have never existed (never will be in allAgentsDeletedInternalIds)
  );
  const allAgentsAdded = semiModification.agents.added.filter(
    (agent) => !allPagesDeletedInternalIds.contains(agent.pageInternalId),
  );
  const allPortsAdded = semiModification.ports.added.filter(
    (port) => !allAgentsDeletedInternalIds.contains(port.agentInternalId),
  );
  const allConnectionsAdded = semiModification.connections.added.filter(
    (connection) =>
      !allPortsDeletedInternalIds.contains(connection.sourcePortInternalId) &&
      !allPortsDeletedInternalIds.contains(connection.targetPortInternalId),
  );

  return projectModificationRecordFactoryPartial({
    pages: {
      added: allPagesAdded, // TODO: I wonder, do we really need lists. Wouldn't it be more comfortable to store Itereble<> or something similar?
      // Check differences between `List` and `Iterable`.
      // After some time: I didn't check it but we should remember that the general type the better in this case
      modified: allPagesModified,
      deleted: allPagesDeletedInternalIds,
    },
    agents: {
      added: allAgentsAdded,
      modified: allAgentsModified,
      deleted: allAgentsDeletedInternalIds,
    },
    ports: {
      added: allPortsAdded,
      modified: allPortsModified,
      deleted: allPortsDeletedInternalIds,
    },
    connections: {
      added: allConnectionsAdded,
      modified: allConnectionsModified,
      deleted: allConnectionsDeletedInternalIds,
    },
  });
}

export function generateAntiModification(
  semiModification: IProjectModificationRecord,
  alvisProject: IAlvisProjectRecord,
): IProjectModificationRecord {
  // TODO: implement memoization
  const fullModification = generateFullModification(
    semiModification,
    alvisProject,
  );

  // TODO: rewrite this section to make it more readable
  return projectModificationRecordFactoryPartial({
    pages: {
      added: fullModification.pages.deleted.map(getPageById(alvisProject)),
      modified: fullModification.pages.modified.map((el) =>
        getPageById(alvisProject)(el.internalId),
      ),
      deleted: fullModification.pages.added.map((el) => el.internalId),
    },
    agents: {
      added: fullModification.agents.deleted.map(getAgentById(alvisProject)),
      modified: fullModification.agents.modified.map((el) =>
        getAgentById(alvisProject)(el.internalId),
      ),
      deleted: fullModification.agents.added.map((el) => el.internalId),
    },
    ports: {
      added: fullModification.ports.deleted.map(getPortById(alvisProject)),
      modified: fullModification.ports.modified.map((el) =>
        getPortById(alvisProject)(el.internalId),
      ),
      deleted: fullModification.ports.added.map((el) => el.internalId),
    },
    connections: {
      added: fullModification.connections.deleted.map(
        getConnectionById(alvisProject),
      ),
      modified: fullModification.connections.modified.map((el) =>
        getConnectionById(alvisProject)(el.internalId),
      ),
      deleted: fullModification.connections.added.map((el) => el.internalId),
    },
  });
}

export function getAllAgentsDeleted(
  semiModification: IProjectModificationRecord,
  alvisProject: IAlvisProjectRecord,
): List<IAgentRecord> {
  // TODO: Later implement memoization
  const allPagesDeleted = getAllPagesDeleted(semiModification, alvisProject);
  const deletedPagesAgentsIds = allPagesDeleted
    .map((page) => page.agentsInternalIds)
    .flatten(true);
  const deletedPagesAgents = deletedPagesAgentsIds.map(
    getAgentById(alvisProject),
  );
  const deletedAgentsIds = semiModification.agents.deleted;
  const deletedAgents = deletedAgentsIds.map(getAgentById(alvisProject));

  return deletedPagesAgents
    .concat(deletedAgents)
    .toSet()
    .toList();
}

export function getAllPortsDeleted(
  semiModification: IProjectModificationRecord,
  alvisProject: IAlvisProjectRecord,
): List<IPortRecord> {
  // TODO: Later implement memoization
  const allAgentsDeleted = getAllAgentsDeleted(semiModification, alvisProject);
  const deletedAgentsPortsIds = allAgentsDeleted
    .map((agent) => agent.portsInternalIds)
    .flatten(true);
  const deletedAgentsPorts = deletedAgentsPortsIds.map(
    getPortById(alvisProject),
  );
  const deletedPortsIds = semiModification.ports.deleted;
  const deletedPorts = deletedPortsIds.map(getPortById(alvisProject));

  return deletedAgentsPorts
    .concat(deletedPorts)
    .toSet()
    .toList();
}

export function getAllConnectionsDeleted(
  semiModification: IProjectModificationRecord,
  alvisProject: IAlvisProjectRecord,
): List<IConnectionRecord> {
  // TODO: Later implement memoization
  // TODO: read more about storing data in normalized structures - I think we should store in port record
  // list of connections' ids
  const allPortsDeleted = getAllPortsDeleted(semiModification, alvisProject);
  const allPortsDeletedIds = allPortsDeleted.map((el) => el.internalId);
  const deletedPortConnections = alvisProject.connections
    .toList()
    .filter(
      (connection) =>
        allPortsDeletedIds.contains(connection.sourcePortInternalId) ||
        allPortsDeletedIds.contains(connection.targetPortInternalId),
    );
  const deletedConnectionsIds = semiModification.connections.deleted.filter(
    (connectionId) => alvisProject.connections.has(connectionId), // TODO: we filter because mxGraph triggers deletion of edge after it triggers deletion of agent
    // refers to @up - so we have 1) modification (deletes agent so it deletes connection too), 2) modification which deletes only connection 
    // current solution is not good solution to problem, I guess...
  );
  const deletedConnections = deletedConnectionsIds.map(
    getConnectionById(alvisProject),
  );

  return deletedPortConnections
    .concat(deletedConnections)
    .toSet()
    .toList();
}

export function getAllPagesDeleted(
  semiModification: IProjectModificationRecord,
  alvisProject: IAlvisProjectRecord,
): List<IPageRecord> {
  const deletedPagesIds = semiModification.pages.deleted;
  const deletedAgentsIds = semiModification.agents.deleted;
  const deletedPages = deletedPagesIds.map(getPageById(alvisProject));
  const deletedPagesAllSubpages = <List<IPageRecord>>deletedPagesIds
    .map(getPageAllSubpages(alvisProject))
    .flatten(true); // TODO: flatten returns type: Iterable<any, any> --- change to something with better types
  const deletedAgentsAllSubpages = <List<IPageRecord>>deletedAgentsIds
    .map(getAgentAllSubpages(alvisProject))
    .flatten(true);

  // TODO: I guess we are not deleting duplicates, we may use set, or something,
  // we should also check it in tests
  return deletedPages.concat(deletedPagesAllSubpages, deletedAgentsAllSubpages);
}

export const getPageById = (alvisProject: IAlvisProjectRecord) => (
  internalId: IInternalId,
): IPageRecord => {
  return getElementByInternalId(alvisProject)(internalId, 'pages');
};

// TODO: check: why there is no need for casting it to IAgentRecord? It seems that TS is quite smart...
export const getAgentById = (alvisProject: IAlvisProjectRecord) => (
  internalId: IInternalId,
): IAgentRecord => {
  return getElementByInternalId(alvisProject)(internalId, 'agents');
};

// TODO: maybe we can generate methods: getPageById, getAgentById, get...
// would it be clear enough for other programmers?
export const getPortById = (alvisProject: IAlvisProjectRecord) => (
  internalId: IInternalId,
): IPortRecord => {
  return getElementByInternalId(alvisProject)(internalId, 'ports');
};

export const getConnectionById = (alvisProject: IAlvisProjectRecord) => (
  internalId: IInternalId,
): IConnectionRecord => {
  return getElementByInternalId(alvisProject)(internalId, 'connections');
};

// prettier-ignore
export const getElementByInternalId = (project: IAlvisProjectRecord) => <T extends IAlvisElementRecord>(
  id: IInternalId,
  elementTag: IAlvisElementTag,
): T => {
  return project.getIn([elementTag, id])
};

const getAgentAllSubpages = (alvisProject: IAlvisProjectRecord) => (
  agentId: IInternalId,
): List<IPageRecord> => {
  const agent = getAgentById(alvisProject)(agentId);
  const agentDirectSubpageId = agent.subPageInternalId; // TODO: I got agent as undefined - because of some bad modification - should we try/catch ?

  if (!agentDirectSubpageId) {
    return List();
  }

  const agentDirectSubpage = getPageById(alvisProject)(agentDirectSubpageId);
  const agentDirectSubpageAllSubpages = getPageAllSubpages(alvisProject)(
    agentDirectSubpageId,
  );

  return agentDirectSubpageAllSubpages.push(agentDirectSubpage);
};

const getPageAllSubpages = (alvisProject: IAlvisProjectRecord) => (
  pageId: IInternalId,
): List<IPageRecord> => {
  // Shouldn't it be a set?
  const page = getPageById(alvisProject)(pageId);
  const directSubpagesIds = page.subPagesInternalIds;
  const directSubpages = directSubpagesIds
    .toList()
    .map(getPageById(alvisProject));
  const directSubpagesAllSubpages = <List<IPageRecord>>directSubpages
    .map((page) => page.subPagesInternalIds)
    .flatten()
    .map(getPageAllSubpages(alvisProject))
    .flatten();

  return directSubpages.concat(directSubpagesAllSubpages);
};

//
//
//
//
//
//
// PAGE --------------------------------------------

// TODO: change name to addPage() and distinguish between adding only page record to map by naming other function addPageRecord
export const addPageToAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  newPage: IPageRecord,
): IAlvisProjectRecord => {
  const afterPageAddedToProject = addPageRecord(alvisProject)(
    purifyPage(newPage),
  );
  const supAgent = <IAgentRecord>getRecord(alvisProject)(
    newPage.supAgentInternalId,
    'agents',
  );
  const afterAddedToSupPage = assignSubPageToPage(afterPageAddedToProject)(
    newPage.internalId,
    supAgent.pageInternalId,
  );
  const afterAssignedToAgent = assignSubPageToAgent(afterAddedToSupPage)(
    supAgent,
    newPage.internalId,
  );

  return afterAssignedToAgent;
};

export const modifyPageInAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  modifiedPage: IPageRecord,
): IAlvisProjectRecord => {
  const oldPage = getElementById(alvisProject.pages, modifiedPage.internalId);
  const newPage = modifiedPage
    .set('agentsInternalIds', oldPage.agentsInternalIds)
    .set('supAgentInternalId', oldPage.supAgentInternalId) // TODO: are we sure? (are *we* sure XD)
    .set('subPagesInternalIds', oldPage.subPagesInternalIds);
  const afterPageModified = changeRecord(alvisProject)(newPage, 'pages'); // TODO: assure that you do not modify internal data such as subPagesInternalIds

  return afterPageModified;
};

export const deletePageInAlvisProject = (project: IAlvisProjectRecord) => (
  pageToDeleteId: string,
): IAlvisProjectRecord => {
  const afterPageRemovedFromSupPage = unassignPageFromSupPage(project)(
    pageToDeleteId,
  );
  const afterPageRemovedFromAgent = removeSubPageFromAgent(
    afterPageRemovedFromSupPage,
  )(pageToDeleteId);
  const page = <IPageRecord>getRecord(afterPageRemovedFromAgent)(
    pageToDeleteId,
    'pages',
  );

  // let afterPageAgentsRemoved = afterPageRemovedFromAgent;
  // TODO: Assume that when deleting a page all page's agents should be deleted
  if (!page.agentsInternalIds.isEmpty()) {
    throw new Error('Page has agents assigned and cannot be deleted!');
  }

  const afterPageRemoved = deleteRecord(afterPageRemovedFromAgent)(
    pageToDeleteId,
    'pages',
  );

  return afterPageRemoved;
};

const assignSubPageToAgent = (project: IAlvisProjectRecord) => (
  supAgent: IAgentRecord,
  pageId: string,
): IAlvisProjectRecord => {
  if (supAgent.subPageInternalId) {
    // TODO: implement handling of such error somewhere
    throw new Error('Agent already has subpage; cannot add another one!');
  }

  return project.setIn(
    ['agents', supAgent.internalId, 'subPageInternalId'],
    pageId,
  );
};

const assignSubPageToPage = (project: IAlvisProjectRecord) => (
  subPageId: string,
  pageId: string,
): IAlvisProjectRecord => {
  if (false) {
    throw new Error('no page with given internalId - in assignSubPageToPage');
  }

  return project.mergeIn(['pages', pageId, 'subPagesInternalIds'], [subPageId]);
};

const unassignPageFromSupPage = (project: IAlvisProjectRecord) => (
  pageId: string,
): IAlvisProjectRecord => {
  const supPage = getPageSupPage(project)(pageId);
  const supPageId = supPage.internalId;

  return project.deleteIn(['pages', supPageId, 'subPagesInternalIds', pageId]);
};

// TODO: rename
const removeSubPageFromAgent = (project: IAlvisProjectRecord) => (
  subPageId: string,
): IAlvisProjectRecord => {
  const agent = getPageAgent(project)(subPageId);
  const agentId = agent.internalId;

  return project.setIn(['agents', agentId, 'subPageInternalId'], null);
};

const getPageAgent = (project: IAlvisProjectRecord) => (
  pageId: string,
): IAgentRecord => {
  const { agents, pages } = project;
  const page = pages.get(pageId);
  const supAgentId = page.supAgentInternalId;
  const supAgent = agents.get(supAgentId);

  return supAgent;
};

const getPageSupPage = (project: IAlvisProjectRecord) => (
  pageId: string,
): IPageRecord => {
  const { pages } = project;
  const supAgent = getPageAgent(project)(pageId);
  const supPageId = supAgent.pageInternalId;
  const supPage = pages.get(supPageId);

  return supPage;
};

const assignAgentToPage = (project: IAlvisProjectRecord) => (
  agentId: string,
  pageId: string,
): IAlvisProjectRecord => {
  if (false) {
    throw new Error('no page with given internalId - in assignAgentToPage');
  }

  return project.mergeIn(['pages', pageId, 'agentsInternalIds'], [agentId]);
};

const removeAgentFromPage = (project: IAlvisProjectRecord) => (
  agentId: string,
): IAlvisProjectRecord => {
  const { agents } = project;
  const agent = agents.get(agentId);
  const pageId = agent.pageInternalId;

  if (false) {
    throw new Error('Internal error! Agent is not assigned to page!');
  }

  return project.deleteIn(['pages', pageId, 'agentsInternalIds', agentId]);
};

// AGENT --------------------------------------------

// TODO: TODO: TODO: rename `project` to `diagram` - it should be more accurate
// NOOOOOO!!!!!!!!!!!!!!! it has `code` inside :/
export const addAgentToAlvisProject = (project: IAlvisProjectRecord) => (
  agent: IAgentRecord,
): IAlvisProjectRecord => {
  const { internalId: agentId, pageInternalId: pageId } = agent;
  const purifiedAgent = purifyAgent(agent);
  let modifiedProject = project;

  modifiedProject = addAgentRecord(modifiedProject)(purifiedAgent);
  modifiedProject = assignAgentToPage(modifiedProject)(agentId, pageId);

  return modifiedProject;
};

// TODO: change na to more descriptive one, which would suggest that it should not modify such things as agent's page ID
export const modifyAgentInAlvisProject = (
  alvisProject: IAlvisProjectRecord,
) => (modifiedAgent: IAgentRecord): IAlvisProjectRecord => {
  const oldAgent = alvisProject.agents.get(modifiedAgent.internalId);
  const newAgent = modifiedAgent
    .set('pageInternalId', oldAgent.pageInternalId)
    .set('portsInternalIds', oldAgent.portsInternalIds)
    .set('subPageInternalId', oldAgent.subPageInternalId);
  const afterAgentModified = changeRecord(alvisProject)(newAgent, 'agents');

  return afterAgentModified;
};

export const deleteAgentInAlvisProject = (project: IAlvisProjectRecord) => (
  agentId: string,
): IAlvisProjectRecord => {
  const { agents } = project;
  const agent = getElementById(agents, agentId);
  const agentHasPorts = !agent.portsInternalIds.isEmpty();
  const agentHasSubpage = !!agent.subPageInternalId;

  // TODO: we should delete agents/pages in particular order in applyModification fn.
  // if (agentHasPorts || agentHasSubpage) {
  //   throw new Error(
  //     'Internal error! Cannot delete agent - it has some ports or subpage!',
  //   );
  // }

  const afterAgentRemovedFromPage = removeAgentFromPage(project)(agentId);
  const afterAgentRemoved = deleteRecord(afterAgentRemovedFromPage)(
    agentId,
    'agents',
  );

  return afterAgentRemoved;
};

// TODO: this method should go to PORTS part, because agents can exist without ports not the other way around
// later: @up is it valid argument (~)
const assignPortToAgent = (project: IAlvisProjectRecord) => (
  portId: string,
  agentId: string,
): IAlvisProjectRecord => {
  if (false) {
    throw new Error('Internal error! Port does not exist on agent!');
  }

  return project.mergeIn(['agents', agentId, 'portsInternalIds'], [portId]);
};

const removePortFromAgent = (alvisProject: IAlvisProjectRecord) => (
  portId: string,
): IAlvisProjectRecord => {
  // TODO: what about sequential updates in Immutable.js ??
  // Sequential ???
  const { ports } = alvisProject;
  const port = ports.get(portId);
  const agentId = port.agentInternalId;

  if (false) {
    // TODO: check it here - should we?
    throw new Error('Internal error! Port does not exist on agent!'); // TODO: Internal error, because it should exists - we just found agent with this port above!
  }

  return alvisProject.deleteIn(['agents', agentId, 'portsInternalIds', portId]);
};

const getAgentPage = (project: IAlvisProjectRecord) => (
  agentId: string,
): IPageRecord => {
  const { agents, pages } = project;
  const agent = agents.get(agentId);
  const pageId = agent.pageInternalId;
  const page = pages.get(pageId);

  return page;
};

// PORT ---------------------------------------------

export const addPortToAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  newPort: IPortRecord,
): IAlvisProjectRecord => {
  const afterPortAddedToProject = addPortRecord(alvisProject)(
    purifyPort(newPort),
  );
  const afterPortAssignedToAgent = assignPortToAgent(afterPortAddedToProject)(
    newPort.internalId,
    newPort.agentInternalId,
  );

  return afterPortAssignedToAgent;
};

// TODO: similar methods exist for page, agent etc. - we should make one method or smth.
// TODO: we are passing whole modified record, maybe better idea would be to pass only data we want to change with ID ?
// it might be good idea in context of editing same diagram by many people - less data conflicts to resolve
export const modifyPortInAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  modifiedPort: IPortRecord,
): IAlvisProjectRecord => {
  const afterPortModified = changeRecord(alvisProject)(modifiedPort, 'ports');

  return afterPortModified;
};

export const deletePortInAlvisProject = (project: IAlvisProjectRecord) => (
  portId: string,
): IAlvisProjectRecord => {
  const afterPortRemovedFromAgent = removePortFromAgent(project)(portId);
  const afterPortDeleted = deleteRecord(afterPortRemovedFromAgent)(
    portId,
    'ports',
  );

  return afterPortDeleted;
};

// CONNECTION ---------------------------------------------

export const addConnectionToAlvisProject = (project: IAlvisProjectRecord) => (
  newConnection: IConnectionRecord,
): IAlvisProjectRecord => {
  const newConnectionPurified = purifyConnection(newConnection);

  if (false) {
    // TODO: check if ports exist etc. - or maybe we have already checked this in generateFullModification or in applyModification ???
    throw new Error('addConnectionToAlvisProject: error!');
  }

  return project.setIn(
    ['connections', newConnection.internalId],
    newConnectionPurified,
  );
};

export const modifyConnectionInAlvisProject = (
  project: IAlvisProjectRecord,
) => (modifiedConnection: IConnection): IAlvisProjectRecord => {
  const connectionId = modifiedConnection.internalId;
  const connectionExists = project.connections.has(connectionId);

  if (!connectionExists) {
    // TODO: check if ports exists etc.
    throw new Error('modifyConnectionInAlvisProject: connection not found!');
  }

  return project.setIn(['connections', connectionId], modifiedConnection);
};

export const deleteConnectionInAlvisProject = (
  // TODO: shorten name by 'InAlvisProject'
  project: IAlvisProjectRecord, // TODO: maybe we should call it system (not project, or alvisProject) ???
) => (connectionId: string): IAlvisProjectRecord => {
  const connectionExists = project.connections.has(connectionId);

  if (!connectionExists) {
    throw new Error('deleteConnectionInAlvisProject: connection not found!');
  }

  return project.deleteIn(['connections', connectionId]);
};

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
};

// ----------------------------------------------

export function getElementByFn<T>(
  elements: List<T>,
  fn: (element: T) => boolean,
): T | null {
  const elementIndex = elements.findIndex(fn);
  const element = elementIndex !== -1 ? elements.get(elementIndex) : null;

  return element;
}

export function getSystemPage(pages: List<IPageRecord>): IPageRecord | null {
  return this.getElementByFn(pages, (page) => page.name === 'System'); // TO DO: extract "System" as constant in some config
}

function purifyPort(port: IPortRecord): IPortRecord {
  let purifiedPort = port;

  // purifiedPort = purifiedPort.remove('internalId');
  // purifiedPort = purifiedPort.remove('agentInternalId');

  return purifiedPort;
}

// export interface IPort extends IInternalRecord {
//   readonly agentInternalId: string;
//   readonly name: string;
//   readonly x: number;
//   readonly y: number;
//   readonly color: string;
//   // readonly connectionsInternalIds: List<string>,
// }

function purifyAgent(agent: IAgentRecord): IAgentRecord {
  let purifiedAgent = agent;

  // purifiedAgent = purifiedAgent.remove('internalId');
  // purifiedAgent = purifiedAgent.remove('pageInternalId');
  purifiedAgent = purifiedAgent.remove('portsInternalIds');
  purifiedAgent = purifiedAgent.remove('subPageInternalId');

  return purifiedAgent;
}
// export interface IAgent extends IInternalRecord {
//   readonly internalId: string; // TO DO: if it extends IInternalRecord it is not necessary to redefne internalId field here.
//   readonly pageInternalId: string;
//   readonly subPageInternalId: string;
//   readonly name: string;
//   readonly portsInternalIds: List<string>;
//   readonly index: string;
//   readonly active: number; // TO DO: maybe boolean
//   readonly running: number; // TO DO: maybe boolean
//   readonly height: number;
//   readonly width: number;
//   readonly x: number;
//   readonly y: number;
//   readonly color: string;
// }

function purifyConnection(connection: IConnectionRecord): IConnectionRecord {
  let purifiedConnection = connection;

  // purifiedConnection = purifiedConnection.remove('internalId');

  return purifiedConnection;
}
// export interface IConnection extends IInternalRecord {
//   readonly internalId: string;
//   readonly direction: ConnectionDirection;
//   readonly sourcePortInternalId: string;
//   readonly targetPortInternalId: string;
//   readonly style: string;
// }

function purifyPage(page: IPageRecord): IPageRecord {
  let purifiedPage = page;

  // purifiedPage = purifiedPage.remove('internalId');
  purifiedPage = purifiedPage.remove('agentsInternalIds');
  purifiedPage = purifiedPage.remove('subPagesInternalIds');
  // purifiedPage = purifiedPage.remove('supAgentInternalId'); // TODO: this also?

  return purifiedPage;
}
// export interface IPage extends IInternalRecord {
//   readonly internalId: string;
//   readonly name: string;
//   readonly agentsInternalIds: List<string>;
//   readonly subPagesInternalIds: List<string>;
//   readonly supAgentInternalId: string;    // For first page it is set to `null`
//   // readonly connectionsInternalIds: List<string>,
// }

const canPageBeAdded = (project: IAlvisProject) => (page: IPageRecord) =>
  project.agents.has(page.supAgentInternalId);

const canPageBeDeleted = (project: IAlvisProject) => (pageId: string) => {
  const page = project.pages.get(pageId);

  return page && page.agentsInternalIds.isEmpty();
};

const canPageBeModified = (project: IAlvisProject) => (page: IPageRecord) =>
  project.pages.has(page.internalId);

const canAgentBeAdded = (project: IAlvisProject) => (agent: IAgentRecord) =>
  project.pages.has(agent.pageInternalId);

const canAgentBeDeleted = (project: IAlvisProject) => (agentId: string) => {
  const agent = project.agents.get(agentId);

  return (
    agent &&
    agent.portsInternalIds.isEmpty() &&
    agent.subPageInternalId === null
  );
};

const canAgentBeModified = (project: IAlvisProject) => (agent: IAgentRecord) =>
  project.agents.has(agent.internalId);

const canPortBeAdded = (project: IAlvisProject) => (port: IPortRecord) =>
  project.agents.has(port.agentInternalId);

const canPortBeDeleted = (project: IAlvisProject) => (portId: string) => {
  return project.connections.every(
    (connection) =>
      connection.sourcePortInternalId !== portId &&
      connection.targetPortInternalId !== portId,
  );
};

const canPortBeModified = (project: IAlvisProject) => (port: IPortRecord) =>
  project.ports.has(port.internalId);

const canConnectionBeAdded = (project: IAlvisProject) => (
  connection: IConnectionRecord,
) =>
  project.ports.has(connection.sourcePortInternalId) &&
  project.ports.has(connection.targetPortInternalId);

const canConnectionBeDeleted = (project: IAlvisProject) => (
  connectionId: string,
) => true;

const canConnectionBeModified = (project: IAlvisProject) => (
  connection: IConnectionRecord,
) => project.connections.has(connection.internalId);

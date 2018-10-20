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
import { List, Stack, Set } from 'immutable';
import {
  IProjectModificationRecord,
  IProjectRecord,
  projectModificationRecordFactory,
  projectModificationRecordFactoryPartial,
  IOppositeModifications,
  IOppositeModificationsRecord,
} from '../models/project';

export function getValidEmptyAlvisProject(): IAlvisProjectRecord {
  return alvisProjectRecordFactory({
    pages: List<IPageRecord>([
      pageRecordFactory({
        internalId: '0',
        name: 'System',
        agentsInternalIds: List<string>(),
        subPagesInternalIds: List<string>(),
        supAgentInternalId: null,
      }),
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

export const getRecordByInternalId = <T extends IInternalRecord>(
  list: List<T>,
  internalId: string,
): T => list.find((el) => el.internalId === internalId);

export type AlvisProjectKeysLeadingToLists =
  | 'pages'
  | 'agents'
  | 'ports'
  | 'connections';

export function getRecord(alvisProject: IAlvisProjectRecord) {
  return (
    recordInternalId: string,
    key: AlvisProjectKeysLeadingToLists,
  ): IIdentifiableElement => {
    const records: List<IIdentifiableElement> = alvisProject[key];
    const recordIndex = getListElementIndexWithInternalId(records)(
      recordInternalId,
    );
    const record = records.get(recordIndex);

    return record;
  };
}

function addPageRecord(alvisProject: IAlvisProjectRecord) {
  return (page: IPageRecord): IAlvisProjectRecord =>
    alvisProject.update('pages', (pages) => pages.push(page));
}

function addAgentRecord(alvisProject: IAlvisProjectRecord) {
  return (agent: IAgentRecord): IAlvisProjectRecord =>
    alvisProject.update('agents', (pages) => pages.push(agent));
}

function addPortRecord(alvisProject: IAlvisProjectRecord) {
  return (port: IPortRecord): IAlvisProjectRecord =>
    alvisProject.update('ports', (ports) => ports.push(port));
}

function addConnectionRecord(alvisProject: IAlvisProjectRecord) {
  return (connection: IConnectionRecord): IAlvisProjectRecord =>
    alvisProject.update('connections', (connections) =>
      connections.push(connection),
    );
}

function changeRecord(alvisProject: IAlvisProjectRecord) {
  return (
    record: IIdentifiableElement,
    key: AlvisProjectKeysLeadingToLists,
  ): IAlvisProjectRecord => {
    const projectWithChangedRecord = alvisProject.update(
      key,
      (records: List<any>) => updateListElement(records)(record),
    );

    return projectWithChangedRecord;
  };
}

function deleteRecord<K extends AlvisProjectKeysLeadingToLists>(
  alvisProject: IAlvisProjectRecord,
) {
  return (recordInternalId: string, key: K): IAlvisProjectRecord => {
    const projectWithDeletedRecord = alvisProject.update<K>(key, (records) => {
      const recordIndex = getListElementIndexWithInternalId(records)(
        recordInternalId,
      );

      if (recordIndex === -1) {
        return records;
      }

      return records.delete(recordIndex);
    });

    return projectWithDeletedRecord;
  };
}

function updateListElement<T extends IInternalRecord>(elements: List<T>) {
  return (elementToUpdate: T): List<T> => {
    return elements.update(
      elements.findIndex(
        (element) => element.internalId === elementToUpdate.internalId,
      ),
      (): T => elementToUpdate,
    );
  };
}

function updateListElementWithInternalId<
  T extends IIdentifiableElement | IIdentifiableElement
>(elements: List<T>) {
  return (elementInternalId: string, modifier: (elem: T) => T): List<T> => {
    return elements.update(
      elements.findIndex((element) => element.internalId === elementInternalId),
      (element): T => {
        return modifier(element);
      },
    );
  };
}

function deleteListElementWithInternalId<T extends IIdentifiableElement>(
  elements: List<T>,
) {
  return (elementInternalId: string): List<T> => {
    const elementToDeleteIndex = getListElementIndexWithInternalId(elements)(
      elementInternalId,
    );

    if (elementToDeleteIndex === -1) {
      return elements;
    }

    return elements.delete(elementToDeleteIndex);
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

function getListElementIndexWithFn<T>(elements: List<T>) {
  return (predicate: (element: T) => boolean): number => {
    return elements.findIndex(predicate);
  };
}

export function getListElementByInternalId<T extends IIdentifiableElement>(
  elements: List<T>,
  internalId: string,
): T | null {
  const elementIndex = getListElementIndexWithInternalId(elements)(internalId);

  return elementIndex === -1 ? null : elements.get(elementIndex);
}

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

export const applyModification = (alvisProject: IAlvisProjectRecord) => (
  fullModification: IProjectModificationRecord,
): IAlvisProjectRecord => {
  let finalProject = alvisProject;

  // TODO: currently, when deleting, during each deletion we manage internal data such us supPageInternalId
  // this means that when we delete whole page we process unnecessarily e.g. agent's data while deleting port
  // in future it should be improved - maybe it would be worth to consider specialized functions
  // such as deletePage which would deal with it without IProjectModification?
  fullModification.connections.deleted.forEach((connectionInternalId) => {
    // TODO: shorten names such as deleteConnectionInAlvisProject
    // to something like deleteConnection
    finalProject = deleteConnectionInAlvisProject(finalProject)(
      connectionInternalId,
    );
  });
  fullModification.ports.deleted.forEach((portInternalId) => {
    finalProject = deletePortInAlvisProject(finalProject)(portInternalId);
  });
  fullModification.agents.deleted.forEach((agentInternalId) => {
    finalProject = deleteAgentInAlvisProject(finalProject)(agentInternalId);
  });
  fullModification.pages.deleted.forEach((agentInternalId) => {
    finalProject = deletePageInAlvisProject(finalProject)(agentInternalId);
  });

  fullModification.pages.added.forEach((page) => {
    finalProject = addPageToAlvisProject(finalProject)(page);
    // TODO: what about adding subpages of page which is also being added?
    // we can add more pages with preset internalIds
    // but then we must care about order of new pages and agents if we want
    // to check possible errors in functions responsible for adding elements
  }); // TODO: IMPORTANT - what if page is subpage of agent which is being added !!!!!!!!!!!!!!!!!! Then we should add agent before adding page
  fullModification.agents.added.forEach((agent) => {
    finalProject = addAgentToAlvisProject(finalProject)(agent);
  });
  fullModification.ports.added.forEach((port) => {
    finalProject = addPortToAlvisProject(finalProject)(port);
  });
  fullModification.connections.added.forEach((connection) => {
    finalProject = addConnectionToAlvisProject(finalProject)(connection);
  });

  fullModification.pages.modified.forEach((page) => {
    finalProject = modifyPageInAlvisProject(finalProject)(page);
    // TODO: what about adding subpages of page which is also being added?
    // we can add more pages with preset internalIds
    // but then we must care about order of new pages and agents if we want
    // to check possible errors in functions responsible for adding elements
  });
  fullModification.agents.modified.forEach((agent) => {
    finalProject = modifyAgentInAlvisProject(finalProject)(agent);
  });
  fullModification.ports.modified.forEach((port) => {
    finalProject = modifyPortInAlvisProject(finalProject)(port);
  });
  fullModification.connections.modified.forEach((connection) => {
    finalProject = modifyConnectionInAlvisProject(finalProject)(connection);
  });

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
  const deletedPortConnections = alvisProject.connections.filter(
    (connection) =>
      allPortsDeletedIds.contains(connection.sourcePortInternalId) ||
      allPortsDeletedIds.contains(connection.targetPortInternalId),
  );
  const deletedConnectionsIds = semiModification.connections.deleted;
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
export const getElementByInternalId = (alvisProject: IAlvisProjectRecord) => <T extends IAlvisElementRecord>(
  internalId: IInternalId,
  elementTag: IAlvisElementTag,
): T => {
  return (alvisProject[elementTag] as List<T>).find(
    (element) => element.internalId === internalId,
  );
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
  const directSubpages = directSubpagesIds.map(getPageById(alvisProject));
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
  const oldPage = getRecordByInternalId(
    alvisProject.pages,
    modifiedPage.internalId,
  );
  const newPage = modifiedPage
    .set('agentsInternalIds', oldPage.agentsInternalIds)
    .set('supAgentInternalId', oldPage.supAgentInternalId) // TODO: are we sure?
    .set('subPagesInternalIds', oldPage.subPagesInternalIds);
  const afterPageModified = changeRecord(alvisProject)(newPage, 'pages'); // TODO: assure that you do not modify internal data such as subPagesInternalIds

  return afterPageModified;
};

export const deletePageInAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  pageToDeleteInternalId: string,
): IAlvisProjectRecord => {
  const afterPageRemovedFromSupPage = removeSubPageFromPage(alvisProject)(
    pageToDeleteInternalId,
  );
  const afterPageRemovedFromAgent = removeSubPageFromAgent(
    afterPageRemovedFromSupPage,
  )(pageToDeleteInternalId);
  const page = <IPageRecord>getRecord(afterPageRemovedFromAgent)(
    pageToDeleteInternalId,
    'pages',
  );

  // let afterPageAgentsRemoved = afterPageRemovedFromAgent;
  // TODO: Assume that when deleting a page all page's agents should be deleted
  if (!page.agentsInternalIds.isEmpty()) {
    throw new Error('Page has agents, page cannot be deleted!');
  }
  // TODO: delete this:
  // page.agentsInternalIds.forEach((agentInternalId) => {
  //   afterPageAgentsRemoved = deleteAgentInAlvisProject(afterPageAgentsRemoved)(
  //     agentInternalId,
  //   );
  // });

  const afterPageRemoved = deleteRecord(afterPageRemovedFromAgent)(
    pageToDeleteInternalId,
    'pages',
  );

  return afterPageRemoved;
};

const assignSubPageToAgent = (alvisProject: IAlvisProjectRecord) => (
  supAgent: IAgentRecord,
  pageInternalId: string,
): IAlvisProjectRecord => {
  if (supAgent.subPageInternalId) {
    // TODO: implement handling of such error somewhere
    throw new Error('Agent already has subpage; cannot add another one!');
  }

  const agentWithPageAssigned = supAgent.set(
    'subPageInternalId',
    pageInternalId,
  );
  const updatedProject = changeRecord(alvisProject)(
    agentWithPageAssigned,
    'agents',
  );

  return updatedProject;
};

// const removeSubPageFromAgent = (alvisProject: IAlvisProjectRecord) =>
//     (supAgent: IAgentRecord, pageInternalId: string): IAlvisProjectRecord => {
//         const agentWithPageAssigned = supAgent.set('subPageInternalId', pageInternalId),
//             updatedProject = changeRecord(alvisProject)(agentWithPageAssigned, 'agents');

//         return updatedProject;
//     }

const assignSubPageToPage = (alvisProject: IAlvisProjectRecord) => (
  subPageInternalId: string,
  pageInternalId: string,
): IAlvisProjectRecord => {
  const page = <IPageRecord>getRecord(alvisProject)(pageInternalId, 'pages');
  const pageWithSubPageAdded = page.update(
    'subPagesInternalIds',
    (subPagesInternalIds) => subPagesInternalIds.push(subPageInternalId),
  );
  const updatedProject = changeRecord(alvisProject)(
    pageWithSubPageAdded,
    'pages',
  );

  return updatedProject;
};

const removeSubPageFromPage = (alvisProject: IAlvisProjectRecord) => (
  subPageInternalId: string,
): IAlvisProjectRecord => {
  const supPage = getPageSupPage(alvisProject)(subPageInternalId);
  // TODO: we should really, REALLY simplify this logic...
  const subPageInternalIdIndex = getListElementIndexWithFn(
    supPage.subPagesInternalIds,
  )((id) => id === subPageInternalId);
  const pageWithRemovedSubPage = supPage.update(
    'subPagesInternalIds',
    (subPagesInternalIds) =>
      subPageInternalIdIndex !== -1
        ? subPagesInternalIds.delete(subPageInternalIdIndex)
        : subPagesInternalIds,
  );
  const updatedProject = changeRecord(alvisProject)(
    pageWithRemovedSubPage,
    'pages',
  );

  return updatedProject;
};

const removeSubPageFromAgent = (alvisProject: IAlvisProjectRecord) => (
  subPageInternalId: string,
): IAlvisProjectRecord => {
  const pageAgent = getPageAgent(alvisProject)(subPageInternalId);
  const pageAgentWithRemovedSubPage = pageAgent.set('subPageInternalId', null);
  const updatedProject = changeRecord(alvisProject)(
    pageAgentWithRemovedSubPage,
    'agents',
  );

  return updatedProject;
};

const getPageAgent = (alvisProject: IAlvisProjectRecord) => (
  pageInternalId: string,
): IAgentRecord => {
  const agents = alvisProject.agents;
  const pageAgentIndex = getListElementIndexWithFn(agents)(
    (agent) => agent.subPageInternalId === pageInternalId,
  );
  const pageAgent = agents.get(pageAgentIndex);

  return pageAgent;
};

const getPageSupPage = (alvisProject: IAlvisProjectRecord) => (
  subPageInternalId: string,
): IPageRecord => {
  const subPageAgent = getPageAgent(alvisProject)(subPageInternalId);
  const supPageInternalId = subPageAgent.pageInternalId;
  const supPageRecord = <IPageRecord>getRecord(alvisProject)(
    supPageInternalId,
    'pages',
  );

  return supPageRecord;
};

const assignAgentToPage = (alvisProject: IAlvisProjectRecord) => (
  agentInternalId: string,
  pageInternalId: string,
): IAlvisProjectRecord => {
  const page = <IPageRecord>getRecord(alvisProject)(pageInternalId, 'pages');
  const pageWithAgentAssigned = page.update(
    'agentsInternalIds',
    (agentsInternalIds) => agentsInternalIds.push(agentInternalId),
  );
  const updatedProject = changeRecord(alvisProject)(
    pageWithAgentAssigned,
    'pages',
  );

  return updatedProject;
};

const removeAgentFromPage = (alvisProject: IAlvisProjectRecord) => (
  agentInternalId: string,
): IAlvisProjectRecord => {
  const agentPage = getAgentPage(alvisProject)(agentInternalId);
  const agentInternalIdToRemoveIndex = getListElementIndexWithFn(
    agentPage.agentsInternalIds,
  )((id) => id === agentInternalId);
  const pageWithRemovedAgent = agentPage.update(
    'agentsInternalIds',
    (agentsInternalIds) =>
      agentInternalIdToRemoveIndex !== -1
        ? agentsInternalIds.delete(agentInternalIdToRemoveIndex)
        : agentsInternalIds,
  );
  const updatedProject = changeRecord(alvisProject)(
    pageWithRemovedAgent,
    'pages',
  );

  return updatedProject;
};

// AGENT --------------------------------------------

export const addAgentToAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  newAgent: IAgentRecord,
): IAlvisProjectRecord => {
  const afterAgentAddedToProject = addAgentRecord(alvisProject)(
    purifyAgent(newAgent),
  );
  const afterAgentAssignedToPage = assignAgentToPage(afterAgentAddedToProject)(
    newAgent.internalId,
    newAgent.pageInternalId,
  );

  return afterAgentAssignedToPage;
};

// TODO: change na to more descriptive one, which would suggest that it should not modify such things as agent's page ID
export const modifyAgentInAlvisProject = (
  alvisProject: IAlvisProjectRecord,
) => (modifiedAgent: IAgentRecord): IAlvisProjectRecord => {
  const oldAgent = getRecordByInternalId(
    alvisProject.agents,
    modifiedAgent.internalId,
  );
  const newAgent = modifiedAgent
    .set('pageInternalId', oldAgent.pageInternalId)
    .set('portsInternalIds', oldAgent.portsInternalIds)
    .set('subPageInternalId', oldAgent.subPageInternalId);
  const afterAgentModified = changeRecord(alvisProject)(newAgent, 'agents');

  return afterAgentModified;
};

export const deleteAgentInAlvisProject = (
  alvisProject: IAlvisProjectRecord,
) => (agentToDeleteInternalId: string): IAlvisProjectRecord => {
  // const afterConnectionsRemoved = deleteAgentPortsConnections(alvisProject)(
  //     agentToDeleteInternalId,
  //   )
  //   const afterPortsRemoved = deleteAgentPorts(afterConnectionsRemoved)(
  //     agentToDeleteInternalId,
  //   )
  // TODO: subbpage was not being deleted in the past?
  // TODO: add checking if agent can be removed - all ports, connection, subpages were deleted
  const afterAgentRemovedFromPage = removeAgentFromPage(alvisProject)(
    agentToDeleteInternalId,
  );
  const afterAgentRemoved = deleteRecord(afterAgentRemovedFromPage)(
    agentToDeleteInternalId,
    'agents',
  );

  return afterAgentRemoved;
};

// TO DO: delete agent subpage
// export const deleteAgentSubPageIfExists = (alvisProject: IAlvisProjectRecord) =>
//     (agent: IAgentRecord): IAlvisProjectRecord => {
//         const afterConnectionsRemoved = deleteAgentPortsConnections(alvisProject)(agentToDeleteInternalId),
//             afterPortsRemoved = deleteAgentPorts(afterConnectionsRemoved)(agentToDeleteInternalId),
//             afterAgentRemovedFromPage = removeAgentFromPage(afterPortsRemoved)(agentToDeleteInternalId),
//             afterAgentRemoved = deleteRecord(afterAgentRemovedFromPage)(agentToDeleteInternalId, 'agents');

//         return afterAgentRemoved;
//     }

const deleteAgentPorts = (alvisProject: IAlvisProjectRecord) => (
  agentInternalId: string,
): IAlvisProjectRecord => {
  const agent = <IAgentRecord>getRecord(alvisProject)(
    agentInternalId,
    'agents',
  );
  const agentPortsInternalIds = agent.portsInternalIds;

  let afterPortsDeleted = alvisProject;
  agentPortsInternalIds.forEach((portInternalId) => {
    afterPortsDeleted = deleteRecord(afterPortsDeleted)(
      portInternalId,
      'ports',
    );
  });

  return afterPortsDeleted;
};

const deleteAgentPortsConnections = (alvisProject: IAlvisProjectRecord) => (
  agentInternalId: string,
): IAlvisProjectRecord => {
  const agent = <IAgentRecord>getRecord(alvisProject)(
    agentInternalId,
    'agents',
  );
  const agentPortsInternalIds = agent.portsInternalIds;

  let afterPortsConnectionsDeleted = alvisProject;
  agentPortsInternalIds.forEach((portInternalId) => {
    afterPortsConnectionsDeleted = deletePortConnections(
      afterPortsConnectionsDeleted,
    )(portInternalId);
  });

  return afterPortsConnectionsDeleted;
};

// TODO: this method should go to PORTS part, because agents can exist without ports not the other way around
const assignPortToAgent = (alvisProject: IAlvisProjectRecord) => (
  portInternalId: string,
  agentInternalId: string,
): IAlvisProjectRecord => {
  const agent = <IAgentRecord>getRecord(alvisProject)(
    agentInternalId,
    'agents',
  );
  const agentWithPortAssigned = agent.update(
    'portsInternalIds',
    (portsInternalIds) => portsInternalIds.push(portInternalId),
  );
  const updatedProject = changeRecord(alvisProject)(
    agentWithPortAssigned,
    'agents',
  );

  return updatedProject;
};

const removePortFromAgent = (alvisProject: IAlvisProjectRecord) => (
  portInternalId: string,
): IAlvisProjectRecord => {
  const portAgent = getPortAgent(alvisProject)(portInternalId);
  const agentPortsInternalIds: List<string> = portAgent.get(
    'portsInternalIds',
    List(),
  );
  const portToRemoveIndex = getListElementIndexWithFn(agentPortsInternalIds)(
    (id) => id === portInternalId,
  );
  const agentWithRemovedPort = portAgent.set(
    'portsInternalIds',
    portToRemoveIndex !== -1
      ? agentPortsInternalIds.delete(portToRemoveIndex)
      : agentPortsInternalIds,
  );
  const updatedProject = changeRecord(alvisProject)(
    agentWithRemovedPort,
    'agents',
  );

  return updatedProject;
};

const getAgentPage = (alvisProject: IAlvisProjectRecord) => (
  agentInternalId: string,
): IPageRecord => {
  const pages = alvisProject.pages;
  const pageIndex = getListElementIndexWithFn(pages)((page) =>
    page.agentsInternalIds.contains(agentInternalId),
  );
  const page = pages.get(pageIndex);

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
export const modifyPortInAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  modifiedPort: IPortRecord,
): IAlvisProjectRecord => {
  const afterPortModified = changeRecord(alvisProject)(modifiedPort, 'ports');

  return afterPortModified;
};

export const deletePortInAlvisProject = (alvisProject: IAlvisProjectRecord) => (
  portToDeleteInternalId: string,
): IAlvisProjectRecord => {
  const afterPortDeleted = deleteRecord(alvisProject)(
    portToDeleteInternalId,
    'ports',
  );
  const afterPortRemovedFromAgent = removePortFromAgent(afterPortDeleted)(
    portToDeleteInternalId,
  );
  // const afterPortConnectionsDeleted = deletePortConnections(
  //   afterPortRemovedFromAgent,
  // )(portToDeleteInternalId);

  return afterPortRemovedFromAgent;
};

const deletePortConnections = (alvisProject: IAlvisProjectRecord) => (
  portInternalId: string,
): IAlvisProjectRecord => {
  const portConnections = getPortAllConnections(alvisProject)(portInternalId);

  let afterPortConnectionsDeleted = alvisProject;
  portConnections.forEach((portConnection) => {
    afterPortConnectionsDeleted = deleteRecord(afterPortConnectionsDeleted)(
      portConnection.internalId,
      'connections',
    );
  });

  return afterPortConnectionsDeleted;
};

export const getPortAgent = (alvisProject: IAlvisProjectRecord) => (
  portInternalId: string,
): IAgentRecord => {
  const agents = alvisProject.agents;
  const agentIndex = getListElementIndexWithFn(agents)((agent) =>
    agent.portsInternalIds.contains(portInternalId),
  );
  const agent = agents.get(agentIndex);

  return agent;
};

const getPortAllConnections = (alvisProject: IAlvisProjectRecord) => (
  portInternalId: string,
): List<IConnectionRecord> => {
  const connections = alvisProject.connections;
  const portConnections = connections.filter(
    (connection) =>
      connection.sourcePortInternalId === portInternalId ||
      connection.targetPortInternalId === portInternalId,
  );

  return portConnections;
};

// CONNECTION ---------------------------------------------

export const addConnectionToAlvisProject = (
  alvisProject: IAlvisProjectRecord,
) => (newConnection: IConnectionRecord): IAlvisProjectRecord => {
  return addConnectionRecord(alvisProject)(purifyConnection(newConnection));
};

export const modifyConnectionInAlvisProject = (
  alvisProject: IAlvisProjectRecord,
) => (modifiedConnection: IConnection): IAlvisProjectRecord => {
  const afterConnectionModified = changeRecord(alvisProject)(
    modifiedConnection,
    'connections',
  );

  return afterConnectionModified;
};

export const deleteConnectionInAlvisProject = (
  alvisProject: IAlvisProjectRecord,
) => (connectionToDeleteInternalId: string): IAlvisProjectRecord => {
  const afterConnectionDeleted = deleteRecord(alvisProject)(
    connectionToDeleteInternalId,
    'connections',
  );

  return afterConnectionDeleted;
};

export function deleteConnectionsReletedToPortFromAlvisProject(
  portInternalId: string,
  alvisProject: IAlvisProjectRecord,
): IAlvisProjectRecord {
  const afterConnectionsRemoved = alvisProject.update(
    'connections',
    (connections: List<IConnectionRecord>) => {
      return connections.filter(
        (connection) =>
          connection.sourcePortInternalId === portInternalId ||
          connection.targetPortInternalId === portInternalId,
      );
    },
  );

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

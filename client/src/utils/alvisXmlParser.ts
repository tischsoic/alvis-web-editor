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
  IIdentifiableElement,
  ConnectionStyle,
} from '../models/alvisProject';
import { List, Map, Set } from 'immutable';
import { newUuid } from './uuidGenerator';

// class AlvisXmlParser {
//     constructor(private document: XMLDocument) {

//     }

//     private lastAgentId: number = -1;
//     private agentNameToInternalId: string[] = [];
//     private agentInternalIdToName: string[] = [];

//     private getAgentNameByInternalId(agentInternalId: string): string { // Maybe it should return IAgentRecord ???
//         return this.agentInternalIdToName[agentInternalId];
//     }

//     private getAgentInternalIdByName(agentName: string): string {
//         if (!this.agentNameToInternalId[agentName]) {
//             const agentNewInternalId = ++this.lastAgentId;

//             this.agentNameToInternalId[agentName] = agentNewInternalId.toString();
//             this.agentInternalIdToName[agentNewInternalId.toString()] = agentName;
//         }

//         return this.agentNameToInternalId[agentName];
//     }
// }

function getFstElementByTagName(
  root: Element | XMLDocument,
  tagName: string,
): Element {
  const elements = root ? root.getElementsByTagName(tagName) : null;
  const element = elements && elements.length === 1 ? elements.item(0) : null;

  return element;
}

function portToRecord(
  port: Element,
  internalId: string,
  agentInternalId: string,
): IPortRecord {
  return portRecordFactory({
    agentInternalId,
    internalId: internalId.toString(),
    name: port.getAttribute('name'),
    x: parseFloat(port.getAttribute('x')),
    y: parseFloat(port.getAttribute('y')),
    color: port.getAttribute('color'),
  });
}

function agentToRecord(
  agent: Element,
  internalId: string,
  portsInternalIds: Set<string>,
  pageInternalId: string,
  subPageInternalId: string,
): IAgentRecord {
  return agentRecordFactory({
    internalId,
    portsInternalIds,
    pageInternalId,
    subPageInternalId,
    name: agent.getAttribute('name'),
    index: agent.getAttribute('index'),
    active: parseInt(agent.getAttribute('active'), 10),
    running: parseInt(agent.getAttribute('running'), 10),
    color: agent.getAttribute('color'),
    height: parseFloat(agent.getAttribute('height')),
    width: parseFloat(agent.getAttribute('width')),
    x: parseFloat(agent.getAttribute('x')),
    y: parseFloat(agent.getAttribute('y')),
  });
}

function connectionToRecord(
  connection: Element,
  internalId: string,
  sourcePortInternalId: string,
  targetPortInternalId: string,
): IConnectionRecord {
  let direction: ConnectionDirection;

  const directionRough = connection.getAttribute('direction');
  if (
    directionRough === 'target' ||
    directionRough === 'source' ||
    directionRough === 'none'
  ) {
    direction = directionRough;
  } else {
    throw {
      message: 'Wrong connection tag attribute: direction!',
    };
  }

  return connectionRecordFactory({
    internalId,
    direction,
    sourcePortInternalId,
    targetPortInternalId,
    style: connection.getAttribute('style') as ConnectionStyle,
  });
}

function pageToRecord(
  page: Element,
  internalId: string,
  agentsInternalIds: Set<string>,
  connectionsInternalIds: Set<string>,
  subPagesInternalIds: Set<string>,
  supAgentInternalId: string,
): IPageRecord {
  return pageRecordFactory({
    internalId,
    agentsInternalIds,
    subPagesInternalIds,
    supAgentInternalId,
    name: page.getAttribute('name'),
  });
}

function codeToRecord(code: Element): IAlvisCodeRecord {
  return alvisCodeRecordFactory({
    text: code.textContent,
  });
}

function assignSubPagesToAgents(
  agents: List<IAgentRecord>,
  agentNameSubPageInternalId: [string, string][],
): List<IAgentRecord> {
  agentNameSubPageInternalId.forEach((nameToSubPageInternalId) => {
    const agentIndex = getAgentIndexByName(agents, nameToSubPageInternalId[0]);

    agents = agents.update(agentIndex, (agent) =>
      agent.set('subPageInternalId', nameToSubPageInternalId[1]),
    );
  });

  return agents;
}

function getAgentIndexByName(agents: List<IAgentRecord>, name: string): number {
  return agents.findIndex((agent) => agent.name === name);
}

function processHierarchyToGetPagesData(
  hierarchyElement: Element,
  supAgentInternalId: string,
  hierarchyNodeNameToInternalId: string[],
  hierarchyNodeNameToPageElement: Element[],
): IAllPagesData {
  const pageName = hierarchyElement.getAttribute('name');
  const pageInternalId = hierarchyNodeNameToInternalId[pageName];
  const pageElement = hierarchyNodeNameToPageElement[pageName];
  const pageData = getSinglePageData(
    pageElement,
    pageInternalId,
    supAgentInternalId,
  );
  const agentNameSubPageInternalId: [string, string][] = [];
  const subPagesData: IAllPagesData[] = [];

  for (let j = 0; j < hierarchyElement.children.length; j += 1) {
    const child = hierarchyElement.children[j];
    const pageName = child.getAttribute('name');
    const agentName = child.getAttribute('agent');
    // pageInternalId = hierarhyNodeNameToInternalId[pageName],
    // pageElement = hierarchyNodeNameToPageElement[pageName],
    const supAgentRecordIndex = getAgentIndexByName(pageData.agents, agentName);
    const supAgentRecord = pageData.agents.get(supAgentRecordIndex);
    const pageAndSubPagesData = processHierarchyToGetPagesData(
      child,
      supAgentRecord.internalId,
      hierarchyNodeNameToInternalId,
      hierarchyNodeNameToPageElement,
    );
    // subPageData = getSinglePageData(pageElement, pageInternalId, supAgentRecord.internalId);

    subPagesData.push(pageAndSubPagesData);
    agentNameSubPageInternalId.push([
      agentName,
      hierarchyNodeNameToInternalId[pageName],
    ]);
  }

  pageData.agents = assignSubPagesToAgents(
    pageData.agents,
    agentNameSubPageInternalId,
  );
  pageData.page = pageData.page.set(
    'subPagesInternalIds',
    Set(agentNameSubPageInternalId.map((el) => el[1])),
  );

  const allPagesData: IAllPagesData = {
    pages: List([pageData.page]),
    agents: pageData.agents,
    ports: pageData.ports,
    connections: pageData.connections,
  };
  subPagesData.forEach((subPageData) => {
    allPagesData.agents = allPagesData.agents.concat(subPageData.agents);
    allPagesData.connections = allPagesData.connections.concat(
      subPageData.connections,
    );
    allPagesData.pages = allPagesData.pages.concat(subPageData.pages);
    allPagesData.ports = allPagesData.ports.concat(subPageData.ports);
  });

  return allPagesData;
}

function getElementWithName(elements: HTMLCollectionOf<Element>, name: string) {
  for (let i = 0; i < elements.length; i += 1) {
    const element = elements[i];

    if (element.getAttribute('name') === name) {
      return element;
    }
  }

  throw {
    message: 'No Element with such name in NodeListOf',
  };
}

function getPagesData(
  hierarchyNodesElements: HTMLCollectionOf<Element>,
  pagesElements: HTMLCollectionOf<Element>,
) {
  const hierarchyNodeNameToInternalId: string[] = [];
  const hierarchyNodeNameToPageElement: Element[] = [];

  for (let i = 0; i < hierarchyNodesElements.length; i += 1) {
    const hierarchyNodeElement = hierarchyNodesElements[i];
    const hierarchyNodeName = hierarchyNodeElement.getAttribute('name');
    const pageInternalId = newUuid();

    hierarchyNodeNameToInternalId[hierarchyNodeName] = pageInternalId;
    hierarchyNodeNameToPageElement[hierarchyNodeName] = getElementWithName(
      pagesElements,
      hierarchyNodeName,
    );
  }

  const systemPageHierarchyElement = hierarchyNodesElements[0]; // The highest one - so the System - will be the first one

  return processHierarchyToGetPagesData(
    systemPageHierarchyElement,
    null,
    hierarchyNodeNameToInternalId,
    hierarchyNodeNameToPageElement,
  );
}

interface ISinglePageData {
  page: IPageRecord;
  agents: List<IAgentRecord>;
  ports: List<IPortRecord>;
  connections: List<IConnectionRecord>;
}

interface IAllPagesData {
  pages: List<IPageRecord>;
  agents: List<IAgentRecord>;
  ports: List<IPortRecord>;
  connections: List<IConnectionRecord>;
}

function getSinglePageData(
  pageElement: Element,
  pageInternalId: string,
  supAgentInternalId: string,
): ISinglePageData {
  const xmlIdToInternalId = [];
  const agents: IAgentRecord[] = [];
  const ports: IPortRecord[] = [];
  const connections: IConnectionRecord[] = [];

  const pageAgentsElements = pageElement.getElementsByTagName('agent');
  const pageConnectionsElements = pageElement.getElementsByTagName(
    'connection',
  );
  const pageAgentsInternalIds: string[] = [];
  const pageConnectionsInternalIds: string[] = [];

  for (let j = 0; j < pageAgentsElements.length; j += 1) {
    const agentElement = pageAgentsElements[j];
    const agentPortsElements = agentElement.getElementsByTagName('port');
    const agentInternalId = newUuid();
    const agentPortsInternalIds: string[] = [];

    for (let k = 0; k < agentPortsElements.length; k += 1) {
      const portElement = agentPortsElements[k];
      const portInternalId = newUuid();
      const portRecord = portToRecord(
        portElement,
        portInternalId,
        agentInternalId,
      );

      ports.push(portRecord);
      xmlIdToInternalId[portElement.getAttribute('id')] = portInternalId;
      agentPortsInternalIds.push(portInternalId);
    }

    const agentRecord = agentToRecord(
      agentElement,
      agentInternalId,
      Set(agentPortsInternalIds),
      pageInternalId,
      null, // Subpage not set!!
    );

    agents.push(agentRecord);
    pageAgentsInternalIds.push(agentInternalId);
  }

  for (let l = 0; l < pageConnectionsElements.length; l += 1) {
    const connectionElement = pageConnectionsElements[l];
    const connectionInternalId = newUuid();
    const connectionRecord = connectionToRecord(
      connectionElement,
      connectionInternalId,
      xmlIdToInternalId[connectionElement.getAttribute('source')],
      xmlIdToInternalId[connectionElement.getAttribute('target')],
    );

    connections.push(connectionRecord);
    pageConnectionsInternalIds.push(connectionInternalId);
  }

  const pageRecord = pageToRecord(
    pageElement,
    pageInternalId,
    Set(pageAgentsInternalIds),
    Set(pageConnectionsInternalIds),
    null,
    supAgentInternalId, // subPagesInternalIds not set!!
  );

  return {
    page: pageRecord,
    agents: List(agents),
    ports: List(ports),
    connections: List(connections),
  };
}

function parseAlvisProjectXML(xmlDocument: XMLDocument): IAlvisProjectRecord {
  console.log({
    doc: xmlDocument,
  });
  const alvisProject = getFstElementByTagName(xmlDocument, 'alvisproject');
  const hierarchy = getFstElementByTagName(alvisProject, 'hierarchy');
  const code = getFstElementByTagName(alvisProject, 'code');

  if (!hierarchy || !alvisProject || !code) {
    return null;
  }

  const hierarchyNodes = hierarchy.getElementsByTagName('node');
  const pages = alvisProject.getElementsByTagName('page');
  const pagesData = getPagesData(hierarchyNodes, pages);

  const alvisProjectRecord = alvisProjectRecordFactory({
    pages: listToMapWithIdsAsKeys(pagesData.pages),
    agents: listToMapWithIdsAsKeys(pagesData.agents),
    ports: listToMapWithIdsAsKeys(pagesData.ports),
    connections: listToMapWithIdsAsKeys(pagesData.connections),
    code: codeToRecord(code),
  });
  xmlDocument.getElementsByTagNameNS;

  return alvisProjectRecord;
}

function listToMapWithIdsAsKeys<T extends IIdentifiableElement>(
  list: List<T>,
): Map<string, T> {
  return list.reduce(
    (pages, page) => pages.set(page.internalId, page),
    Map<string, T>(),
  );
}

export default parseAlvisProjectXML;

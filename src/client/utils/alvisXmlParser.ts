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
} from '../models/alvisProject';
import { List, Map } from 'immutable';

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
    internalId: internalId.toString(),
    agentInternalId,
    name: port.getAttribute('name'),
    x: parseFloat(port.getAttribute('x')),
    y: parseFloat(port.getAttribute('y')),
    color: port.getAttribute('color'),
  });
}

function agentToRecord(
  agent: Element,
  internalId: string,
  portsInternalIds: List<string>,
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
    style: connection.getAttribute('style'),
  });
}

function pageToRecord(
  page: Element,
  internalId: string,
  agentsInternalIds: List<string>,
  connectionsInternalIds: List<string>,
  subPagesInternalIds: List<string>,
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
  lastInternalId: number,
  supAgentInternalId: string,
  hierarhyNodeNameToInternalId: string[],
  hierarchyNodeNameToPageElement: Element[],
): IAllPagesData {
  const pageName = hierarchyElement.getAttribute('name');
  const pageInternalId = hierarhyNodeNameToInternalId[pageName];
  const pageElement = hierarchyNodeNameToPageElement[pageName];
  const pageData = getSinglePageData(
    pageElement,
    pageInternalId,
    lastInternalId,
    supAgentInternalId,
  );
  const agentNameSubPageInternalId: [string, string][] = [];
  const subPagesData: IAllPagesData[] = [];

  lastInternalId = pageData.lastInternalId;
  for (let j = 0; j < hierarchyElement.children.length; ++j) {
    const child = hierarchyElement.children[j];
    const pageName = child.getAttribute('name');
    const agentName = child.getAttribute('agent');
    // pageInternalId = hierarhyNodeNameToInternalId[pageName],
    // pageElement = hierarchyNodeNameToPageElement[pageName],
    const supAgentRecordIndex = getAgentIndexByName(pageData.agents, agentName);
    const supAgentRecord = pageData.agents.get(supAgentRecordIndex);
    const pageAndSubPagesData = processHierarchyToGetPagesData(
      child,
      lastInternalId,
      supAgentRecord.internalId,
      hierarhyNodeNameToInternalId,
      hierarchyNodeNameToPageElement,
    );
    // subPageData = getSinglePageData(pageElement, pageInternalId, lastInternalId, supAgentRecord.internalId);

    lastInternalId = pageAndSubPagesData.lastInternalId;

    subPagesData.push(pageAndSubPagesData);
    agentNameSubPageInternalId.push([
      agentName,
      hierarhyNodeNameToInternalId[pageName],
    ]);
  }

  pageData.agents = assignSubPagesToAgents(
    pageData.agents,
    agentNameSubPageInternalId,
  );
  pageData.page = pageData.page.set(
    'subPagesInternalIds',
    List(agentNameSubPageInternalId.map((el) => el[1])),
  );

  const allPagesData: IAllPagesData = {
    pages: List([pageData.page]),
    agents: pageData.agents,
    ports: pageData.ports,
    connections: pageData.connections,
    lastInternalId,
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

function getElementWithName(elements: NodeListOf<Element>, name: string) {
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
  hierarchyNodesElements: NodeListOf<Element>,
  pagesElements: NodeListOf<Element>,
) {
  const hierarchyNodeNameToInternalId: string[] = [];
  const hierarchyNodeNameToPageElement: Element[] = [];
  let lastInternalId = -1;

  for (let i = 0; i < hierarchyNodesElements.length; i += 1) {
    const hierarchyNodeElement = hierarchyNodesElements[i];
    const hierarchyNodeName = hierarchyNodeElement.getAttribute('name');
    const pageInternalId = (++lastInternalId).toString();

    hierarchyNodeNameToInternalId[hierarchyNodeName] = pageInternalId;
    hierarchyNodeNameToPageElement[hierarchyNodeName] = getElementWithName(
      pagesElements,
      hierarchyNodeName,
    );
  }

  const systemPageHierarchyElement = hierarchyNodesElements[0]; // The highest one - so the System - will be the first one

  return processHierarchyToGetPagesData(
    systemPageHierarchyElement,
    lastInternalId,
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
  lastInternalId: number;
}

interface IAllPagesData {
  pages: List<IPageRecord>;
  agents: List<IAgentRecord>;
  ports: List<IPortRecord>;
  connections: List<IConnectionRecord>;
  lastInternalId: number;
}

function getSinglePageData(
  pageElement: Element,
  pageInternalId: string,
  lastInternalId: number,
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
    const agentInternalId = (++lastInternalId).toString();
    const agentPortsInternalIds: string[] = [];

    for (let k = 0; k < agentPortsElements.length; k += 1) {
      const portElement = agentPortsElements[k];
      const portInternalId = (++lastInternalId).toString();
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
      List(agentPortsInternalIds),
      pageInternalId,
      null, // Subpage not set!!
    );

    agents.push(agentRecord);
    pageAgentsInternalIds.push(agentInternalId);
  }

  for (let l = 0; l < pageConnectionsElements.length; l += 1) {
    const connectionElement = pageConnectionsElements[l];
    const connectionInternalId = (++lastInternalId).toString();
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
    List(pageAgentsInternalIds),
    List(pageConnectionsInternalIds),
    null,
    supAgentInternalId, // subPagesInternalIds not set!!
  );

  return {
    lastInternalId,
    page: pageRecord,
    agents: List(agents),
    ports: List(ports),
    connections: List(connections),
  };
}

function parseAlvisProjectXML(
  xmlDocument: XMLDocument,
): [IAlvisProjectRecord, number] {
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
    pages: pagesData.pages,
    agents: pagesData.agents,
    ports: pagesData.ports,
    connections: pagesData.connections,
    code: codeToRecord(code),
  });
  xmlDocument.getElementsByTagNameNS;

  return [alvisProjectRecord, pagesData.lastInternalId];
}

export default parseAlvisProjectXML;

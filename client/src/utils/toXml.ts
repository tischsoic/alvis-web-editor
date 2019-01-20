import {
  IAlvisProjectRecord,
  IAlvisCodeRecord,
  IPageRecord,
  IAgentRecord,
  IPortRecord,
  IConnectionRecord,
} from '../models/alvisProject';
import { List } from 'immutable';
import { getSystemPage, getListElementByInternalId } from './alvisProject';

// <?xml version="1.0" encoding="UTF-8"?>
// <!DOCTYPE alvisproject PUBLIC "alvisPublicId-v0.1" "alvisSystemId-v0.1">
// <alvisproject>
// <hierarchy>
// <node agent="" name="System">
// <node agent="Agent_2" name="Pa5 3">
// <node agent="pag 3 agent" name="WW"/>
// </node>
// </node>
// </hierarchy>
// <page name="Pa5 3">
// <agent active="1" color="white" height="100.0" index="1" name="pag 3 agent" running="0" width="140.0" x="80.0" y="70.0"/>
// </page>
// <page name="System">
// <agent active="0" color="red" height="100.0" index="1" name="Agent_1" running="0" width="140.0" x="20.0" y="80.0">
// <port color="white" id="722064955" name="port_0" x="0.0" y="0.2"/>
// <port color="white" id="1336330071" name="port_1" x="1.0" y="0.5"/>
// </agent>
// <agent active="1" color="white" height="100.0" index="1" name="Agent_2" running="0" width="140.0" x="240.0" y="180.0">
// <port color="white" id="152113763" name="port_0" x="0.0" y="0.2"/>
// </agent>
// <agent active="1" color="white" height="100.0" index="1" name="Agent_3" running="1" width="140.0" x="250.0" y="40.0">
// <port color="white" id="1637408149" name="port_0" x="0.0" y="0.2"/>
// </agent>
// <agent active="1" color="white" height="100.0" index="1" name="Agent_0" running="0" width="140.0" x="30.0" y="240.0">
// <port color="white" id="357298570" name="A" x="0.0" y="0.2"/>
// <port color="white" id="127978646" name="B" x="1.0" y="0.30000000000000004"/>
// </agent>
// <connection direction="target" source="1336330071" style="straight" target="1637408149"/>
// <connection direction="target" source="127978646" style="straight" target="152113763"/>
// <connection direction="source" source="722064955" style="straight" target="1637408149"/>
// </page>
// <page name="WW">
// <agent active="0" color="white" height="100.0" index="1" name="asdfa" running="0" width="140.0" x="60.0" y="80.0"/>
// </page>
// <code>in asdf {

// }
// </code>
// </alvisproject>

export const alvisNSUri = 'http://alvis.kis.agh.edu.pl/';

function appendCode(alvisprojectDoc: Document, code: IAlvisCodeRecord) {
  const codeElement: Element = document.createElementNS(alvisNSUri, 'code');
  const textNodeWithCode = document.createTextNode(code.text);

  codeElement.appendChild(textNodeWithCode);
  alvisprojectDoc.documentElement.appendChild(codeElement);
}

function appendHierarchy(
  alvisprojectDoc: Document,
  pages: List<IPageRecord>,
  agents: List<IAgentRecord>,
) {
  const systemPage = getSystemPage(pages);
  const hierarchy: Element = document.createElementNS(alvisNSUri, 'hierarchy');

  appendHierarchyNode(hierarchy, systemPage, pages, agents);

  alvisprojectDoc.documentElement.appendChild(hierarchy);
}

function appendHierarchyNode(
  supElement: Element,
  page: IPageRecord,
  pages: List<IPageRecord>,
  agents: List<IAgentRecord>,
) {
  const hierarchyNode: Element = createHierarchyNodeElement(page, agents);
  const subHierarchyNodes = page.subPagesInternalIds
    .map((subPageInternalId) =>
      getListElementByInternalId(pages, subPageInternalId),
    ) // TO DO: should we check for null?
    .map((subPage) => {
      const subPageHierarchyNodeElement = createHierarchyNodeElement(
        subPage,
        agents,
      );
      const subPageSubPages = subPage.subPagesInternalIds.map(
        (subPageInternalId) =>
          getListElementByInternalId(pages, subPageInternalId),
      );

      subPageSubPages.forEach((subPageSubPage) => {
        appendHierarchyNode(
          subPageHierarchyNodeElement,
          subPageSubPage,
          pages,
          agents,
        );
      });

      return subPageHierarchyNodeElement;
    });

  subHierarchyNodes.forEach((subHierarchyNode) => {
    hierarchyNode.appendChild(subHierarchyNode);
  });

  supElement.appendChild(hierarchyNode);
}

function createHierarchyNodeElement(
  page: IPageRecord,
  agents: List<IAgentRecord>,
): Element {
  const hierarchyNodeElement: Element = document.createElementNS(
    alvisNSUri,
    'node',
  );
  const supAgent = getListElementByInternalId(agents, page.supAgentInternalId);

  hierarchyNodeElement.setAttribute('agent', supAgent ? supAgent.name : '');
  hierarchyNodeElement.setAttribute('name', page.name);

  return hierarchyNodeElement;
}

function appendPages(
  alvisprojectDoc: Document,
  pages: List<IPageRecord>,
  agents: List<IAgentRecord>,
  ports: List<IPortRecord>,
  connections: List<IConnectionRecord>,
) {
  pages.forEach((page) => {
    appendPage(alvisprojectDoc, page, agents, ports, connections);
  });
}

function appendPage(
  alvisprojectDoc: Document,
  page: IPageRecord,
  agents: List<IAgentRecord>,
  ports: List<IPortRecord>,
  connections: List<IConnectionRecord>,
) {
  const pageElement = createPageElement(page);
  const pageAgents = page.agentsInternalIds.toList().map((agentInternalId) =>
    getListElementByInternalId(agents, agentInternalId),
  );
  const pagePortsInternalIds = ports
    .filter((port) => page.agentsInternalIds.contains(port.agentInternalId))
    .map((port) => port.internalId);
  const pageConnections = connections.filter((connection) =>
    pagePortsInternalIds.contains(connection.sourcePortInternalId),
  );

  appendAgents(pageElement, pageAgents, ports);
  appendConnections(pageElement, pageConnections);
  alvisprojectDoc.documentElement.appendChild(pageElement);
}

function createPageElement(page: IPageRecord) {
  const pageElement: Element = document.createElementNS(alvisNSUri, 'page');

  pageElement.setAttribute('name', page.name);

  return pageElement;
}

function appendAgents(
  pageElement: Element,
  pageAgents: List<IAgentRecord>,
  ports: List<IPortRecord>,
) {
  pageAgents.forEach((agent) => {
    appendAgent(pageElement, agent, ports);
  });
}

function appendAgent(
  pageElement: Element,
  agent: IAgentRecord,
  ports: List<IPortRecord>,
) {
  const agentElement = createAgentElement(agent);
  const agentPorts: List<IPortRecord> = agent.portsInternalIds.toList().map(
    (portInetrnalId) => getListElementByInternalId(ports, portInetrnalId),
  );

  appendPorts(agentElement, agentPorts);
  pageElement.appendChild(agentElement);
}

//  <agent active="1" color="white" height="100.0" index="1" name="pag 3 agent" running="0" width="140.0" x="80.0" y="70.0"/>
function createAgentElement(agent: IAgentRecord): Element {
  const agentElement: Element = document.createElementNS(alvisNSUri, 'agent');

  agentElement.setAttribute('active', agent.active.toString());
  agentElement.setAttribute('color', agent.color);
  agentElement.setAttribute('width', agent.width.toString());
  agentElement.setAttribute('height', agent.height.toString());
  agentElement.setAttribute('index', agent.index);
  agentElement.setAttribute('name', agent.name);
  agentElement.setAttribute('running', agent.running.toString());
  agentElement.setAttribute('x', agent.x.toString());
  agentElement.setAttribute('y', agent.y.toString());

  return agentElement;
}

function appendPorts(agentElement: Element, agentPorts: List<IPortRecord>) {
  agentPorts.forEach((agentPort) => {
    appendPort(agentElement, agentPort);
  });
}

function appendPort(agentElement: Element, agentPort: IPortRecord) {
  const portElement = createPortElement(agentPort);

  agentElement.appendChild(portElement);
}

// <port color="white" id="722064955" name="port_0" x="0.0" y="0.2"/>
function createPortElement(port: IPortRecord): Element {
  const portElement: Element = document.createElementNS(alvisNSUri, 'port');

  portElement.setAttribute('id', port.internalId.toString());
  portElement.setAttribute('name', port.name);
  portElement.setAttribute('x', port.x.toString());
  portElement.setAttribute('y', port.y.toString());
  portElement.setAttribute('color', port.color);

  return portElement;
}

function appendConnections(
  pageElement: Element,
  pageConnections: List<IConnectionRecord>,
) {
  pageConnections.forEach((pageConnection) => {
    appendConnection(pageElement, pageConnection);
  });
}

function appendConnection(
  pageElement: Element,
  pageConnection: IConnectionRecord,
) {
  const connectionElement = createConnectionElement(pageConnection);

  pageElement.appendChild(connectionElement);
}

// <connection direction="target" source="1336330071" style="straight" target="1637408149"/>
function createConnectionElement(connection: IConnectionRecord): Element {
  const connectionElement: Element = document.createElementNS(
    alvisNSUri,
    'connection',
  );

  connectionElement.setAttribute('direction', connection.direction);
  connectionElement.setAttribute('source', connection.sourcePortInternalId);
  connectionElement.setAttribute('target', connection.targetPortInternalId);
  connectionElement.setAttribute('style', connection.style);

  return connectionElement;
}

export function parseAlvisProjectToXml(alvisProject: IAlvisProjectRecord) {
  const alvisDocumentType: DocumentType = document.implementation.createDocumentType(
    'alvisproject',
    'alvisPublicId-v0.1',
    'alvisSystemId-v0.1',
  );
  const alvisprojectDoc: Document = document.implementation.createDocument(
    alvisNSUri,
    'alvisproject',
    alvisDocumentType,
  );

  const pages = alvisProject.pages;
  const agents = alvisProject.agents;
  const ports = alvisProject.ports;
  const connections = alvisProject.connections;
  const code = alvisProject.code;

  appendHierarchy(alvisprojectDoc, pages.toList(), agents.toList());
  appendPages(alvisprojectDoc, pages.toList(), agents.toList(), ports.toList(), connections.toList());
  appendCode(alvisprojectDoc, code);

  const alvisProjectXml = new XMLSerializer().serializeToString(
    alvisprojectDoc,
  );
  const prolog = '<?xml version="1.0" encoding="UTF-8"?>';
  const alvisProjectXmlWithProlog = prolog + alvisProjectXml;

  return alvisProjectXmlWithProlog;
}

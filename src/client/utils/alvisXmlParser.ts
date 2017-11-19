import {
    alvisProjectRecordFactory, IAlvisProjectRecord,
    pageRecordFactory, IPageRecord,
    agentRecordFactory, IAgentRecord,
    portRecordFactory, IPortRecord,
    connectionRecordFactory, IConnectionRecord,
    alvisCodeRecordFactory, IAlvisCodeRecord,
    ConnectionDirection
} from "../models/alvisProject";
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

function getFstElementByTagName(root: Element | XMLDocument, tagName: string): Element {
    const elements = root ? root.getElementsByTagName(tagName) : null,
        element = elements && elements.length === 1 ? elements.item(0) : null;

    return element;
}

function portToRecord(port: Element, internalId: string, agentInternalId: string): IPortRecord {
    return portRecordFactory({
        internalId: internalId.toString(),
        agentInternalId,
        name: port.getAttribute('name'),
        x: parseFloat(port.getAttribute('x')),
        y: parseFloat(port.getAttribute('y')),
        color: port.getAttribute('color'),
    })
}

function agentToRecord(agent: Element, internalId: string, portsInternalIds: List<string>,
    pageInternalId: string, subPageInternalId: string): IAgentRecord {
    return agentRecordFactory({
        internalId,
        name: agent.getAttribute('name'),
        index: agent.getAttribute('index'),
        active: parseInt(agent.getAttribute('active')),
        running: parseInt(agent.getAttribute('running')),
        color: agent.getAttribute('color'),
        height: parseFloat(agent.getAttribute('height')),
        width: parseFloat(agent.getAttribute('width')),
        x: parseFloat(agent.getAttribute('x')),
        y: parseFloat(agent.getAttribute('y')),
        portsInternalIds,
        pageInternalId,
        subPageInternalId,
    })
}

function connectionToRecord(connection: Element,
    internalId: string, sourcePortInternalId: string, targetPortInternalId: string): IConnectionRecord {
    let direction: ConnectionDirection;

    const directionRough = connection.getAttribute('direction');
    if (directionRough === 'target' || directionRough === 'source' || directionRough === 'none') {
        direction = directionRough;
    } else {
        throw {
            message: "Wrong connection tag attribute: direction!",
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

function pageToRecord(page: Element, internalId: string,
    agentsInternalIds: List<string>, connectionsInternalIds: List<string>,
    subPagesInternalIds: List<string>, supAgentInternalId: string): IPageRecord {
    return pageRecordFactory({
        internalId,
        name: page.getAttribute('name'),
        agentsInternalIds,
        subPagesInternalIds,
        supAgentInternalId,
    })
}

function codeToRecord(code: Element): IAlvisCodeRecord {
    return alvisCodeRecordFactory({
        text: code.textContent
    })
}

function assignSubPagesToAgents(agents: List<IAgentRecord>, agentNameSubPageInternalId: [string, string][]): List<IAgentRecord> {
    agentNameSubPageInternalId.forEach((nameToSubPageInternalId) => {
        const agentIndex = getAgentIndexByName(agents, nameToSubPageInternalId[0]);

        agents = agents.update(agentIndex, (agent) => agent.set('subPageInternalId', nameToSubPageInternalId[1]));
    });

    return agents;
}

function getAgentIndexByName(agents: List<IAgentRecord>, name: string): number {
    return agents.findIndex((agent) => agent.name === name);
}

function processHierarchyToGetPagesData(hierarchyElement: Element, lastInternalId: number,
    supAgentInternalId: string, hierarhyNodeNameToInternalId: string[], hierarchyNodeNameToPageElement: Element[]): IAllPagesData {
    const pageName = hierarchyElement.getAttribute('name'),
        pageInternalId = hierarhyNodeNameToInternalId[pageName],
        pageElement = hierarchyNodeNameToPageElement[pageName],
        pageData = getSinglePageData(pageElement, pageInternalId, lastInternalId, supAgentInternalId),
        agentNameSubPageInternalId: [string, string][] = [],
        subPagesData: IAllPagesData[] = [];

    lastInternalId = pageData.lastInternalId;
    for (let j = 0; j < hierarchyElement.children.length; ++j) {
        const child = hierarchyElement.children[j],
            pageName = child.getAttribute('name'),
            agentName = child.getAttribute('agent'),
            // pageInternalId = hierarhyNodeNameToInternalId[pageName],
            // pageElement = hierarchyNodeNameToPageElement[pageName],
            supAgentRecordIndex = getAgentIndexByName(pageData.agents, agentName),
            supAgentRecord = pageData.agents.get(supAgentRecordIndex),
            pageAndSubPagesData = processHierarchyToGetPagesData(
                child, lastInternalId, supAgentRecord.internalId,
                hierarhyNodeNameToInternalId, hierarchyNodeNameToPageElement
            );
        // subPageData = getSinglePageData(pageElement, pageInternalId, lastInternalId, supAgentRecord.internalId);

        lastInternalId = pageAndSubPagesData.lastInternalId;

        subPagesData.push(pageAndSubPagesData);
        agentNameSubPageInternalId.push([agentName, hierarhyNodeNameToInternalId[pageName]]);
    }

    pageData.agents = assignSubPagesToAgents(pageData.agents, agentNameSubPageInternalId);
    pageData.page = pageData.page.set('subPagesInternalIds', List(agentNameSubPageInternalId.map((el) => el[1])));

    const allPagesData: IAllPagesData = {
        pages: List([pageData.page]),
        agents: pageData.agents,
        ports: pageData.ports,
        connections: pageData.connections,
        lastInternalId,
    }
    subPagesData.forEach((subPageData) => {
        allPagesData.agents = allPagesData.agents.concat(subPageData.agents).toList();
        allPagesData.connections = allPagesData.connections.concat(subPageData.connections).toList();
        allPagesData.pages = allPagesData.pages.concat(subPageData.pages).toList();
        allPagesData.ports = allPagesData.ports.concat(subPageData.ports).toList();
    });

    return allPagesData;
}

function getElementWithName(elements: NodeListOf<Element>, name: string) {
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];

        if (element.getAttribute('name') === name) {
            return element;
        }
    }

    throw {
        message: 'No Element with such name in NodeListOf'
    };
}

function getPagesData(hierarchyNodesElements: NodeListOf<Element>, pagesElements: NodeListOf<Element>) {
    const hierarchyNodeNameToInternalId: string[] = [],
        hierarchyNodeNameToPageElement: Element[] = [];
    let lastInternalId = -1;

    for (let i = 0; i < hierarchyNodesElements.length; ++i) {
        const hierarchyNodeElement = hierarchyNodesElements[i],
            hierarchyNodeName = hierarchyNodeElement.getAttribute('name'),
            pageInternalId = (++lastInternalId).toString();

        hierarchyNodeNameToInternalId[hierarchyNodeName] = pageInternalId;
        hierarchyNodeNameToPageElement[hierarchyNodeName] = getElementWithName(pagesElements, hierarchyNodeName);
    }

    const systemPageHierarchyElement = hierarchyNodesElements[0];   // The highest one - so the System - will be the first one

    return processHierarchyToGetPagesData(
        systemPageHierarchyElement, lastInternalId,
        null, hierarchyNodeNameToInternalId, hierarchyNodeNameToPageElement
    );
}

interface ISinglePageData {
    page: IPageRecord,
    agents: List<IAgentRecord>,
    ports: List<IPortRecord>,
    connections: List<IConnectionRecord>,
    lastInternalId: number,
}

interface IAllPagesData {
    pages: List<IPageRecord>,
    agents: List<IAgentRecord>,
    ports: List<IPortRecord>,
    connections: List<IConnectionRecord>,
    lastInternalId: number,
}

function getSinglePageData(pageElement: Element, pageInternalId: string, lastInternalId: number, supAgentInternalId: string): ISinglePageData {
    const xmlIdToInternalId = [];
    const agents: IAgentRecord[] = [],
        ports: IPortRecord[] = [],
        connections: IConnectionRecord[] = [];

    const pageAgentsElements = pageElement.getElementsByTagName('agent'),
        pageConnectionsElements = pageElement.getElementsByTagName('connection'),
        pageAgentsInternalIds: string[] = [],
        pageConnectionsInternalIds: string[] = [];

    for (let j = 0; j < pageAgentsElements.length; ++j) {
        const agentElement = pageAgentsElements[j],
            agentPortsElements = agentElement.getElementsByTagName('port'),
            agentInternalId = (++lastInternalId).toString(),
            agentPortsInternalIds: string[] = [];

        for (let k = 0; k < agentPortsElements.length; ++k) {
            const portElement = agentPortsElements[k],
                portInternalId = (++lastInternalId).toString(),
                portRecord = portToRecord(portElement, portInternalId, agentInternalId);

            ports.push(portRecord);
            xmlIdToInternalId[portElement.getAttribute('id')] = portInternalId;
            agentPortsInternalIds.push(portInternalId);
        }

        const agentRecord = agentToRecord(
            agentElement, agentInternalId,
            List(agentPortsInternalIds), pageInternalId, null // Subpage not set!!
        );

        agents.push(agentRecord);
        pageAgentsInternalIds.push(agentInternalId);
    }

    for (let l = 0; l < pageConnectionsElements.length; ++l) {
        const connectionElement = pageConnectionsElements[l],
            connectionInternalId = (++lastInternalId).toString(),
            connectionRecord = connectionToRecord(
                connectionElement,
                connectionInternalId,
                xmlIdToInternalId[connectionElement.getAttribute('source')],
                xmlIdToInternalId[connectionElement.getAttribute('target')],
            )

        connections.push(connectionRecord);
        pageConnectionsInternalIds.push(connectionInternalId);
    }

    const pageRecord = pageToRecord(
        pageElement, pageInternalId,
        List(pageAgentsInternalIds), List(pageConnectionsInternalIds),
        null, supAgentInternalId //subPagesInternalIds not set!!
    );

    return {
        page: pageRecord,
        agents: List(agents),
        ports: List(ports),
        connections: List(connections),
        lastInternalId,
    }
}

function parseAlvisProjectXML(xmlDocument: XMLDocument): [IAlvisProjectRecord, number] {
    console.log({
        doc: xmlDocument
    })
    const alvisProject = getFstElementByTagName(xmlDocument, 'alvisproject'),
        hierarchy = getFstElementByTagName(alvisProject, 'hierarchy'),
        code = getFstElementByTagName(alvisProject, 'code');

    if (!hierarchy || !alvisProject || !code) {
        return null;
    }

    const hierarchyNodes = hierarchy.getElementsByTagName('node'),
        pages = alvisProject.getElementsByTagName('page'),
        pagesData = getPagesData(hierarchyNodes, pages);

    const alvisProjectRecord = alvisProjectRecordFactory({
        pages: pagesData.pages,
        agents: pagesData.agents,
        ports: pagesData.ports,
        connections: pagesData.connections,
        code: codeToRecord(code),
    });
    xmlDocument.getElementsByTagNameNS

    return [alvisProjectRecord, pagesData.lastInternalId];
}

export default parseAlvisProjectXML;
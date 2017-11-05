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

function getFstElementByTagName(root: Element | XMLDocument, tagName: string): Element {
    const elements = root ? root.getElementsByTagName(tagName) : null,
        element = elements && elements.length === 1 ? elements.item(0) : null;

    return element;
}

function hierarchyNodeToRecord(node: Element, internalId: string, subNodesInternalIds: List<string>): IHierarchyNodeRecord {
    return hierarchyNodeRecordFactory({
        internalId,
        agent: node.getAttribute('agent'),
        name: node.getAttribute('name'),
        subNodesInternalIds
    });
}



function portToRecord(port: Element, internalId: string): IPortRecord {
    return portRecordFactory({
        internalId: internalId.toString(),
        mxGraphId: null,
        name: port.getAttribute('name'),
        x: parseFloat(port.getAttribute('x')),
        y: parseFloat(port.getAttribute('y')),
        color: port.getAttribute('color'),
    })
}

function agentToRecord(agent: Element, internalId: string, portsInternalIds: List<string>): IAgentRecord {
    return agentRecordFactory({
        internalId,
        mxGraphId: null,
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
        mxGraphId: null,
        direction,
        sourcePortInternalId,
        targetPortInternalId,
        style: connection.getAttribute('style'),
    });
}

function pageToRecord(page: Element, internalId: string,
    agentsInternalIds: List<string>, connectionsInternalIds: List<string>): IPageRecord {
    return pageRecordFactory({
        internalId,
        name: page.getAttribute('name'),
        agentsInternalIds,
        // connectionsInternalIds,
    })
}

function codeToRecord(code: Element): IAlvisCodeRecord {
    return alvisCodeRecordFactory({
        text: code.textContent
    })
}

function getHierarchyNodesData(hierarchyNodesElements: NodeListOf<Element>): List<IHierarchyNodeRecord> {
    const hierarchyNodes: IHierarchyNodeRecord[] = [],
        xmlNameToInternalId = [];

    for (let i = 0; i < hierarchyNodesElements.length; ++i) {
        const hierarchyNodeElement = hierarchyNodesElements[i];
        xmlNameToInternalId[hierarchyNodeElement.getAttribute('name')] = i;
    }
    for (let i = 0; i < hierarchyNodesElements.length; ++i) {
        const hierarchyNodeElement = hierarchyNodesElements[i],
            subNodesInternalIds: string[] = [];

        for (let j = 0; j < hierarchyNodeElement.children.length; ++j) {
            const child = hierarchyNodeElement.children[j];

            subNodesInternalIds.push(xmlNameToInternalId[child.getAttribute('name')]);
        }

        const hierarchyNodeInternalId = hierarchyNodes.length.toString(),
            hierarchyNodeRecord
                = hierarchyNodeToRecord(hierarchyNodeElement, hierarchyNodeInternalId, List(subNodesInternalIds));

        hierarchyNodes.push(hierarchyNodeRecord);
    }

    return List(hierarchyNodes);
}

function getPagesData(pagesElements: NodeListOf<Element>) {
    const xmlIdToInternalId = [];
    const pages: IPageRecord[] = [],
        agents: IAgentRecord[] = [],
        ports: IPortRecord[] = [],
        connections: IConnectionRecord[] = [];

    for (let i = 0; i < pages.length; ++i) {
        const pageElement = pagesElements[i],
            pageAgentsElements = pageElement.getElementsByTagName('agent'),
            pageConnectionsElements = pageElement.getElementsByTagName('connection'),
            pageAgentsInternalIds = [],
            pageConnectionsInternalIds = [];

        for (let j = 0; j < pageAgentsElements.length; ++j) {
            const agentElement = pageAgentsElements[j],
                agentPortsElements = agentElement.getElementsByTagName('port'),
                agentPortsInternalIds: string[] = [];

            for (let k = 0; k < agentPortsElements.length; ++k) {
                const portElement = agentPortsElements[k],
                    portInternalId = ports.length.toString(),
                    portRecord = portToRecord(portElement, portInternalId);

                ports.push(portRecord);
                xmlIdToInternalId[portElement.getAttribute('id')] = portInternalId;
                agentPortsInternalIds.push(portInternalId);
            }
            const agentInternalId = agents.length.toString(),
                agentRecord = agentToRecord(agentElement, agentInternalId, List(agentPortsInternalIds));

            agents.push(agentRecord);
            pageAgentsInternalIds.push(agentInternalId);
        }

        for (let l = 0; l < pageConnectionsElements.length; ++l) {
            const connectionElement = pageConnectionsElements[l],
                connectionInternalId = connections.length.toString(),
                connectionRecord = connectionToRecord(
                    connectionElement,
                    connectionInternalId,
                    xmlIdToInternalId[connectionElement.getAttribute('source')],
                    xmlIdToInternalId[connectionElement.getAttribute('target')],
                )

            connections.push(connectionRecord);
            pageConnectionsInternalIds.push(connectionInternalId);
        }

        const pageInternalId = pages.length.toString(),
            pageRecord = pageToRecord(pageElement, pageInternalId,
                List(pageAgentsInternalIds), List(pageConnectionsInternalIds));
    }

    return {
        pages: List(pages),
        agents: List(agents),
        ports: List(ports),
        connections: List(connections),
    }
}

function parseAlvisProjectXML(xmlDocument: XMLDocument): IAlvisProjectRecord {
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
        pagesData = getPagesData(pages),
        hierarchyNodesData = getHierarchyNodesData(hierarchyNodes);

    const alvisProjectRecord = alvisProjectRecordFactory({
        hierarchyNodes: hierarchyNodesData,
        pages: pagesData.pages,
        agents: pagesData.agents,
        ports: pagesData.ports,
        connections: pagesData.connections,
        code: codeToRecord(code),
    });
    xmlDocument.getElementsByTagNameNS

    return alvisProjectRecord;
}

export default parseAlvisProjectXML;
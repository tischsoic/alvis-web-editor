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

function getFstElementByTagName(root: Element | XMLDocument, tagName: string): Element {
    const elements = root ? root.getElementsByTagName(tagName) : null,
        element = elements && elements.length === 1 ? elements.item(0) : null;

    return element;
}

function elsToList<T>(els: NodeListOf<Element>, mapBy: (el: Element) => T): List<T> {
    let elsList = List<T>([]);

    for (let i = 0; i < els.length; ++i) {
        const el = els.item(i);

        elsList = elsList.push(mapBy(el));
    }

    return elsList;
}

function hierarchyNodeToRecord(node: Element): IHierarchyNodeRecord {
    let subNodesNames: List<string> = List<string>([]);
    const subNodes = node.children;

    for (let i = 0; i < subNodes.length; ++i) {
        const subNode = subNodes[i],
            subNodeName = subNode.getAttribute('name');

        subNodesNames = subNodesNames.push(subNodeName);
    }

    return hierarchyNodeRecordFactory({
        agent: node.getAttribute('agent'),
        name: node.getAttribute('name'),
        subNodesNames
    });
}

// function hierarchyNodesToList(subNodes: NodeListOf<Element>): List<IHierarchyNodeRecord> {
//     let nodesList = List<IHierarchyNodeRecord>([]);

//     for (let i = 0; i < subNodes.length; ++i) {
//         const subNode = subNodes.item(i),
//             subSubNodes = subNode.getElementsByTagName('node'),
//             subSubNodesList = subSubNodes.length === 0
//                 ? hierarchyNodesToList(subSubNodes)
//                 : List([]);

//         nodesList = nodesList.push(hierarchyNodeToRecord(subNode, List([])));
//     }

//     return nodesList;
// }

function hierarchyToRecord(hierarchy: Element): IHierarchyRecord {
    const hierarchyNodesElements = hierarchy.getElementsByTagName('node');

    return hierarchyRecordFactory({
        hierarchyNodes: elsToList(hierarchyNodesElements, hierarchyNodeToRecord),
    })
}

function portToRecord(port: Element): IPortRecord {
    return portRecordFactory({
        id: port.getAttribute('id'),
        name: port.getAttribute('name'),
        x: parseFloat(port.getAttribute('x')),
        y: parseFloat(port.getAttribute('y')),
        color: port.getAttribute('color'),
    })
}

function agentToRecord(agent: Element): IAgentRecord {
    return agentRecordFactory({
        phantomId: null,
        name: agent.getAttribute('name'),
        index: agent.getAttribute('index'),
        active: parseInt(agent.getAttribute('active')),
        running: parseInt(agent.getAttribute('running')),
        color: agent.getAttribute('color'),
        height: parseFloat(agent.getAttribute('height')),
        width: parseFloat(agent.getAttribute('width')),
        x: parseFloat(agent.getAttribute('x')),
        y: parseFloat(agent.getAttribute('y')),
        portsIds: elsToList<string>(agent.getElementsByTagName('port'), (port: Element): string => {
            return port.getAttribute('id');
        }),
    })
}

function connectionToRecord(connection: Element): IConnectionRecord {
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
        phantomId: null,
        direction,
        sourcePortId: connection.getAttribute('source'),
        targetPortId: connection.getAttribute('target'),
        style: connection.getAttribute('style'),
    });
}

function pageToRecord(page: Element): IPageRecord {
    return pageRecordFactory({
        name: page.getAttribute('name'),
        ports: elsToList(page.getElementsByTagName('port'), portToRecord),
        agents: elsToList(page.getElementsByTagName('agent'), agentToRecord),
        connections: elsToList(page.getElementsByTagName('connection'), connectionToRecord),
    })
}

function codeToRecord(code: Element): IAlvisCodeRecord {
    return alvisCodeRecordFactory({
        text: code.textContent
    })
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
        pages = alvisProject.getElementsByTagName('page');

    const alvisProjectRecord = alvisProjectRecordFactory({
        hierarchy: hierarchyToRecord(hierarchy),
        pages: elsToList(pages, pageToRecord),
        code: codeToRecord(code),
    });
    xmlDocument.getElementsByTagNameNS

    return alvisProjectRecord;
}

export default parseAlvisProjectXML;
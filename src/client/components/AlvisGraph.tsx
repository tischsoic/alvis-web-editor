import * as React from 'react';
import * as mxClasses from "mxgraphAllClasses";
import { ButtonToolbar, ButtonGroup, Button, GlyphIcon } from 'react-bootstrap';

import AlvisGraphManager from '../utils/AlvisGraphManager';
import modifyMxGraph from '../utils/mxGraphModifier';

import {
    IAgentRecord, agentRecordFactory,
    IPortRecord, portRecordFactory,
    IConnectionRecord, connectionRecordFactory, IInternalRecord,
    IAlvisPageElement,
    ConnectionDirection,
} from "../models/alvisProject";
import { List } from 'immutable';

// TO DO: Problem with moving edeges between ports is because of 
// mxEdgeHandler.prototype.createMarker = function()
// marker.isValidState ....


export interface AlvisGraphProps {
    mx: mxgraph.allClasses,
    agents: List<IAgentRecord>,
    ports: List<IPortRecord>,
    connections: List<IConnectionRecord>,

    onMxGraphAgentAdded: (agent: IAgentRecord) => any,
    onMxGraphAgentDeleted: (agentInternalId: string) => any,
    onMxGraphAgentModified: (agent: IAgentRecord) => any,

    onMxGraphPortAdded: (port: IPortRecord) => any,
    onMxGraphPortDeleted: (portInternalId: string) => any,
    onMxGraphPortModified: (port: IPortRecord) => any,

    onMxGraphConnectionAdded: (connection: IConnectionRecord) => any,
    onMxGraphConnectionDeleted: (connectionInternalId: string) => any,
    onMxGraphConnectionModified: (connection: IConnectionRecord) => any,
};

import {
    getPortAgent
} from '../utils/alvisProject';
import { modifyConnection } from '../actions/project';
import { Glyphicon } from 'react-bootstrap';


export interface AlvisGraphState { };

export class AlvisGraph extends React.Component<AlvisGraphProps, AlvisGraphState> {
    constructor(props: AlvisGraphProps) {
        super(props);

        this.onProcessChange = this.onProcessChange.bind(this);
        this.randomNumber = Math.floor((Math.random() * 100000) + 1);
    }

    private graph: mxClasses.mxGraph;
    private parent;

    private mxGraphIdsToInternalIds: string[] = [];
    private internalIdsToMxGraphIds: string[] = [];

    private duringInternalChanges: boolean = false;

    private changesToApply = [];

    private mxAlvisGraphModel;

    private randomNumber: number;

    componentWillMount() {

    }

    componentDidMount() {
        const { mx, agents, ports, connections } = this.props;
        const graphDiv = document.getElementById('alvis-graph-container-' + this.randomNumber);
        const alvisGraph = this;
        const {
            onMxGraphAgentAdded, onMxGraphAgentDeleted, onMxGraphAgentModified,
            onMxGraphPortAdded, onMxGraphPortDeleted, onMxGraphPortModified,
            onMxGraphConnectionAdded, onMxGraphConnectionDeleted, onMxGraphConnectionModified,
         } = this.props;

        class mxAlvisGraphModel extends mx.mxGraphModel {
            add(parent: mxClasses.mxCell, child: mxClasses.mxCell, index?: number): mxClasses.mxCell {
                if (alvisGraph.isDuringInternalChanges()) {
                    return super.add.apply(this, arguments);
                }

                const { x, y, width, height } = child.geometry;

                if (alvisGraph.graph.isPort(child)) { // Detects edges????
                    const parentId = parent.getId(),
                        parentInternalId = alvisGraph.getInternalIdByMxGrpahId(parentId);

                    onMxGraphPortAdded(alvisGraph.createPort({
                        x, y,
                        name: child.getValue(),
                        color: 'white',
                        agentInternalId: parentInternalId
                    }));
                } else if (alvisGraph.graph.getModel().isEdge(child)) {
                    const s = child.getTerminal(true),
                        t = child.getTerminal(false);
                    // child.getTerminal(false);

                }
                else {
                    // TO DO: save "ACTIVE_AGENT" type in some enum etc.
                    const active = child.style === 'AGENT_ACTIVE' ? 1 : 0;

                    onMxGraphAgentAdded(alvisGraph.createAgent({
                        x, y, width, height,
                        name: child.getValue(),
                        active, color: 'white'
                    }));
                }
            }

            setValue(cell: mxClasses.mxCell, value: any): any {
                console.log(arguments)
                return super.setValue(cell, value);
            }

            setStyle(cell: mxClasses.mxCell, style: string): string {
                console.log(arguments)
                return super.setStyle(cell, style);
            }

            remove(cell: mxClasses.mxCell): mxClasses.mxCell {
                if (alvisGraph.isDuringInternalChanges()) {
                    return super.remove.apply(this, arguments);
                }

                if (alvisGraph.graph.isPort(cell)) {
                    onMxGraphPortDeleted(alvisGraph.getInternalIdByMxGrpahId(cell.getId()));
                } else if (alvisGraph.graph.getModel().isEdge(cell)) {
                    onMxGraphConnectionDeleted(alvisGraph.getInternalIdByMxGrpahId(cell.getId()));
                } else {
                    const { x, y, width, height } = cell.geometry, // TO DO: We dont use it!!!
                        // TO DO: save "ACTIVE_AGENT" type in some enum etc.
                        // TO DO: change it to better check style attrubute may contain many styles
                        active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

                    onMxGraphAgentDeleted(alvisGraph.getInternalIdByMxGrpahId(cell.getId()));
                }
            }

            setGeometry(cell: mxClasses.mxCell, geometry: mxClasses.mxGeometry): mxClasses.mxGeometry {
                if (alvisGraph.isDuringInternalChanges()) {
                    return super.setGeometry.apply(this, arguments);
                }
                const { x, y, width, height } = geometry;

                if (alvisGraph.graph.isPort(cell)) {
                    onMxGraphPortModified(alvisGraph.createPort({
                        x, y,
                        mxGraphId: cell.getId(),
                    }));
                } else if (alvisGraph.graph.getModel().isEdge(cell)) {

                } else {
                    // TO DO: save "ACTIVE_AGENT" type in some enum etc.
                    // TO DO: change it to better check style attrubute may contain many styles
                    const active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

                    onMxGraphAgentModified(alvisGraph.createAgent({
                        x, y, width, height,
                        mxGraphId: cell.getId(),
                    }));
                }
            }

            endUpdate(): void {
                super.endUpdate.apply(this, arguments);

                if (this.updateLevel == 0 && !alvisGraph.isDuringInternalChanges()) {
                    alvisGraph.applyChanges();
                }
            }
        }

        this.mxAlvisGraphModel = new mxAlvisGraphModel();
        this.graph = new mx.mxGraph(graphDiv, this.mxAlvisGraphModel);
        modifyMxGraph(mx, this.graph, this.onProcessChange);
        const oldCellConnected = this.graph.cellConnected;
        const graph = this.graph;
        this.graph.cellConnected = function () {
            if (!alvisGraph.isDuringInternalChanges()) {
                return;
            }

            return oldCellConnected.apply(graph, arguments);
        };
        this.parent = this.graph.getDefaultParent();

        this.graph.addListener(mx.mxEvent.CELLS_ADDED, function (sender, evt) {
            if (alvisGraph.isDuringInternalChanges()) {
                return;
            }

            const cells = evt.getProperty('cells');

            if (cells && cells.length > 0 && alvisGraph.graph.getModel().isEdge(cells[0])) {
                const target = evt.getProperty('target'),
                    source = evt.getProperty('source'),
                    direction = 'source',
                    style = 'straight',
                    sourcePortInternalId = alvisGraph.getInternalIdByMxGrpahId(source.getId()),
                    targetPortInternalId = alvisGraph.getInternalIdByMxGrpahId(target.getId());

                onMxGraphConnectionAdded(alvisGraph.createConnection({
                    sourcePortInternalId,
                    targetPortInternalId,
                    direction, style
                }));
            }

        });

        this.addChanges(
            agents, List(),
            ports, List(),
            connections, List()
        );

        this.applyChanges();
    }

    addChanges(
        nextAgents: List<IAgentRecord>, agents: List<IAgentRecord>,
        nextPorts: List<IPortRecord>, ports: List<IPortRecord>,
        nextConnections: List<IConnectionRecord>, connections: List<IConnectionRecord>
    ) {
        const agentsChanges = this.getChanges(nextAgents, agents),
            portsChanges = this.getChanges(nextPorts, ports),
            connectionsChanges = this.getChanges(nextConnections, connections);

        this.changesToApply.push({
            agentsChanges,
            portsChanges,
            connectionsChanges,
        });
    }

    componentWillReceiveProps(nextProps: AlvisGraphProps, nextContext: any) {
        const { agents, ports, connections } = this.props;
        const nextAgents = nextProps.agents,
            nextPorts = nextProps.ports,
            nextConnections = nextProps.connections;

        this.addChanges(
            nextAgents, agents,
            nextPorts, ports,
            nextConnections, connections
        );

        this.applyChanges();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext: any) {
        console.log("ATTENTION!!! shouldComponentUpdate");
        return false;
    }

    // componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
    // componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
    // componentWillUnmount?(): void;

    render() {
        console.log(this.props)
        console.log('rendering AlivGraph COmponent')
        return (
            <div>
                <ButtonToolbar>
                    <ButtonGroup>
                        <Button onClick={() => this.graph.zoomOut()}><Glyphicon glyph='glyphicon-zoom-out' /></Button>
                        <Button onClick={() => this.graph.zoomIn()}><Glyphicon glyph='glyphicon-zoom-in' /></Button>
                    </ButtonGroup>
                </ButtonToolbar>
                <div id={"alvis-graph-container-" + this.randomNumber}></div>
            </div>
        )
    }

    private beginInternalChanges() {
        this.duringInternalChanges = true;
    }

    private endInternalChanges() {
        this.duringInternalChanges = false;
    }

    private isDuringInternalChanges(): boolean {
        return this.duringInternalChanges;
    }

    private applyChanges(): void {
        if (!this.mxAlvisGraphModel || this.mxAlvisGraphModel.updateLevel !== 0) {
            return;
        }

        this.beginInternalChanges();
        this.changesToApply.forEach((changes) => {
            changes.agentsChanges.new.forEach((newAgent) => this.addAgent(newAgent));
            changes.agentsChanges.deleted.forEach((deletedAgent) => this.deleteAgent(deletedAgent));
            changes.agentsChanges.modified.forEach((modifiedAgent) => this.modifyAgent(modifiedAgent));

            changes.portsChanges.new.forEach((newPort) => this.addPort(newPort));
            changes.portsChanges.deleted.forEach((deletedPort) => this.deletePort(deletedPort));
            changes.portsChanges.modified.forEach((modifiedPort) => this.modifyPort(modifiedPort));

            changes.connectionsChanges.new.forEach((newConnection) => this.addConnection(newConnection));
            changes.connectionsChanges.deleted.forEach((deletedConnection) => this.deleteConnection(deletedConnection));
            // changes.connectionsChanges.modified.forEach((modifiedPort) => this.modifyPort(modifiedPort));
        })
        this.endInternalChanges();

        this.changesToApply = [];
    }

    private getElementByInternalId<T extends IAlvisPageElement>(
        listOfElements: List<T>, internalId: string
    ): T {
        const elementIndex = listOfElements.findIndex((element) => element.internalId === internalId);

        if (elementIndex !== -1) {
            return listOfElements.get(elementIndex);
        }
    }

    private setIfNotUndefined<T extends IAlvisPageElement>(element: T, key: string, value: any): T {
        if (value !== undefined) {
            return element.set(key, value) as T; // TO DO: Check why I must cast??
            // Will this site be helpful: https://stackoverflow.com/questions/43300008/type-is-not-assignable-to-generic-type ?
        }
        return element;
    }

    private createConnection(
        { sourcePortInternalId = undefined, targetPortInternalId = undefined,
            direction = undefined, style = undefined, internalId = undefined, mxGraphId = undefined, }: {
                sourcePortInternalId?: string, targetPortInternalId?: string,
                direction?: ConnectionDirection, style?: string, internalId?: string, mxGraphId?: string,
            }): IConnectionRecord {
        const { connections } = this.props;

        if (internalId || mxGraphId) {
            const connection: IConnectionRecord = this.getElementByInternalId(connections, internalId ? internalId : this.getInternalIdByMxGrpahId(mxGraphId));
            if (!connection) {
                throw "No connection with given internal or mxGraph ID!";
            }

            let modifiedConnection = connection;
            modifiedConnection = this.setIfNotUndefined(modifiedConnection, 'sourcePortInternalId', sourcePortInternalId);
            modifiedConnection = this.setIfNotUndefined(modifiedConnection, 'targetPortInternalId', targetPortInternalId);
            modifiedConnection = this.setIfNotUndefined(modifiedConnection, 'direction', direction);
            modifiedConnection = this.setIfNotUndefined(modifiedConnection, 'style', style);

            return modifiedConnection;
        }

        return connectionRecordFactory({
            internalId: null,
            sourcePortInternalId,
            targetPortInternalId,
            direction,
            style,
        });
    }

    private createPort({ x = undefined, y = undefined, name = undefined, color = undefined,
        agentInternalId = undefined, internalId = undefined, mxGraphId = undefined, }: {
            x?: number, y?: number, name?: string, color?: string,
            agentInternalId?: string, internalId?: string, mxGraphId?: string,
        }): IPortRecord {
        const { ports } = this.props;

        if (internalId || mxGraphId) {
            const port: IPortRecord = this.getElementByInternalId(ports, internalId ? internalId : this.getInternalIdByMxGrpahId(mxGraphId));
            if (!port) {
                throw "No port with given internal or mxGraph ID!";
            }

            let modifiedPort = port;
            modifiedPort = this.setIfNotUndefined(modifiedPort, 'x', x);
            modifiedPort = this.setIfNotUndefined(modifiedPort, 'y', y);
            modifiedPort = this.setIfNotUndefined(modifiedPort, 'name', name);
            modifiedPort = this.setIfNotUndefined(modifiedPort, 'color', color);
            modifiedPort = this.setIfNotUndefined(modifiedPort, 'agentInternalId', agentInternalId);

            return modifiedPort;
        }

        return portRecordFactory({
            internalId: null,
            name,
            x,
            y,
            color,
            agentInternalId,
        })
    }

    private createAgent({ x = undefined, y = undefined, width = undefined, height = undefined, name = undefined,
        active = undefined, color = undefined, internalId = undefined, mxGraphId = undefined }: {
            x?: number, y?: number, width?: number, height?: number, name?: string, active?: number, color?: string,
            internalId?: string, mxGraphId?: string,
        }): IAgentRecord {
        const { agents } = this.props;

        if (internalId || mxGraphId) {
            const agent: IAgentRecord = this.getElementByInternalId(agents, internalId ? internalId : this.getInternalIdByMxGrpahId(mxGraphId));
            if (!agent) {
                throw "No port with given internal or mxGraph ID!";
            }

            let modifiedAgent = agent;
            modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'x', x);
            modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'y', y);
            modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'width', width);
            modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'height', height);
            modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'name', name);
            modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'active', active);
            modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'color', color);

            return modifiedAgent;
        }

        return agentRecordFactory({
            internalId,
            name,
            portsInternalIds: List<string>([]),
            index: null,
            active,
            running: null,
            height,
            width,
            x,
            y,
            color,
            pageInternalId: '0',
            subPageInternalId: null,
        })
    }

    private onProcessChange(change: any, callback) {
        callback(change);
        return;
        // if (this.isDuringInternalChanges()) {
        //     callback(change);
        //     return;
        // }

        // const { onMxGraphAgentAdded, onMxGraphAgentDeleted, onMxGraphAgentModified } = this.props,
        //     changeConstructorName = change.constructor.name;

        // if (changeConstructorName === "mxChildChange") {
        //     const isDeletion = change.parent === null;
        //     if (isDeletion) {
        //         const cell = change.child;
        //         onMxGraphAgentDeleted(this.getInternalIdByMxGrpahId(cell.getId()));
        //     } else {
        //         const newCell: mxClasses.mxCell = change.child,
        //             newCellGeometry = newCell.geometry,
        //             { x, y, width, height } = newCell.geometry,
        //             // TO DO: save "ACTIVE_AGENT" type in some enum etc.
        //             active = newCell.style === 'AGENT_ACTIVE' ? 1 : 0;

        //         onMxGraphAgentAdded(this.createAgent(x, y, width, height, newCell.getValue(), active, 'white'));
        //     }
        //     return;
        // }
        // if (changeConstructorName === "mxGeometryChange") {
        //     const cell: mxClasses.mxCell = change.cell,
        //         { x, y, width, height } = change.geometry,
        //         // TO DO: save "ACTIVE_AGENT" type in some enum etc.
        //         // TO DO: change it to better check style attrubute may contain many styles
        //         active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

        //     onMxGraphAgentModified(this.createAgent(x, y, width, height, cell.getValue(), active, 'white',
        //         this.getInternalIdByMxGrpahId(cell.getId())));
        //     return;
        // }

    }

    private getInternalIdByMxGrpahId(mxGraphId: string): string | undefined {
        return this.mxGraphIdsToInternalIds[mxGraphId];
    }

    private getMxGraphIdByInternalId(internalId: string): string | undefined {
        return this.internalIdsToMxGraphIds[internalId];
    }

    // TO DO
    private modifyAgent(agent: IAgentRecord): IAgentRecord {
        const { mx } = this.props;

        this.graph.getModel().beginUpdate();
        try {
            const mxGraphAgentId = this.getMxGraphIdByInternalId(agent.internalId),
                cellToModify = this.graph.getModel().getCell(mxGraphAgentId);

            // this.graph.translateCell(cellToModify, agent.x, agent.y);
            this.graph.resizeCell(cellToModify, new mx.mxRectangle(agent.x, agent.y, agent.width, agent.height), false);
        }
        finally {
            this.graph.getModel().endUpdate();
        }

        return agent;
    }

    private deleteAgent(agent: IAgentRecord): IAgentRecord {
        this.graph.getModel().beginUpdate();
        try {
            const mxGraphAgentId = this.getMxGraphIdByInternalId(agent.internalId),
                cellToDelete = this.graph.getModel().getCell(mxGraphAgentId);

            this.graph.removeCells([cellToDelete])
        }
        finally {
            this.graph.getModel().endUpdate();
        }

        return agent;
    }

    private addAgent(agent: IAgentRecord): IAgentRecord {
        this.graph.getModel().beginUpdate();
        try {
            let agentStyle = agent.active === 1 ? 'ACTIVE_AGENT;' : 'PASSIVE_AGENT;';
            agentStyle += agent.running === 1 ? 'RUNNING;' : '';
            const agentVertex = this.graph.insertVertex(
                this.parent, null, agent.name,
                agent.x, agent.y, agent.width, agent.height,
                agentStyle);
            agentVertex.setConnectable(false);

            this.mxGraphIdsToInternalIds[agentVertex.getId()] = agent.internalId;
            this.internalIdsToMxGraphIds[agent.internalId] = agentVertex.getId();

            return agent;
        }
        finally {
            this.graph.getModel().endUpdate();
        }
    }

    private modifyPort(port: IPortRecord): IPortRecord {
        const { mx } = this.props;

        this.graph.getModel().beginUpdate();
        try {
            const mxGraphPortId = this.getMxGraphIdByInternalId(port.internalId),
                cellToModify = this.graph.getModel().getCell(mxGraphPortId);

            this.graph.moveCells([cellToModify], (port.x - 1) * 100, (port.y - 1) * 100);
            // this.graph.translateCell(cellToModify, port.x, port.y);
            // this.graph.resizeCell(cellToModify, new mx.mxRectangle(port.x, port.y, 20, 20), false);
        }
        finally {
            this.graph.getModel().endUpdate();
        }

        return port;
    }

    private deletePort(port: IPortRecord): IPortRecord {
        this.graph.getModel().beginUpdate();
        try {
            const mxGraphPortId = this.getMxGraphIdByInternalId(port.internalId),
                cellToDelete = this.graph.getModel().getCell(mxGraphPortId);

            this.graph.removeCells([cellToDelete])
        }
        finally {
            this.graph.getModel().endUpdate();
        }

        return port;
    }

    private addPort(port: IPortRecord): IPortRecord {
        const { mx } = this.props;
        this.graph.getModel().beginUpdate();
        try {
            const portAgentMxGraphId = this.getMxGraphIdByInternalId(port.agentInternalId),
                portAgentVertex = this.graph.getModel().getCell(portAgentMxGraphId);

            var portVertex = this.graph.insertVertex(portAgentVertex, null, port.name, port.x, port.y, 20, 20, 'PORT_STYLE');
            portVertex.geometry.offset = new mx.mxPoint(-10, -10);
            portVertex.geometry.relative = true;

            this.mxGraphIdsToInternalIds[portVertex.getId()] = port.internalId;
            this.internalIdsToMxGraphIds[port.internalId] = portVertex.getId();

            return port;
        }
        finally {
            this.graph.getModel().endUpdate();
        }
    }

    private addConnection(connection: IConnectionRecord): IConnectionRecord {
        const { mx, ports } = this.props;
        this.graph.getModel().beginUpdate();
        try {
            const sourcePortMxGraphId = this.getMxGraphIdByInternalId(connection.sourcePortInternalId),
                targetPortMxGraphId = this.getMxGraphIdByInternalId(connection.targetPortInternalId),
                sourcePortRecord = this.getElementByInternalId(ports, connection.sourcePortInternalId), // TO DO: think over it
                // can it be whatever port recordafter change? Maybe we should rather provide port from state of this change 
                targetPortRecord = this.getElementByInternalId(ports, connection.targetPortInternalId),
                edgePortsStyle = `sourcePort=${sourcePortMxGraphId};targetPort=${targetPortMxGraphId};`;
            let directionStyle = '';

            switch (connection.direction) {
                case 'target':
                    directionStyle = 'startArrow=none;endArrow=block;';
                    break;
                case 'source':
                    directionStyle = 'startArrow=block;endArrow=none;'; // TO DO: Check if 'none' is valid
                    break;
                case 'none':
                    directionStyle = 'startArrow=none;endArrow=none;';
            }

            const edgeCell = this.graph.insertEdge(this.parent, null, '',
                this.graph.getModel().getCell(sourcePortMxGraphId),
                this.graph.getModel().getCell(targetPortMxGraphId),
                edgePortsStyle + directionStyle);

            this.mxGraphIdsToInternalIds[edgeCell.getId()] = connection.internalId;
            this.internalIdsToMxGraphIds[connection.internalId] = edgeCell.getId();

            return connection;
        }
        finally {
            this.graph.getModel().endUpdate();
        }
    }

    private deleteConnection(connection: IConnectionRecord): IConnectionRecord {
        this.graph.getModel().beginUpdate();
        try {
            const mxGraphConnectionId = this.getMxGraphIdByInternalId(connection.internalId),
                cellToDelete = this.graph.getModel().getCell(mxGraphConnectionId);

            this.graph.removeCells([cellToDelete])
        }
        finally {
            this.graph.getModel().endUpdate();
        }

        return connection;
    }

    // TO DO: look for optimizations
    private getChanges<T extends IAgentRecord | IPortRecord | IConnectionRecord>(next: List<T>, current: List<T>): GraphElementsChanges<T> {
        const getByInternalId = (elements: List<T>, internalId: string): T | null => {
            return elements.find((el) => el.internalId === internalId);
        };
        const nextInternalIds = next.map((agent) => agent.internalId),
            currentInternalIds = current.map((agent) => agent.internalId),
            newElements = next.filter((el) => !currentInternalIds.contains(el.internalId)).toList(),
            deletedElements = current.filter((el) => !nextInternalIds.contains(el.internalId)).toList(),
            notNewNextElements = next.filter((el) => el.internalId !== null),
            modifiedElements = notNewNextElements.filter((el) => {
                const currentElRecord = getByInternalId(current, el.internalId);
                return currentElRecord != null && !currentElRecord.equals(el);
            }).toList();

        return {
            new: newElements,
            deleted: deletedElements,
            modified: modifiedElements,
        }
    }

}

interface GraphElementsChanges<T> {
    new: List<T>,
    deleted: List<T>,
    modified: List<T>,
}
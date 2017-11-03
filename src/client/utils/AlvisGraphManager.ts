import * as mxClasses from "mxgraphAllClasses";
import {
    IAlvisProjectRecord,
    IPageRecord,
    IAgentRecord,
    IPortRecord,
    IConnectionRecord,
} from '../models/alvisProject';
import mxgraph = require('mxgraph');
import { List } from 'immutable';
import { getAgentPorts } from './alvisProject';

class AlvisGraphManager {
    constructor(
        private mx: mxgraph.allClasses,
        private graph: mxClasses.mxGraph,
        private page: IPageRecord) {
        this.parent = graph.getDefaultParent();
        this.initializeGraph();
    }

    private parent: mxClasses.mxCell;
    private portDiameter: number = 20;

    addAgent(agent: IAgentRecord): IAgentRecord {
        this.graph.getModel().beginUpdate();
        try {
            const agentVertex = this.graph.insertVertex(
                this.parent, null, agent.name,
                agent.x, agent.y, agent.width, agent.height,
                'ROUNDED');
            agentVertex.setConnectable(false);

            return agent.set('phantomId', agentVertex.getId());
        }
        finally {
            this.graph.getModel().endUpdate();
        }
    }

    addPort(port: IPortRecord, agent: IAgentRecord): IPortRecord {
        const portParent = this.graph.getModel().getCell(agent.phantomId);

        if (!portParent) {
            throw "Port's agent does not exists on graph!";
        }

        this.graph.getModel().beginUpdate();
        try {
            const portVertex = this.graph.insertVertex(
                portParent, port.id, port.name,
                port.x, port.y, this.portDiameter, this.portDiameter,
                'PORT_STYLE');
            portVertex.geometry.offset = new this.mx.mxPoint(-10, -10);
            portVertex.geometry.relative = true;
        }
        finally {
            this.graph.getModel().endUpdate();
        }

        return port
    }

    addConnection(connection: IConnectionRecord): IConnectionRecord {
        const source = this.graph.getModel().getCell(connection.sourcePortId);
        const target = this.graph.getModel().getCell(connection.targetPortId);

        if (!source || !target) {
            throw "Ports for connection does not exists!";
        }

        this.graph.getModel().beginUpdate();
        try {
            const connectionEdge = this.graph.insertEdge(
                this.parent, null, null, source, target
            );

            return connection.set('phantomId', connectionEdge.getId());
        }
        finally {
            this.graph.getModel().endUpdate();
        }
    }

    addAgents() {
        this.page.agents.forEach((agent) => {
            const addedAgent = this.addAgent(agent);

            this.addPorts(getAgentPorts(this.page, addedAgent), addedAgent);
        })
    }

    addPorts(ports: List<IPortRecord>, agent: IAgentRecord) {
        ports.forEach((port) => {
            this.addPort(port, agent);
        });
    }

    addConnections() {
        this.page.connections.forEach((connection) => {
            this.addConnection(connection);
        })
    }

    initializeGraph() {
        this.addAgents();
        this.addConnections();
    }
}

export default AlvisGraphManager;
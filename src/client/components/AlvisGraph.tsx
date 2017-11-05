import * as React from 'react';
import * as mxClasses from "mxgraphAllClasses";

import AlvisGraphManager from '../utils/AlvisGraphManager';
import modifyMxGraph from '../utils/mxGraphModifier';

import {
    IAgentRecord, agentRecordFactory,
    IPortRecord, portRecordFactory,
    IConnectionRecord, connectionRecordFactory,
} from "../models/alvisProject";
import { List } from 'immutable';

export interface AlvisGraphProps {
    mx: mxgraph.allClasses,
    agents: List<IAgentRecord>,
    ports: List<IPortRecord>,
    connections: List<IConnectionRecord>,
    onMxGraphAgentAdded: (agent: IAgentRecord) => any,
    onMxGraphAgentDeleted: (agentInternalId: string) => any,
    onMxGraphAgentModified: (agent: IAgentRecord) => any,
};

export interface AlvisGraphState { };

export class AlvisGraph extends React.Component<AlvisGraphProps, AlvisGraphState> {
    constructor(props: AlvisGraphProps) {
        super(props);

        this.onProcessChange = this.onProcessChange.bind(this);
    }

    private graph: mxClasses.mxGraph;
    private parent;

    private mxGraphIdsToInternalIds: string[] = [];
    private internalIdsToMxGraphIds: string[] = [];

    private duringInternalChanges: boolean = false;

    private changesToApply = [];

    private mxAlvisGraphModel;

    componentWillMount() {

    }

    componentDidMount() {
        const { mx } = this.props;
        const graphDiv = document.getElementById('alvis-graph-container');
        const alvisGraph = this;
        const { onMxGraphAgentAdded, onMxGraphAgentDeleted, onMxGraphAgentModified } = this.props;

        class mxAlvisGraphModel extends mx.mxGraphModel {
            add(parent: mxClasses.mxCell, child: mxClasses.mxCell, index?: number): mxClasses.mxCell {
                if (alvisGraph.isDuringInternalChanges()) {
                    return super.add.apply(this, arguments);
                } else {
                    const { x, y, width, height } = child.geometry,
                        // TO DO: save "ACTIVE_AGENT" type in some enum etc.
                        active = child.style === 'AGENT_ACTIVE' ? 1 : 0;

                    onMxGraphAgentAdded(alvisGraph.createAgent(x, y, width, height, child.getValue(), active, 'white'));
                }
            }

            remove(cell: mxClasses.mxCell): mxClasses.mxCell {
                if (alvisGraph.isDuringInternalChanges()) {
                    return super.remove.apply(this, arguments);
                } else {
                    const { x, y, width, height } = cell.geometry,
                        // TO DO: save "ACTIVE_AGENT" type in some enum etc.
                        // TO DO: change it to better check style attrubute may contain many styles
                        active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

                    onMxGraphAgentDeleted(alvisGraph.getInternalIdByMxGrpahId(cell.getId()));
                }
            }

            setGeometry(cell: mxClasses.mxCell, geometry: mxClasses.mxGeometry): mxClasses.mxGeometry {
                if (alvisGraph.isDuringInternalChanges()) {
                    return super.remove.apply(this, arguments);
                } else {
                    const { x, y, width, height } = geometry,
                        // TO DO: save "ACTIVE_AGENT" type in some enum etc.
                        // TO DO: change it to better check style attrubute may contain many styles
                        active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

                    onMxGraphAgentModified(alvisGraph.createAgent(x, y, width, height,
                        cell.getValue(), active, 'white', alvisGraph.getInternalIdByMxGrpahId(cell.getId())));
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
        this.parent = this.graph.getDefaultParent();
    }

    componentWillReceiveProps(nextProps: AlvisGraphProps, nextContext: any) {
        const { agents } = nextProps;
        const agentChanges = this.getAgentsChanges(agents);

        this.changesToApply.push({
            agentChanges
        });

        if (this.mxAlvisGraphModel.updateLevel == 0) {
            this.applyChanges();
        }
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
            <div id="alvis-graph-div">
                {"alvis graph div"}
                <div id="alvis-graph-container"></div>
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
        this.beginInternalChanges();
        this.changesToApply.forEach((changes) => {
            changes.agentChanges.new.forEach((newAgent) => this.addAgent(newAgent));
            changes.agentChanges.deleted.forEach((deletedAgent) => this.deleteAgent(deletedAgent));
            // changes.agentChanges.modified.forEach((modifiedAgent) => this.deleteAgent(modifiedAgent));
        })
        this.endInternalChanges();

        this.changesToApply = [];
    }

    private createAgent(x: number, y: number, width: number, height: number, name: string, active: number, color: string,
        internalId: string = null) {
        return agentRecordFactory({
            internalId,
            mxGraphId: null,
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

    private getInternalIdByMxGrpahId(mxGraphId: string) {
        return this.mxGraphIdsToInternalIds[mxGraphId];
    }

    private getMxGraphIdByInternalId(internalId: string) {
        return this.internalIdsToMxGraphIds[internalId];
    }

    // TO DO
    private modifyAgent(agent: IAgentRecord): IAgentRecord {
        // this.graph.getModel().beginUpdate();
        // try {
        //     const mxGraphAgentId = this.getMxGraphIdByInternalId(agent.internalId),
        //         cellToDelete = this.graph.getModel().getCell(mxGraphAgentId);

        //     this.graph.removeCells([cellToDelete])
        // }
        // finally {
        //     this.graph.getModel().endUpdate();
        // }

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
            const agentStyle = agent.active === 1 ? 'ACTIVE_AGENT' : 'PASSIVE_AGENT';
            const agentVertex = this.graph.insertVertex(
                this.parent, null, agent.name,
                agent.x, agent.y, agent.width, agent.height,
                agentStyle);
            agentVertex.setConnectable(false);

            this.mxGraphIdsToInternalIds[agentVertex.getId()] = agent.internalId;
            this.internalIdsToMxGraphIds[agent.internalId] = agentVertex.getId();

            return agent.set('mxGraphId', agentVertex.getId());
        }
        finally {
            this.graph.getModel().endUpdate();
        }
    }

    // TO DO: look for optimizations
    private getAgentsChanges(nextAgents: List<IAgentRecord>): GraphElementsChanges<IAgentRecord> {
        const { agents } = this.props;
        const getAgentByInternalId = (agents: List<IAgentRecord>, internalId: string): IAgentRecord | null => {
            return agents.find((agent) => agent.internalId === internalId)
        };
        const nextAgentsInternalIds = nextAgents.map((agent) => agent.internalId),
            currentAgentsInternalIds = agents.map((agent) => agent.internalId),
            newAgents = nextAgents.filter((agent) => !currentAgentsInternalIds.contains(agent.internalId)).toList(),
            deletedAgents = agents.filter((agent) => !nextAgentsInternalIds.contains(agent.internalId)).toList(),
            notNewNextAgents = nextAgents.filter((agent) => agent.internalId !== null),
            modifiedAgents = notNewNextAgents.filter((agent) => {
                const previousAgentRec = getAgentByInternalId(agents, agent.internalId);
                return previousAgentRec != null && !previousAgentRec.equals(agent);
            }).toList();

        return {
            new: newAgents,
            deleted: deletedAgents,
            modified: modifiedAgents,
        }
    }
}

interface GraphElementsChanges<T> {
    new: List<T>,
    deleted: List<T>,
    modified: List<T>,
}
import * as React from 'react';
import * as classNames from 'classnames';
import * as mxClasses from 'mxgraphAllClasses';
import modifyMxGraph from '../utils/mxGraphModifier';
import { mx } from '../utils/mx';

import {
  IPageRecord,
  pageRecordFactory,
  IAgent,
  IAgentRecord,
  agentRecordFactory,
  IPortRecord,
  portRecordFactory,
  IConnectionRecord,
  connectionRecordFactory,
  IIdentifiableElement,
  IAlvisPageElement,
  ConnectionDirection,
  IAlvisPageElementRecord,
  IPort,
  IConnection,
} from '../models/alvisProject';
import { List, Map, Set } from 'immutable';
import { newUuid } from '../utils/uuidGenerator';

const style = require('./AlvisGraph.scss');

// TO DO: Problem with moving edeges between ports is because of
// mxEdgeHandler.prototype.createMarker = function()
// marker.isValidState ....

export interface AlvisGraphProps {
  active: boolean;

  agents: Map<string, IAgentRecord>;
  ports: Map<string, IPortRecord>;
  connections: Map<string, IConnectionRecord>;
  pageInternalId: string;

  onChangeActivePage: (newActivePageInternalId: string) => void;

  onMxGraphPageAdded: (page: IPageRecord) => any; // TODO: mxGraph should be encapsulated thus in interface should be no mention about it
  // rather call this function: `onPageAdded`

  onMxGraphAgentAdded: (agent: IAgentRecord) => any;
  onMxGraphAgentDeleted: (agentInternalId: string) => any;
  onMxGraphAgentModified: (agent: IAgentRecord) => any;

  onMxGraphPortAdded: (port: IPortRecord) => any;
  onMxGraphPortDeleted: (portInternalId: string) => any;
  onMxGraphPortModified: (port: IPortRecord) => any;

  onMxGraphConnectionAdded: (connection: IConnectionRecord) => any;
  onMxGraphConnectionDeleted: (connectionInternalId: string) => any;
  onMxGraphConnectionModified: (connection: IConnectionRecord) => any;

  onAgentClick: (id: string) => void;
  onPortClick: (id: string) => void;

  onHierarchyRemove: (agentId: string) => void;

  getNameFromUser: (callback: (chosenName: string) => void) => void;
}

export interface AlvisGraphState {}

export class AlvisGraph extends React.Component<
  AlvisGraphProps,
  AlvisGraphState
> {
  constructor(props: AlvisGraphProps) {
    super(props);

    this.onProcessChange = this.onProcessChange.bind(this);
    this.changeActivePageToAgentSubPage = this.changeActivePageToAgentSubPage.bind(
      this,
    );
    this.randomNumber = Math.floor(Math.random() * 100000 + 1); // TO DO: set unique ID based on alvis Page ID
  }

  private graph: mxClasses.mxGraph;
  private outline: mxClasses.mxOutline;
  private parent;

  private mxGraphIdsToInternalIds: string[] = [];
  private internalIdsToMxGraphIds: string[] = [];

  private mxGraphIdsToHierarchicalIconOverlays: mxClasses.mxCellOverlay[] = [];

  private duringInternalChanges: boolean = false;

  private changesToApply = [];

  private mxAlvisGraphModel;

  private randomNumber: number;

  componentWillMount() {}

  componentDidMount() {
    const { agents, ports, connections } = this.props;
    const graphDiv = document.getElementById(
      'alvis-graph-container-' + this.randomNumber,
    );
    const alvisGraph = this; // TODO: it should be passed trough constructor
    const {
      onMxGraphAgentAdded,
      onMxGraphAgentDeleted,
      onMxGraphAgentModified,
      onMxGraphPortAdded,
      onMxGraphPortDeleted,
      onMxGraphPortModified,
      onMxGraphConnectionAdded,
      onMxGraphConnectionDeleted,
      onMxGraphConnectionModified,
    } = this.props;

    class mxAlvisGraphModel extends mx.mxGraphModel {
      add(
        parent: mxClasses.mxCell,
        child: mxClasses.mxCell,
        index?: number,
      ): mxClasses.mxCell {
        if (alvisGraph.isDuringInternalChanges()) {
          return super.add.apply(this, arguments);
        }

        const { x, y, width, height } = child.geometry;

        if (alvisGraph.graph.isPort(child)) {
          // Detects edges????
          const parentId = parent.getId();
          const parentInternalId = alvisGraph.getInternalIdByMxGrpahId(
            parentId,
          );

          onMxGraphPortAdded(
            alvisGraph.createPort({
              x,
              y,
              name: child.getValue(),
              color: 'white',
              agentInternalId: parentInternalId,
            }),
          );
        } else if (alvisGraph.graph.getModel().isEdge(child)) {
          const s = child.getTerminal(true);
          const t = child.getTerminal(false);
          // child.getTerminal(false);
        } else {
          // TO DO: save "ACTIVE_AGENT" type in some enum etc.
          const active = child.style === 'AGENT_ACTIVE' ? 1 : 0;

          onMxGraphAgentAdded(
            alvisGraph.createAgent({
              x,
              y,
              width,
              height,
              active,
              name: child.getValue(),
              color: 'white',
            }),
          );
        }
      }

      setValue(cell: mxClasses.mxCell, value: any): any {
        const cellId = cell.getId();
        if (cellId === null || alvisGraph.isDuringInternalChanges()) {
          return super.setValue.apply(this, arguments);
        }

        if (alvisGraph.graph.isPort(cell)) {
          onMxGraphPortModified(
            alvisGraph.createPort({
              name: value,
              internalId: cell.getId(),
            }),
          );
        } else if (alvisGraph.graph.getModel().isEdge(cell)) {
        } else {
          onMxGraphAgentModified(
            alvisGraph.createAgent({ name: value, internalId: cell.getId() }),
          );
        }
      }

      setStyle(cell: mxClasses.mxCell, style: string): string {
        console.log(arguments);
        return super.setStyle(cell, style);
      }

      remove(cell: mxClasses.mxCell): mxClasses.mxCell {
        const cellId = cell.getId();
        if (cellId === null || alvisGraph.isDuringInternalChanges()) {
          return super.remove.apply(this, arguments);
        }

        if (alvisGraph.graph.isPort(cell)) {
          onMxGraphPortDeleted(
            alvisGraph.getInternalIdByMxGrpahId(cell.getId()),
          );
        } else if (alvisGraph.graph.getModel().isEdge(cell)) {
          onMxGraphConnectionDeleted(
            alvisGraph.getInternalIdByMxGrpahId(cell.getId()),
          );
        } else {
          const { x, y, width, height } = cell.geometry; // TO DO: We dont use it!!!
          // TO DO: save "ACTIVE_AGENT" type in some enum etc.
          // TO DO: change it to better check style attrubute may contain many styles
          const active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

          onMxGraphAgentDeleted(
            alvisGraph.getInternalIdByMxGrpahId(cell.getId()),
          );
        }
      }

      setGeometry(
        cell: mxClasses.mxCell,
        geometry: mxClasses.mxGeometry,
      ): mxClasses.mxGeometry {
        const cellId = cell.getId();
        if (cellId === null || alvisGraph.isDuringInternalChanges()) {
          return super.setGeometry.apply(this, arguments);
        }
        const { x, y, width, height } = geometry;

        if (alvisGraph.graph.isPort(cell)) {
          onMxGraphPortModified(
            alvisGraph.createPort({
              x,
              y,
              internalId: cell.getId(),
            }),
          );
        } else if (alvisGraph.graph.getModel().isEdge(cell)) {
        } else {
          // TO DO: save "ACTIVE_AGENT" type in some enum etc.
          // TO DO: change it to better check style attrubute may contain many styles
          const active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

          onMxGraphAgentModified(
            alvisGraph.createAgent({
              x,
              y,
              width,
              height,
              internalId: cell.getId(),
            }),
          );
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
    modifyMxGraph(mx, this.graph, this, this.onProcessChange);
    const oldCellConnected = this.graph.cellConnected;
    const graph = this.graph;
    this.graph.cellConnected = function() {
      if (!alvisGraph.isDuringInternalChanges()) {
        return;
      }

      return oldCellConnected.apply(graph, arguments);
    };
    this.parent = this.graph.getDefaultParent();

    this.graph.addListener((mx as any).mxEvent.CELLS_MOVED, function() {
      console.log(arguments);
    });

    this.graph.addListener((mx as any).mxEvent.CELLS_REMOVED, function() {
      console.log(arguments);
    });

    this.graph.addListener((mx as any).mxEvent.CLICK, (sender, event) => {
      const cell: mxClasses.mxCell = event.getProperty('cell');

      if (!cell || !cell.isVertex()) {
        return;
      }

      const cellId = cell.getId();
      const internalId = this.getInternalIdByMxGrpahId(cellId); // TODO: it would be more convinient to pass cell, not cellId
      // TODO: and even more convenient to store internalId in cell id.

      if (this.graph.isPort(cell)) {
        this.props.onPortClick(internalId);
        return;
      }

      this.props.onAgentClick(internalId);

      // event.consume(); // TODO: what it does?
    });

    this.graph.addListener((mx as any).mxEvent.CELLS_ADDED, (sender, evt) => {
      if (alvisGraph.isDuringInternalChanges()) {
        return;
      }

      const cells = evt.getProperty('cells');

      // TO DO: Check if this is a problem: during agent deletetion, the edge connected to agent's port is also deleted
      // but mxGraph also tries to delete this edge after it tries to delete agent - two actions are called delete_agent DELETE_cONNECTION
      if (
        cells &&
        cells.length > 0 &&
        alvisGraph.graph.getModel().isEdge(cells[0])
      ) {
        const target = evt.getProperty('target');
        const source = evt.getProperty('source');
        const direction = 'target';
        const style = 'straight';
        const sourcePortInternalId = alvisGraph.getInternalIdByMxGrpahId(
          source.getId(),
        );
        const targetPortInternalId = alvisGraph.getInternalIdByMxGrpahId(
          target.getId(),
        );

        onMxGraphConnectionAdded(
          alvisGraph.createConnection({
            sourcePortInternalId,
            targetPortInternalId,
            direction,
            style,
          }),
        );
      }
    });

    this.graph.setEnabled(this.props.active);

    this.instantiateOutline();
    this.restrictGraphViewToDivBoundries();

    // TO DO: check why this: // because you may receive props on start, and then method componentWillReceiveProps is not called!
    this.addChanges(agents, Map(), ports, Map(), connections, Map());

    this.applyChanges();
  }

  restrictGraphViewToDivBoundries() {
    // const { mx } = this.props;
    // this.graph.maximumGraphBounds = new mx.mxRectangle(0, 0, 500, 400);
  }

  public getMxGraphInstance = () => {
    return this.graph;
  };

  instantiateOutline() {
    const outlineDiv = document.getElementById('c-editor__outline');
    const outline = new mx.mxOutline(this.graph, outlineDiv);

    this.outline = outline;
  }

  addChanges(
    nextAgents: Map<string, IAgentRecord>,
    agents: Map<string, IAgentRecord>,
    nextPorts: Map<string, IPortRecord>,
    ports: Map<string, IPortRecord>,
    nextConnections: Map<string, IConnectionRecord>,
    connections: Map<string, IConnectionRecord>,
  ) {
    const agentsChanges = this.getAgentsChanges(nextAgents, agents);
    const portsChanges = this.getPortsChanges(nextPorts, ports);
    const connectionsChanges = this.getConnectionsChanges(
      nextConnections,
      connections,
    );

    this.changesToApply.push({
      agentsChanges,
      portsChanges,
      connectionsChanges,
    });
  }

  componentWillReceiveProps(nextProps: AlvisGraphProps, nextContext: any) {
    const { agents, ports, connections } = this.props;
    const nextAgents = nextProps.agents;
    const nextPorts = nextProps.ports;
    const nextConnections = nextProps.connections;

    this.addChanges(
      nextAgents,
      agents,
      nextPorts,
      ports,
      nextConnections,
      connections,
    );

    this.applyChanges();
  }

  shouldComponentUpdate(
    nextProps,
    nextState: AlvisGraphState,
    nextContext: any,
  ) {
    console.log('ATTENTION!!! shouldComponentUpdate');
    return true;
  }

  // componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
  componentDidUpdate(prevProps) {
    const { active } = this.props;

    this.graph.setEnabled(this.props.active);

    if (active && !prevProps.active) {
      this.outline.refresh();
    }

    if (!active) {
      this.graph.getSelectionModel().clear();
    }
  }

  componentWillUnmount() {
    this.graph.setEnabled(false);
    this.outline.destroy();
    this.graph.destroy();
  }

  render() {
    console.log(this.props);
    console.log('rendering AlivGraph COmponent');
    const className = classNames('c-alvis-graph', 'modal-container');

    return (
      <div className={className}>
        <div
          className="c-alvis-graph__graph"
          id={'alvis-graph-container-' + this.randomNumber}
        />
        <div
          className="c-alvis-graph__outline"
          id={'alvis-graph-outline-container-' + this.randomNumber}
        />
      </div>
    );
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
      // Sequence is VERY IMPORTANT!!!
      // TO DO: write down example why sequence is very important
      changes.connectionsChanges.deleted.forEach((deletedConnection) =>
        this.deleteConnection(deletedConnection),
      );
      changes.portsChanges.deleted.forEach((deletedPort) =>
        this.deletePort(deletedPort),
      );
      changes.agentsChanges.deleted.forEach((deletedAgent) =>
        this.deleteAgent(deletedAgent),
      );

      changes.agentsChanges.new.forEach((newAgent) => this.addAgent(newAgent));
      changes.portsChanges.new.forEach((newPort) => this.addPort(newPort));
      changes.connectionsChanges.new.forEach((newConnection) =>
        this.addConnection(newConnection),
      );

      changes.agentsChanges.modified.forEach(this.modifyAgent);
      changes.portsChanges.modified.forEach((modifiedPort) =>
        this.modifyPort(modifiedPort),
      );
      changes.connectionsChanges.modified.forEach((modifiedConnection) =>
        this.modifyConnection(modifiedConnection),
      );
    });
    this.endInternalChanges();

    this.outline.refresh(); // TO DO: This is because outline was not properly instantiated/refresh after new page was opened,
    // question is wheather it is best solution?

    this.changesToApply = [];
  }

  createConnection(connectionData: Partial<IConnection>): IConnectionRecord {
    const { connections } = this.props;
    const { internalId } = connectionData;
    const connection = internalId
      ? connections.get(internalId)
      : connectionRecordFactory({ internalId: newUuid() });

    return connection.merge(connectionData);
  }

  createPort(portData: Partial<IPort>): IPortRecord {
    const { ports } = this.props;
    const { internalId } = portData;
    const port = internalId
      ? ports.get(internalId)
      : portRecordFactory({ internalId: newUuid() });

    return port.merge(portData);
  }

  createAgent(agentData: Partial<IAgent>): IAgentRecord {
    const { internalId } = agentData;
    const { agents, pageInternalId } = this.props;
    const agent = internalId
      ? agents.get(internalId)
      : agentRecordFactory({ internalId: newUuid() });

    return agent.merge({
      // default values:
      pageInternalId, // TODO: should we allow to override it?
      running: 0,
      height: 100, // TODO: maybe set as default?
      width: 140,
      // custom values:
      ...agentData,
    });
  }

  createPage(name: string, supAgentInternalId: string): IPageRecord {
    return pageRecordFactory({
      supAgentInternalId,
      name,
      internalId: newUuid(), // TODO: we can delete it probably, isn't it the default in factory?
      agentsInternalIds: Set(),
      subPagesInternalIds: Set(),
    });
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

  getInternalIdByMxGrpahId(mxGraphId: string): string | undefined {
    return this.mxGraphIdsToInternalIds[mxGraphId];
  }

  private getMxGraphIdByInternalId(internalId: string): string | undefined {
    return this.internalIdsToMxGraphIds[internalId];
  }

  // TO DO
  private modifyAgent = (agent: IAgentRecord): IAgentRecord => {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphAgentId = this.getMxGraphIdByInternalId(agent.internalId);
      const model = this.graph.getModel();
      const cellToModify = model.getCell(mxGraphAgentId);

      // this.graph.translateCell(cellToModify, agent.x, agent.y);
      this.graph.resizeCell(
        cellToModify,
        new mx.mxRectangle(agent.x, agent.y, agent.width, agent.height),
        false,
      );
      model.setValue(cellToModify, agent.name);
      this.setAgentSpecificStyle(cellToModify, agent);

      if (agent.subPageInternalId !== null) {
        // Remove old (if exists), add new
        this.removeAgentHierarchyIconOverlayIfExists(cellToModify);
        this.addAgentHierarchyIconOverlay(cellToModify);
      } else {
        this.removeAgentHierarchyIconOverlayIfExists(cellToModify);
      }
    } finally {
      this.graph.getModel().endUpdate();
    }

    return agent;
  };

  private deleteAgent(agent: IAgentRecord): IAgentRecord {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphAgentId = this.getMxGraphIdByInternalId(agent.internalId);
      const cellToDelete = this.graph.getModel().getCell(mxGraphAgentId);

      this.graph.removeCells([cellToDelete]);
    } finally {
      this.graph.getModel().endUpdate();
    }

    return agent;
  }

  private changeActivePageToAgentSubPage(agentVertexId: string) {
    const { agents, onChangeActivePage } = this.props;
    const agentInternalId = this.getInternalIdByMxGrpahId(agentVertexId);
    const agentRecord = agents.get(agentInternalId);
    const newActivePageInternalId = agentRecord.subPageInternalId;

    onChangeActivePage(newActivePageInternalId);
  }

  private getAgentHierarchicalIconOverlay(agentVertexId: string) {
    return this.mxGraphIdsToHierarchicalIconOverlays[agentVertexId];
  }

  private setAgentHierarchicalIconOverlay(
    agentVertexId: string,
    overlay: mxClasses.mxCellOverlay,
  ) {
    this.mxGraphIdsToHierarchicalIconOverlays[agentVertexId] = overlay; // TO DO: Check why it does not check what is being assigned
  }

  private removeAgentHierarchyIconOverlayIfExists(
    agentVertex: mxClasses.mxCell,
  ) {
    const agentVertexId = agentVertex.getId();
    const overlay = this.getAgentHierarchicalIconOverlay(agentVertexId);

    if (!overlay) {
      return;
    }

    this.graph.removeCellOverlay(agentVertex, overlay);
    this.setAgentHierarchicalIconOverlay(agentVertexId, undefined);
  }

  // TO DO: add removing cell overlays from agents
  private addAgentHierarchyIconOverlay(agentVertex: mxClasses.mxCell) {
    const imgWidth = 23;
    const imgHeight = 12;
    // TO DO: string url to some variable etc.
    const overlay = new mx.mxCellOverlay(
      new mx.mxImage('../public/images/hierarchy_agent_arrow.png', 23, 12),
      'Go to subpage',
    );
    overlay.cursor = 'hand';
    overlay.offset = new mx.mxPoint(-imgWidth, -imgHeight);
    overlay.align = mx.mxConstants.ALIGN_RIGHT;
    overlay.verticalAlign = mx.mxConstants.ALIGN_BOTTOM;

    const agentVertexId = agentVertex.getId();

    overlay.addListener((mx as any).mxEvent.CLICK, (sender, event) => {
      this.changeActivePageToAgentSubPage(agentVertexId);
    });

    this.graph.addCellOverlay(agentVertex, overlay);
    this.setAgentHierarchicalIconOverlay(agentVertexId, overlay);
  }

  private getAgentMainStyle(agent: IAgentRecord): string {
    let agentStyle = agent.active === 1 ? 'ACTIVE_AGENT;' : 'PASSIVE_AGENT;';
    agentStyle += agent.running === 1 ? 'RUNNING;' : '';

    return agentStyle;
  }

  private setAgentSpecificStyle(
    agentVertex: mxClasses.mxCell,
    agentRecord: IAgentRecord,
  ): void {
    const agentFillColorStyle = 'fillColor=' + agentRecord.color + ';'; // TO DO: this.props.mx.mxConstants.STYLE_FILLCOLOR
    // this.graph.setCellStyles
    this.graph.setCellStyles('fillColor', agentRecord.color, [agentVertex]);
  }

  private addAgent(agent: IAgentRecord): IAgentRecord {
    this.graph.getModel().beginUpdate();
    try {
      const agentMainStyle = this.getAgentMainStyle(agent);
      const agentVertex = this.graph.insertVertex(
        this.parent,
        agent.internalId,
        agent.name,
        agent.x,
        agent.y,
        agent.width,
        agent.height,
        agentMainStyle,
      );
      agentVertex.setConnectable(false);
      this.setAgentSpecificStyle(agentVertex, agent);

      if (agent.subPageInternalId !== null) {
        this.addAgentHierarchyIconOverlay(agentVertex);
      }

      this.mxGraphIdsToInternalIds[agentVertex.getId()] = agent.internalId;
      this.internalIdsToMxGraphIds[agent.internalId] = agentVertex.getId();

      return agent;
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  private modifyPort(port: IPortRecord): IPortRecord {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphPortId = this.getMxGraphIdByInternalId(port.internalId);
      const cellToModify = this.graph.getModel().getCell(mxGraphPortId);
      const cellToModifyState = this.graph.view.getState(cellToModify);
      const cellToModifyParent = cellToModify.getParent();
      const cellToModifyParentState = this.graph.view.getState(
        cellToModifyParent,
      );
      const cellToModifyGeometry = cellToModify.geometry;
      const scale = this.graph.view.scale;
      const offsetNormalizedX = cellToModifyGeometry.offset.x * scale;
      const offsetNormalizedY = cellToModifyGeometry.offset.y * scale;
      // relativeDx = port.x - cellToModifyGeometry.x,
      // relativeDy = port.y - cellToModifyGeometry.y,
      const previousX = cellToModifyState.x - offsetNormalizedX;
      const previousY = cellToModifyState.y - offsetNormalizedY;
      const nextX =
        cellToModifyParentState.x + port.x * cellToModifyParentState.width;
      const nextY =
        cellToModifyParentState.y + port.y * cellToModifyParentState.height;
      const dx = nextX - previousX;
      const dy = nextY - previousY;

      this.graph.moveCells([cellToModify], dx, dy);
      cellToModify.setValue(port.name);
      this.setPortSpecificStyle(cellToModify, port);
      // this.graph.translateCell(cellToModify, port.x, port.y);
      // this.graph.resizeCell(cellToModify, new mx.mxRectangle(port.x, port.y, 20, 20), false);
    } finally {
      this.graph.getModel().endUpdate();
    }

    return port;
  }

  private deletePort(port: IPortRecord): IPortRecord {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphPortId = this.getMxGraphIdByInternalId(port.internalId);
      const cellToDelete = this.graph.getModel().getCell(mxGraphPortId);

      this.graph.removeCells([cellToDelete]);
    } finally {
      this.graph.getModel().endUpdate();
    }

    return port;
  }

  private getPortMainStyle(port: IPortRecord): string {
    return 'PORT_STYLE;';
  }

  private setPortSpecificStyle(
    portVertex: mxClasses.mxCell,
    portRecord: IPortRecord,
  ): void {
    let labelPosition = 'center';
    let verticalLabelPosition = 'middle';
    let align = 'center';
    let verticalAlign = 'middle';

    switch (portRecord.x) {
      case 1:
        labelPosition = 'left';
        align = 'right';
        break;
      case 0:
        labelPosition = 'right';
        align = 'left';
        break;
      default:
        switch (portRecord.y) {
          case 1:
            verticalLabelPosition = 'top';
            verticalAlign = 'bottom';
            break;
          case 0:
            verticalLabelPosition = 'bottom';
            verticalAlign = 'top';
        }
    }

    // TO DO: change labelPosition etc. to mxConstants
    this.graph.setCellStyles('labelPosition', labelPosition, [portVertex]);
    this.graph.setCellStyles('verticalLabelPosition', verticalLabelPosition, [
      portVertex,
    ]);
    this.graph.setCellStyles('align', align, [portVertex]);
    this.graph.setCellStyles('verticalAlign', verticalAlign, [portVertex]);
    this.graph.setCellStyles('fillColor', portRecord.color, [portVertex]);
  }

  private addPort(port: IPortRecord): IPortRecord {
    this.graph.getModel().beginUpdate();
    try {
      const portAgentMxGraphId = this.getMxGraphIdByInternalId(
        port.agentInternalId,
      );
      const portAgentVertex = this.graph.getModel().getCell(portAgentMxGraphId);
      const portMainStyle = this.getPortMainStyle(port);

      const portVertex = this.graph.insertVertex(
        portAgentVertex,
        port.internalId,
        port.name,
        port.x,
        port.y,
        20,
        20,
        portMainStyle,
      );
      portVertex.geometry.offset = new mx.mxPoint(-10, -10);
      portVertex.geometry.relative = true;

      this.setPortSpecificStyle(portVertex, port);

      this.mxGraphIdsToInternalIds[portVertex.getId()] = port.internalId;
      this.internalIdsToMxGraphIds[port.internalId] = portVertex.getId();

      return port;
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  private getConnectionMainStyle(connection: IConnectionRecord): string {
    const sourcePortMxGraphId = this.getMxGraphIdByInternalId(
      connection.sourcePortInternalId,
    );
    const targetPortMxGraphId = this.getMxGraphIdByInternalId(
      connection.targetPortInternalId,
    );
    const connectionMainStyle = `CONNECTION;sourcePort=${sourcePortMxGraphId};targetPort=${targetPortMxGraphId};`;

    return connectionMainStyle;
  }

  private setConnectionSpecificStyle(
    connectionVertex: mxClasses.mxCell,
    connectionRecord: IConnectionRecord,
  ): void {
    let startArrow;
    let endArrow;

    switch (connectionRecord.direction) {
      case 'target':
        startArrow = 'none';
        endArrow = 'block';
        break;
      case 'source':
        startArrow = 'block';
        endArrow = 'none';
        break;
      case 'none':
        startArrow = 'none';
        endArrow = 'none';
    }

    this.graph.setCellStyles(mx.mxConstants.STYLE_STARTARROW, startArrow, [
      connectionVertex,
    ]);
    this.graph.setCellStyles(mx.mxConstants.STYLE_ENDARROW, endArrow, [
      connectionVertex,
    ]);
  }

  private addConnection(connection: IConnectionRecord): IConnectionRecord {
    const { ports } = this.props;
    this.graph.getModel().beginUpdate();
    try {
      const sourcePortMxGraphId = this.getMxGraphIdByInternalId(
        connection.sourcePortInternalId,
      );
      const targetPortMxGraphId = this.getMxGraphIdByInternalId(
        connection.targetPortInternalId,
      );
      // can it be whatever port recordafter change? Maybe we should rather provide port from state of this change
      // targetPortRecord = this.getElementByInternalId(ports, connection.targetPortInternalId),
      const connectionMainStyle = this.getConnectionMainStyle(connection);

      const edgeCell = this.graph.insertEdge(
        this.parent,
        connection.internalId,
        '',
        this.graph.getModel().getCell(sourcePortMxGraphId),
        this.graph.getModel().getCell(targetPortMxGraphId),
        connectionMainStyle,
      );

      this.setConnectionSpecificStyle(edgeCell, connection);

      this.mxGraphIdsToInternalIds[edgeCell.getId()] = connection.internalId;
      this.internalIdsToMxGraphIds[connection.internalId] = edgeCell.getId();

      return connection;
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  private modifyConnection(connection: IConnectionRecord): IConnectionRecord {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphConnectionId = this.getMxGraphIdByInternalId(
        connection.internalId,
      );
      const cellToModify = this.graph.getModel().getCell(mxGraphConnectionId);

      this.setConnectionSpecificStyle(cellToModify, connection);
    } finally {
      this.graph.getModel().endUpdate();
    }

    return connection;
  }

  private deleteConnection(connection: IConnectionRecord): IConnectionRecord {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphConnectionId = this.getMxGraphIdByInternalId(
        connection.internalId,
      );
      const cellToDelete = this.graph.getModel().getCell(mxGraphConnectionId);

      this.graph.removeCells([cellToDelete]);
    } finally {
      this.graph.getModel().endUpdate();
    }

    return connection;
  }

  // TO DO: look for optimizations
  private getBasicChanges<
    T extends IAgentRecord | IPortRecord | IConnectionRecord
  >(next: Map<string, T>, current: Map<string, T>): GraphElementsChanges<T> {
    const nextInternalIds = next.map((el) => el.internalId);
    const currentInternalIds = current.map((el) => el.internalId);
    const newElements = next.filter(
      (el) => !currentInternalIds.contains(el.internalId),
    );
    const deletedElements = current.filter(
      (el) => !nextInternalIds.contains(el.internalId),
    );
    const notNewNextElements = next.filter((el) => el.internalId !== null);
    const modifiedElements = notNewNextElements.filter((el) => {
      const currentElRecord = current.get(el.internalId);
      return currentElRecord != null && !currentElRecord.equals(el);
    });

    return {
      new: newElements.toList(),
      deleted: deletedElements.toList(),
      modified: modifiedElements.toList(),
    };
  }

  private getAgentsChanges<T extends IAgentRecord>(
    next: Map<string, T>,
    current: Map<string, T>,
  ): GraphElementsChanges<T> {
    return this.getBasicChanges(next, current);
  }

  private getConnectionsChanges<T extends IConnectionRecord>(
    next: Map<string, T>,
    current: Map<string, T>,
  ): GraphElementsChanges<T> {
    return this.getBasicChanges(next, current);
  }

  // TO DO: look for optimizations
  // TO DO: check do we need something similar for connections?
  private getPortsChanges<T extends IPortRecord>(
    next: Map<string, T>,
    current: Map<string, T>,
  ): GraphElementsChanges<T> {
    const basicChanges = this.getBasicChanges(next, current);
    // Ports whose agentInternalId has changed and internalId has not changed
    // should be removed and then readded to new agent
    const portsIdsWhoseAgentChanged = basicChanges.modified
      .filter((modifiedPort) => {
        const currentPortRecord = current.get(modifiedPort.internalId);
        return (
          modifiedPort.agentInternalId !== currentPortRecord.agentInternalId
        );
      })
      .map((port) => port.internalId);
    const portsWhoseAgentChangedToAdd = next.filter((port) =>
      portsIdsWhoseAgentChanged.contains(port.internalId),
    );
    const portsWhoseAgentChangedToDelete = current.filter((port) =>
      portsIdsWhoseAgentChanged.contains(port.internalId),
    );

    return {
      new: basicChanges.new.concat(portsWhoseAgentChangedToAdd.toList()),
      deleted: basicChanges.deleted.concat(
        portsWhoseAgentChangedToDelete.toList(),
      ),
      modified: basicChanges.modified.filter(
        (port) => !portsIdsWhoseAgentChanged.contains(port.internalId),
      ),
    };
  }

  public zoomIn(): void {
    this.graph.zoomIn();
  }

  public zoomOut(): void {
    this.graph.zoomOut();
  }
}

interface GraphElementsChanges<T> {
  new: List<T>;
  deleted: List<T>;
  modified: List<T>;
}

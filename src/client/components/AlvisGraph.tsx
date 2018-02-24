import * as React from 'react';
import * as mxClasses from 'mxgraphAllClasses';
import {
  ButtonToolbar,
  ButtonGroup,
  Button,
  Glyphicon,
  Modal,
  FormGroup,
  FormControl,
  ControlLabel,
} from 'react-bootstrap';

import modifyMxGraph from '../utils/mxGraphModifier';
import { getListElementByInternalId } from '../utils/alvisProject';
import { mx } from '../utils/mx';

import {
  IPageRecord,
  pageRecordFactory,
  IAgentRecord,
  agentRecordFactory,
  IPortRecord,
  portRecordFactory,
  IConnectionRecord,
  connectionRecordFactory,
  IInternalRecord,
  IAlvisPageElement,
  ConnectionDirection,
} from '../models/alvisProject';
import { List } from 'immutable';

// TO DO: Problem with moving edeges between ports is because of
// mxEdgeHandler.prototype.createMarker = function()
// marker.isValidState ....

export interface AlvisGraphProps {
  agents: List<IAgentRecord>;
  ports: List<IPortRecord>;
  connections: List<IConnectionRecord>;
  pageInternalId: string;

  onChangeActivePage: (newActivePageInternalId: string) => void;

  onMxGraphPageAdded: (page: IPageRecord) => any;

  onMxGraphAgentAdded: (agent: IAgentRecord) => any;
  onMxGraphAgentDeleted: (agentInternalId: string) => any;
  onMxGraphAgentModified: (agent: IAgentRecord) => any;

  onMxGraphPortAdded: (port: IPortRecord) => any;
  onMxGraphPortDeleted: (portInternalId: string) => any;
  onMxGraphPortModified: (port: IPortRecord) => any;

  onMxGraphConnectionAdded: (connection: IConnectionRecord) => any;
  onMxGraphConnectionDeleted: (connectionInternalId: string) => any;
  onMxGraphConnectionModified: (connection: IConnectionRecord) => any;

  getNameFromUser: (callback: (chosenName: string) => void) => void;
}

import { getPortAgent } from '../utils/alvisProject';
// import { modifyConnection } from '../actions/project';

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
    const alvisGraph = this;
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
          const parentId = parent.getId(),
            parentInternalId = alvisGraph.getInternalIdByMxGrpahId(parentId);

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
          const s = child.getTerminal(true),
            t = child.getTerminal(false);
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
              name: child.getValue(),
              active,
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
              mxGraphId: cell.getId(),
            }),
          );
        } else if (alvisGraph.graph.getModel().isEdge(cell)) {
        } else {
          onMxGraphAgentModified(
            alvisGraph.createAgent({
              name: value,
              mxGraphId: cell.getId(),
            }),
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
          const { x, y, width, height } = cell.geometry, // TO DO: We dont use it!!!
            // TO DO: save "ACTIVE_AGENT" type in some enum etc.
            // TO DO: change it to better check style attrubute may contain many styles
            active = cell.style === 'AGENT_ACTIVE' ? 1 : 0;

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
              mxGraphId: cell.getId(),
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
              mxGraphId: cell.getId(),
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

    this.graph.addListener((mx as any).mxEvent.CELLS_ADDED, function(
      sender,
      evt,
    ) {
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
        const target = evt.getProperty('target'),
          source = evt.getProperty('source'),
          direction = 'target',
          style = 'straight',
          sourcePortInternalId = alvisGraph.getInternalIdByMxGrpahId(
            source.getId(),
          ),
          targetPortInternalId = alvisGraph.getInternalIdByMxGrpahId(
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

    this.instantiateOutline();
    this.restrictGraphViewToDivBoundries();

    // TO DO: check why this: // because you may receive props on start, and then method componentWillReceiveProps is not called!
    this.addChanges(agents, List(), ports, List(), connections, List());

    this.applyChanges();
  }

  restrictGraphViewToDivBoundries() {
    // const { mx } = this.props;
    // this.graph.maximumGraphBounds = new mx.mxRectangle(0, 0, 500, 400);
  }

  instantiateOutline() {
    const outlineDiv = document.getElementById(
        'alvis-graph-outline-container-' + this.randomNumber,
      ),
      outline = new mx.mxOutline(this.graph, outlineDiv);

    this.outline = outline;
  }

  addChanges(
    nextAgents: List<IAgentRecord>,
    agents: List<IAgentRecord>,
    nextPorts: List<IPortRecord>,
    ports: List<IPortRecord>,
    nextConnections: List<IConnectionRecord>,
    connections: List<IConnectionRecord>,
  ) {
    const agentsChanges = this.getAgentsChanges(nextAgents, agents),
      portsChanges = this.getPortsChanges(nextPorts, ports),
      connectionsChanges = this.getConnectionsChanges(
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
    const nextAgents = nextProps.agents,
      nextPorts = nextProps.ports,
      nextConnections = nextProps.connections;

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
    return false;
  }

  // componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void;
  // componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void;
  // componentWillUnmount?(): void;

  render() {
    console.log(this.props);
    console.log('rendering AlivGraph COmponent');

    return (
      <div className="modal-container">
        <div
          id={'alvis-graph-container-' + this.randomNumber}
          style={{ overflow: 'hidden', height: '400px' }}
        />
        <div
          id={'alvis-graph-outline-container-' + this.randomNumber}
          style={{ height: '200px' }}
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

      changes.agentsChanges.modified.forEach((modifiedAgent) =>
        this.modifyAgent(modifiedAgent),
      );
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

  private getElementByInternalId<T extends IAlvisPageElement>(
    listOfElements: List<T>,
    internalId: string,
  ): T {
    const elementIndex = listOfElements.findIndex(
      (element) => element.internalId === internalId,
    );

    if (elementIndex !== -1) {
      return listOfElements.get(elementIndex);
    }
  }

  private setIfNotUndefined<T extends IAlvisPageElement>(
    element: T,
    key: string,
    value: any,
  ): T {
    if (value !== undefined) {
      return element.set(key, value) as T; // TO DO: Check why I must cast??
      // Will this site be helpful: https://stackoverflow.com/questions/43300008/type-is-not-assignable-to-generic-type ?
    }
    return element;
  }

  createConnection({
    sourcePortInternalId = undefined,
    targetPortInternalId = undefined,
    direction = undefined,
    style = undefined,
    internalId = undefined,
    mxGraphId = undefined,
  }: {
    sourcePortInternalId?: string;
    targetPortInternalId?: string;
    direction?: ConnectionDirection;
    style?: string;
    internalId?: string;
    mxGraphId?: string;
  }): IConnectionRecord {
    const { connections } = this.props;

    if (internalId || mxGraphId) {
      const connection: IConnectionRecord = this.getElementByInternalId(
        connections,
        internalId ? internalId : this.getInternalIdByMxGrpahId(mxGraphId),
      );
      if (!connection) {
        throw 'No connection with given internal or mxGraph ID!';
      }

      let modifiedConnection = connection;
      modifiedConnection = this.setIfNotUndefined(
        modifiedConnection,
        'sourcePortInternalId',
        sourcePortInternalId,
      );
      modifiedConnection = this.setIfNotUndefined(
        modifiedConnection,
        'targetPortInternalId',
        targetPortInternalId,
      );
      modifiedConnection = this.setIfNotUndefined(
        modifiedConnection,
        'direction',
        direction,
      );
      modifiedConnection = this.setIfNotUndefined(
        modifiedConnection,
        'style',
        style,
      );

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

  createPort({
    x = undefined,
    y = undefined,
    name = undefined,
    color = undefined,
    agentInternalId = undefined,
    internalId = undefined,
    mxGraphId = undefined,
  }: {
    x?: number;
    y?: number;
    name?: string;
    color?: string;
    agentInternalId?: string;
    internalId?: string;
    mxGraphId?: string;
  }): IPortRecord {
    const { ports } = this.props;

    if (internalId || mxGraphId) {
      const port: IPortRecord = this.getElementByInternalId(
        ports,
        internalId ? internalId : this.getInternalIdByMxGrpahId(mxGraphId),
      );
      if (!port) {
        throw 'No port with given internal or mxGraph ID!';
      }

      let modifiedPort = port;
      modifiedPort = this.setIfNotUndefined(modifiedPort, 'x', x);
      modifiedPort = this.setIfNotUndefined(modifiedPort, 'y', y);
      modifiedPort = this.setIfNotUndefined(modifiedPort, 'name', name);
      modifiedPort = this.setIfNotUndefined(modifiedPort, 'color', color);
      modifiedPort = this.setIfNotUndefined(
        modifiedPort,
        'agentInternalId',
        agentInternalId,
      );

      return modifiedPort;
    }

    return portRecordFactory({
      internalId: null,
      name,
      x,
      y,
      color,
      agentInternalId,
    });
  }

  createAgent({
    x = undefined,
    y = undefined,
    width = undefined,
    height = undefined,
    name = undefined,
    running = undefined,
    active = undefined,
    color = undefined,
    subPageInternalId = undefined,
    internalId = undefined,
    mxGraphId = undefined,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    name?: string;
    running?: number;
    active?: number;
    color?: string;
    subPageInternalId?: string;
    internalId?: string;
    mxGraphId?: string;
  }): IAgentRecord {
    const { agents, pageInternalId } = this.props;

    if (internalId || mxGraphId) {
      const agent: IAgentRecord = this.getElementByInternalId(
        agents,
        internalId ? internalId : this.getInternalIdByMxGrpahId(mxGraphId),
      );
      if (!agent) {
        throw 'No port with given internal or mxGraph ID!';
      }

      let modifiedAgent = agent;
      modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'x', x);
      modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'y', y);
      modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'width', width);
      modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'height', height);
      modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'name', name);
      modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'active', active);
      modifiedAgent = this.setIfNotUndefined(modifiedAgent, 'color', color);
      modifiedAgent = this.setIfNotUndefined(
        modifiedAgent,
        'subPageInternalId',
        subPageInternalId,
      );

      return modifiedAgent;
    }

    return agentRecordFactory({
      internalId,
      name,
      portsInternalIds: List<string>([]),
      index: null,
      active,
      running: running !== undefined ? running : 0,
      height: height !== undefined ? height : 100,
      width: width !== undefined ? width : 140,
      x,
      y,
      color,
      pageInternalId,
      subPageInternalId:
        subPageInternalId !== undefined ? subPageInternalId : null,
    });
  }

  createPage(name: string, supAgentInternalId: string): IPageRecord {
    return pageRecordFactory({
      internalId: null,
      name,
      agentsInternalIds: List<string>(),
      subPagesInternalIds: List<string>(),
      supAgentInternalId,
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
  private modifyAgent(agent: IAgentRecord): IAgentRecord {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphAgentId = this.getMxGraphIdByInternalId(agent.internalId),
        cellToModify = this.graph.getModel().getCell(mxGraphAgentId);

      // this.graph.translateCell(cellToModify, agent.x, agent.y);
      this.graph.resizeCell(
        cellToModify,
        new mx.mxRectangle(agent.x, agent.y, agent.width, agent.height),
        false,
      );
      cellToModify.setValue(agent.name);
      this.setAgentSpecificStyle(cellToModify, agent);

      if (agent.subPageInternalId !== null) {
        //Remove old (if exists), add new
        this.removeAgentHierarchyIconOverlayIfExists(cellToModify);
        this.addAgentHierarchyIconOverlay(cellToModify);
      } else {
        this.removeAgentHierarchyIconOverlayIfExists(cellToModify);
      }
    } finally {
      this.graph.getModel().endUpdate();
    }

    return agent;
  }

  private deleteAgent(agent: IAgentRecord): IAgentRecord {
    this.graph.getModel().beginUpdate();
    try {
      const mxGraphAgentId = this.getMxGraphIdByInternalId(agent.internalId),
        cellToDelete = this.graph.getModel().getCell(mxGraphAgentId);

      this.graph.removeCells([cellToDelete]);
    } finally {
      this.graph.getModel().endUpdate();
    }

    return agent;
  }

  private changeActivePageToAgentSubPage(agentVertexId: string) {
    const { agents, onChangeActivePage } = this.props;
    const agentInternalId = this.getInternalIdByMxGrpahId(agentVertexId),
      agentRecord = getListElementByInternalId(agents, agentInternalId),
      newActivePageInternalId = agentRecord.subPageInternalId;

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
    const agentVertexId = agentVertex.getId(),
      overlay = this.getAgentHierarchicalIconOverlay(agentVertexId);

    if (!overlay) {
      return;
    }

    this.graph.removeCellOverlay(agentVertex, overlay);
    this.setAgentHierarchicalIconOverlay(agentVertexId, undefined);
  }

  // TO DO: add removing cell overlays from agents
  private addAgentHierarchyIconOverlay(agentVertex: mxClasses.mxCell) {
    const imgWidth = 23,
      imgHeight = 12,
      // TO DO: string url to some variable etc.
      overlay = new mx.mxCellOverlay(
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
      let agentMainStyle = this.getAgentMainStyle(agent);
      const agentVertex = this.graph.insertVertex(
        this.parent,
        null,
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
      const mxGraphPortId = this.getMxGraphIdByInternalId(port.internalId),
        cellToModify = this.graph.getModel().getCell(mxGraphPortId),
        cellToModifyState = this.graph.view.getState(cellToModify),
        cellToModifyParent = cellToModify.getParent(),
        cellToModifyParentState = this.graph.view.getState(cellToModifyParent),
        cellToModifyGeometry = cellToModify.geometry,
        scale = this.graph.view.scale,
        offsetNormalizedX = cellToModifyGeometry.offset.x * scale,
        offsetNormalizedY = cellToModifyGeometry.offset.y * scale,
        // relativeDx = port.x - cellToModifyGeometry.x,
        // relativeDy = port.y - cellToModifyGeometry.y,
        previousX = cellToModifyState.x - offsetNormalizedX,
        previousY = cellToModifyState.y - offsetNormalizedY,
        nextX =
          cellToModifyParentState.x + port.x * cellToModifyParentState.width,
        nextY =
          cellToModifyParentState.y + port.y * cellToModifyParentState.height,
        dx = nextX - previousX,
        dy = nextY - previousY;

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
      const mxGraphPortId = this.getMxGraphIdByInternalId(port.internalId),
        cellToDelete = this.graph.getModel().getCell(mxGraphPortId);

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
    let labelPosition = 'center',
      verticalLabelPosition = 'middle',
      align = 'center',
      vertivalAlign = 'middle';

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
            vertivalAlign = 'bottom';
            break;
          case 0:
            verticalLabelPosition = 'bottom';
            vertivalAlign = 'top';
        }
    }

    // TO DO: change labelPosition etc. to mxConstants
    this.graph.setCellStyles('labelPosition', labelPosition, [portVertex]);
    this.graph.setCellStyles('verticalLabelPosition', verticalLabelPosition, [
      portVertex,
    ]);
    this.graph.setCellStyles('align', align, [portVertex]);
    this.graph.setCellStyles('verticalAlign', vertivalAlign, [portVertex]);
  }

  private addPort(port: IPortRecord): IPortRecord {
    this.graph.getModel().beginUpdate();
    try {
      const portAgentMxGraphId = this.getMxGraphIdByInternalId(
          port.agentInternalId,
        ),
        portAgentVertex = this.graph.getModel().getCell(portAgentMxGraphId),
        portMainStyle = this.getPortMainStyle(port);

      var portVertex = this.graph.insertVertex(
        portAgentVertex,
        null,
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
      ),
      targetPortMxGraphId = this.getMxGraphIdByInternalId(
        connection.targetPortInternalId,
      ),
      connectionMainStyle = `CONNECTION;sourcePort=${sourcePortMxGraphId};targetPort=${targetPortMxGraphId};`;

    return connectionMainStyle;
  }

  private setConnectionSpecificStyle(
    connectionVertex: mxClasses.mxCell,
    connectionRecord: IConnectionRecord,
  ): void {
    let startArrow, endArrow;

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
        ),
        targetPortMxGraphId = this.getMxGraphIdByInternalId(
          connection.targetPortInternalId,
        ),
        // can it be whatever port recordafter change? Maybe we should rather provide port from state of this change
        // targetPortRecord = this.getElementByInternalId(ports, connection.targetPortInternalId),
        connectionMainStyle = this.getConnectionMainStyle(connection);

      const edgeCell = this.graph.insertEdge(
        this.parent,
        null,
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
        ),
        cellToModify = this.graph.getModel().getCell(mxGraphConnectionId);

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
        ),
        cellToDelete = this.graph.getModel().getCell(mxGraphConnectionId);

      this.graph.removeCells([cellToDelete]);
    } finally {
      this.graph.getModel().endUpdate();
    }

    return connection;
  }

  // TO DO: look for optimizations
  private getBasicChanges<
    T extends IAgentRecord | IPortRecord | IConnectionRecord
  >(next: List<T>, current: List<T>): GraphElementsChanges<T> {
    const getByInternalId = (
      elements: List<T>,
      internalId: string,
    ): T | null => {
      return elements.find((el) => el.internalId === internalId);
    };
    const nextInternalIds = next.map((el) => el.internalId),
      currentInternalIds = current.map((el) => el.internalId),
      newElements = next
        .filter((el) => !currentInternalIds.contains(el.internalId))
        .toList(),
      deletedElements = current
        .filter((el) => !nextInternalIds.contains(el.internalId))
        .toList(),
      notNewNextElements = next.filter((el) => el.internalId !== null),
      modifiedElements = notNewNextElements
        .filter((el) => {
          const currentElRecord = getByInternalId(current, el.internalId);
          return currentElRecord != null && !currentElRecord.equals(el);
        })
        .toList();

    return {
      new: newElements,
      deleted: deletedElements,
      modified: modifiedElements,
    };
  }

  private getAgentsChanges<T extends IAgentRecord>(
    next: List<T>,
    current: List<T>,
  ): GraphElementsChanges<T> {
    return this.getBasicChanges(next, current);
  }

  private getConnectionsChanges<T extends IConnectionRecord>(
    next: List<T>,
    current: List<T>,
  ): GraphElementsChanges<T> {
    return this.getBasicChanges(next, current);
  }

  // TO DO: look for optimizations
  // TO DO: check do we need something similar for connections?
  private getPortsChanges<T extends IPortRecord>(
    next: List<T>,
    current: List<T>,
  ): GraphElementsChanges<T> {
    const getByInternalId = (
      elements: List<T>,
      internalId: string,
    ): T | null => {
      return elements.find((el) => el.internalId === internalId);
    };
    const basicChanges = this.getBasicChanges(next, current),
      // Ports whose agentInternalId has changed and internalId has not changed
      // should be removed and then readded to new agent
      portsIdsWhoseAgentChanged = basicChanges.modified
        .filter((modifiedPort) => {
          const currentPortRecord = getByInternalId(
            current,
            modifiedPort.internalId,
          );
          return (
            modifiedPort.agentInternalId !== currentPortRecord.agentInternalId
          );
        })
        .map((port) => port.internalId)
        .toList(),
      portsWhoseAgentChangedToAdd = next.filter((port) =>
        portsIdsWhoseAgentChanged.contains(port.internalId),
      ),
      portsWhoseAgentChangedToDelete = current.filter((port) =>
        portsIdsWhoseAgentChanged.contains(port.internalId),
      );

    return {
      new: basicChanges.new.concat(portsWhoseAgentChangedToAdd).toList(),
      deleted: basicChanges.deleted
        .concat(portsWhoseAgentChangedToDelete)
        .toList(),
      modified: basicChanges.modified
        .filter((port) => !portsIdsWhoseAgentChanged.contains(port.internalId))
        .toList(),
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

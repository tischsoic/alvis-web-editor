import * as React from 'react';
import * as classNames from 'classnames';
import * as mxClasses from 'mxgraphAllClasses';
import {
  agentRecordFactory,
  ConnectionDirection,
  IAlvisProjectRecord,
  IAgent,
  IAgentRecord,
  IPortRecord,
  IConnectionRecord,
  ConnectionStyle,
  IConnection,
  pageRecordFactory,
  portRecordFactory,
  IPort,
} from '../models/alvisProject';
import { List, OrderedSet } from 'immutable';
import { ButtonGroup, ButtonToolbar } from 'react-bootstrap';
// TODO: add some TS types etc.
import { saveAs } from 'file-saver';

import { ColorPicker } from './ColorPicker/ColorPicker';
import { AlvisGraph } from './AlvisGraph';
import { NamePicker } from './NamePicker';
import { newUuid } from '../utils/uuidGenerator';
import { mx } from '../utils/mx';
import { Tab, TabProps } from './Tab/Tab';
import { Tabs } from './Tab/Tabs';
import EditorButtonSave from './EditorSaveButton/EditorButtonSave';
import { EditorButton } from './EditorButton/EditorButton';
import { IPartialModification } from '../models/project';

const style = require('./AlvisGraphPanel.scss');

// TODO: add some TS types etc.
declare let canvg: any;

// TODO: should be immutable Record
export type IPageSelection = {
  agents: string[];
  ports: string[];
  connections: string[];
};

export interface AlvisGraphPanelProps {
  alvisProject: IAlvisProjectRecord;
  activePageId: string | null;
  openedPagesIds: OrderedSet<string>;

  onChangeActivePage: (newActivePageId: string) => void;
  onClosePage: (pageId: string) => void;

  onProjectModify: (modification: IPartialModification) => any;

  onHierarchyRemove: (agentId: string) => void;

  onUndo: () => any;
  onRedo: () => any;

  onCopy: (elementsIds: string[]) => any;
  onCut: (elementsIds: string[]) => any;
  onPaste: (pageId: string) => any;

  // saveProjectToServer: () => void
}

export interface AlvisGraphPanelState {
  selectedColor: string;
  isColoringModeEnabled: boolean;
  selection: IPageSelection;
}

export class AlvisGraphPanel extends React.Component<
  AlvisGraphPanelProps,
  AlvisGraphPanelState
> {
  constructor(props: AlvisGraphPanelProps) {
    super(props);

    this.state = {
      selectedColor: '#000',
      isColoringModeEnabled: false,
      selection: {
        agents: [],
        ports: [],
        connections: [],
      },
    };

    this.getNameFromUser = this.getNameFromUser.bind(this);
    this.onColorSelect = this.onColorSelect.bind(this);

    this.addActiveAgentBtn = React.createRef();
    this.addStaticAgentBtn = React.createRef();
  }

  activeAlvisGraph: AlvisGraph | null = null;
  namePicker: NamePicker | null = null;
  addActiveAgentBtn: React.RefObject<HTMLButtonElement>;
  addStaticAgentBtn: React.RefObject<HTMLButtonElement>;

  private getDragPreviewElement = (isActive: boolean) => {
    const dragElt = document.createElement('div');

    dragElt.style.border = 'dashed black 1px';
    dragElt.style.borderRadius = isActive ? '15px' : '0px';
    dragElt.style.width = '140px';
    dragElt.style.height = '100px';

    return dragElt;
  };

  private onAgentDrop = (x, y, isActive: boolean) => {
    this.addAgent({ x, y, active: isActive ? 1 : 0 });
  };

  private addAgent = (agentData: Partial<IAgent>) => {
    const { onProjectModify, activePageId: activePageInternalId } = this.props;
    const agent = agentRecordFactory({
      // TODO: create util for creating objects like this.
      internalId: newUuid(),
      color: 'white',
      pageInternalId: activePageInternalId,
      running: 0,
      height: 100,
      width: 140,
      ...agentData,
    });

    onProjectModify({
      agents: { added: List([agent]) },
    });
  };

  private getActiveMxGraphInstance = () => {
    return this.activeAlvisGraph.getMxGraphInstance();
  };

  private onGetGraphImage = () => {
    const mxGraph = this.activeAlvisGraph.getMxGraphInstance();

    mxGraph.fit(undefined, undefined, 10);
    mxGraph.setSelectionCells([]);

    const svg: SVGElement = mxGraph.container.querySelector('svg');
    const svgG = svg.childNodes[0] as SVGElement;
    const serializer = new XMLSerializer();
    const gSerialized = serializer.serializeToString(svgG);
    const { width, height } = svg.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const svgString = `<svg style="width: 100%; height: 100%; display: block; width: ${width}px; height: ${height}px;">
      ${gSerialized}
    </svg>`;

    canvas.width = width;
    canvas.height = height;
    canvg(canvas, svgString, {
      ignoreMouse: true,
      ignoreAnimation: true,
      renderCallback: () => {
        canvas.toBlob((blob) => {
          saveAs(blob, 'diagram.png');
        });
      },
    });
  };

  componentDidMount() {
    mx.mxUtils.makeDraggable(
      this.addActiveAgentBtn.current,
      this.getActiveMxGraphInstance,
      (graph, evt, target, x, y) => this.onAgentDrop(x, y, true),
      this.getDragPreviewElement(true),
      null,
      null,
      null,
      true as any, // TODO: `as any` is temp
    );

    mx.mxUtils.makeDraggable(
      this.addStaticAgentBtn.current,
      this.getActiveMxGraphInstance,
      (graph, evt, target, x, y) => this.onAgentDrop(x, y, false),
      this.getDragPreviewElement(false),
      null,
      null,
      null,
      true as any,
    );

    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  private getSelectedElementsIds(): string[] {
    const mxGraph = this.activeAlvisGraph.getMxGraphInstance();
    const selectedCells = mxGraph.getSelectionCells();
    const elementsIds = selectedCells.map((cell) => cell.getId());

    return elementsIds;
  }

  private handleCopy = (): void => {
    const { onCopy } = this.props;
    const elementsIds = this.getSelectedElementsIds();

    if (elementsIds.length !== 0) {
      onCopy(elementsIds);
    }
  };

  private handleCut = (): void => {
    const { onCut } = this.props;
    const elementsIds = this.getSelectedElementsIds();

    if (elementsIds.length !== 0) {
      onCut(elementsIds);
    }
  };

  private handlePaste = (): void => {
    const { onPaste } = this.props;
    const { activePageId } = this.props;

    onPaste(activePageId);
  };

  private handleConnectionModify = (connectionId: string) => (
    connectionData: Partial<IConnection>,
  ) => () => {
    const { onProjectModify, alvisProject: { connections } } = this.props;
    const connection = connections.get(connectionId);
    const modifiedConnection = connection
      .merge(connectionData)
      .set('internalId', connection.internalId);

    onProjectModify({
      connections: { modified: List([modifiedConnection]) },
    });
  };

  private handleConnectionDelete = (connectionId: string) => () => {
    this.props.onProjectModify({
      connections: { deleted: List([connectionId]) },
    });
  };

  private handlePageAdd = (agentId: string) => () => {
    this.getNameFromUser((chosenName: string) => {
      if (chosenName === null) {
        return;
      }

      const page = pageRecordFactory({
        internalId: newUuid(),
        name: chosenName,
        supAgentInternalId: agentId,
      });

      this.props.onProjectModify({
        pages: { added: List([page]) },
      });
    });
  };

  private handlePortAdd = (agentId: string) => () => {
    const port = portRecordFactory({
      internalId: newUuid(),
      name: 'port_',
      agentInternalId: agentId,
      x: 0,
      y: 0.2,
    });

    this.props.onProjectModify({
      ports: { added: List([port]) },
    });
  };

  private handleHierarchyRemove = (agentId: string) => () => {
    this.props.onHierarchyRemove(agentId);
  };

  private handleAgentModify = (agentId: string) => (
    agentData: Partial<IAgent>,
  ) => () => {
    const { onProjectModify, alvisProject: { agents } } = this.props;
    const agent = agents.get(agentId);
    const modifiedAgent = agent
      .merge(agentData)
      .set('internalId', agent.internalId);

    onProjectModify({
      agents: { modified: List([modifiedAgent]) },
    });
  };

  private handleAgentDelete = (agentId: string) => () => {
    this.props.onProjectModify({
      agents: { deleted: List([agentId]) },
    });
  };

  private handlePortModify = (portId: string) => (
    portData: Partial<IPort>,
  ) => () => {
    const { onProjectModify, alvisProject: { ports } } = this.props;
    const port = ports.get(portId);
    const modifiedPort = port
      .merge(portData)
      .set('internalId', port.internalId);

    onProjectModify({
      ports: { modified: List([modifiedPort]) },
    });
  };

  private handlePortDelete = (portId: string) => () => {
    this.props.onProjectModify({
      ports: { deleted: List([portId]) },
    });
  };

  private handleElementsAlign = (align: string) => () => {
    this.activeAlvisGraph.getMxGraphInstance().alignCells(align);
  };

  private handleKeyDown = (event) => {
    const cKey = 67;
    const xKey = 88;
    const vKey = 86;

    if (!event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case cKey:
        this.handleCopy();
        break;
      case xKey:
        this.handleCut();
        break;
      case vKey:
        this.handlePaste();
        break;
    }
  };

  setSelection = (selection: IPageSelection): void => {
    this.setState({ selection });
  };

  getPageElements(pageInternalId: string) {
    const { alvisProject } = this.props;
    const page = alvisProject.pages.get(pageInternalId);
    const agents = alvisProject.agents.filter(
      (agent) => agent.pageInternalId === page.internalId,
    );
    const agentsInternalIds = agents.map((agent) => agent.internalId);
    const ports = alvisProject.ports.filter((port) =>
      agentsInternalIds.contains(port.agentInternalId),
    );
    const portsInternalIds = ports.map((port) => port.internalId);
    const connections = alvisProject.connections.filter((connection) =>
      portsInternalIds.contains(connection.sourcePortInternalId),
    );

    return {
      page, // TO DO: page is not page element
      agents,
      ports,
      connections,
    };
  }

  toggleColoringMode = () => {
    this.setState((state) => ({
      isColoringModeEnabled: !state.isColoringModeEnabled,
    }));
  };

  onAgentClick = (id: string): void => {
    const { onProjectModify, alvisProject } = this.props;
    const { isColoringModeEnabled, selectedColor } = this.state;
    const agent = alvisProject.agents.get(id);

    if (isColoringModeEnabled) {
      const coloredAgent = agent.set('color', selectedColor);

      onProjectModify({
        agents: { modified: List([coloredAgent]) },
      });
    }
  };

  onPortClick = (id: string): void => {
    const { onProjectModify, alvisProject } = this.props;
    const { isColoringModeEnabled, selectedColor } = this.state;
    const port = alvisProject.ports.get(id);

    if (isColoringModeEnabled) {
      const coloredPort = port.set('color', selectedColor);

      onProjectModify({
        ports: { modified: List([coloredPort]) },
      });
    }
  };

  renderAgentToolbar() {
    const { alvisProject: { agents } } = this.props;
    const {
      selection: { agents: selectedAgentsIds },
      selectedColor,
    } = this.state;
    const agentId = selectedAgentsIds[0];
    const agent = agents.get(agentId);

    if (!agent) {
      return null;
    }

    return (
      <div className={'c-alvis-graph-panel__toolbar'}>
        <ButtonToolbar>
          <EditorButton
            icon="page-add"
            title="Add page"
            disabled={agent.subPageInternalId !== null}
            onClick={this.handlePageAdd(agentId)}
          />
          <EditorButton
            icon="port-add"
            title="Add port"
            onClick={this.handlePortAdd(agentId)}
          />
          <EditorButton
            icon="run-fast"
            title={
              agent.running
                ? 'Start in Initial State'
                : 'Start in Running State'
            }
            active={agent.running === 1}
            onClick={this.handleAgentModify(agentId)({
              running: agent.running ? 0 : 1,
            })}
          />
          <EditorButton
            icon="remove-hierarchy"
            title="Remove hierarchy"
            onClick={this.handleHierarchyRemove(agentId)}
          />
          <EditorButton
            icon="fill-color"
            title="Color"
            onClick={this.handleAgentModify(agentId)({ color: selectedColor })}
          />
          <EditorButton
            icon="delete"
            title="Delete"
            onClick={this.handleAgentDelete(agentId)}
          />
        </ButtonToolbar>
      </div>
    );
  }

  renderPortToolbar() {
    const { alvisProject: { ports } } = this.props;
    const {
      selection: { ports: selectedPortsIds },
      selectedColor,
    } = this.state;
    const portId = selectedPortsIds[0];
    const port = ports.get(portId);

    if (!port) {
      return null;
    }

    return (
      <div className={'c-alvis-graph-panel__toolbar'}>
        <ButtonToolbar>
          <EditorButton
            icon="fill-color"
            title="Color"
            onClick={this.handlePortModify(portId)({ color: selectedColor })}
          />
          <EditorButton
            icon="delete"
            title="Delete"
            onClick={this.handlePortDelete(portId)}
          />
        </ButtonToolbar>
      </div>
    );
  }

  renderConnectionToolbar() {
    const { alvisProject: { connections } } = this.props;
    const { selection: { connections: selectedConnectionsIds } } = this.state;
    const connectionId = selectedConnectionsIds[0];
    const connection = connections.get(connectionId);

    if (!connection) {
      return null;
    }

    return (
      <div className={'c-alvis-graph-panel__toolbar'}>
        <ButtonToolbar>
          <ButtonGroup>
            <EditorButton
              icon="arrow-left"
              title="Direct to source"
              disabled={connection.direction === 'source'}
              onClick={this.handleConnectionModify(connectionId)({
                direction: 'source',
              })}
            />
            <EditorButton
              icon="line"
              title="Undirect"
              disabled={connection.direction === 'none'}
              onClick={this.handleConnectionModify(connectionId)({
                direction: 'none',
              })}
            />
            <EditorButton
              icon="arrow-right"
              title="Direct to target"
              disabled={connection.direction === 'target'}
              onClick={this.handleConnectionModify(connectionId)({
                direction: 'target',
              })}
            />
          </ButtonGroup>
          <ButtonGroup>
            <EditorButton
              icon="connection-straight"
              title="Straight style"
              disabled={connection.style === 'straight'}
              onClick={this.handleConnectionModify(connectionId)({
                style: 'straight',
              })}
            />
            <EditorButton
              icon="connection-relational"
              title="Relational style"
              disabled={connection.style === 'relational'}
              onClick={this.handleConnectionModify(connectionId)({
                style: 'relational',
              })}
            />
          </ButtonGroup>
          <EditorButton
            icon="delete"
            title="Delete"
            onClick={this.handleConnectionDelete(connectionId)}
          />
        </ButtonToolbar>
      </div>
    );
  }

  renderElementsToolbar() {
    const {
      ALIGN_LEFT,
      ALIGN_CENTER,
      ALIGN_RIGHT,
      ALIGN_BOTTOM,
      ALIGN_MIDDLE,
      ALIGN_TOP,
    } = mx.mxConstants;

    return (
      <div className={'c-alvis-graph-panel__toolbar'}>
        <ButtonToolbar>
          <ButtonGroup>
            <EditorButton
              icon="format-horizontal-align-left"
              title="Left"
              onClick={this.handleElementsAlign(ALIGN_LEFT)}
            />
            <EditorButton
              icon="format-horizontal-align-center"
              title="Center"
              onClick={this.handleElementsAlign(ALIGN_CENTER)}
            />
            <EditorButton
              icon="format-horizontal-align-right"
              title="Right"
              onClick={this.handleElementsAlign(ALIGN_RIGHT)}
            />
          </ButtonGroup>
          <ButtonGroup>
            <EditorButton
              icon="format-vertical-align-bottom"
              title="Left"
              onClick={this.handleElementsAlign(ALIGN_BOTTOM)}
            />
            <EditorButton
              icon="format-vertical-align-center"
              title="Center"
              onClick={this.handleElementsAlign(ALIGN_MIDDLE)}
            />
            <EditorButton
              icon="format-vertical-align-top"
              title="Right"
              onClick={this.handleElementsAlign(ALIGN_TOP)}
            />
          </ButtonGroup>
        </ButtonToolbar>
      </div>
    );
  }

  renderMainToolbar() {
    const { onUndo, onRedo } = this.props;
    const { selectedColor, isColoringModeEnabled } = this.state;

    return (
      <div className={'c-alvis-graph-panel__toolbar'}>
        <ButtonToolbar>
          <EditorButtonSave />
          <ButtonGroup>
            <EditorButton
              icon="zoom-out"
              title="zoom-out"
              onClick={() => this.activeAlvisGraph.zoomOut()}
            />
            <EditorButton
              icon="zoom-in"
              title="zoom-in"
              onClick={() => this.activeAlvisGraph.zoomIn()}
            />
          </ButtonGroup>
          <ButtonGroup>
            <EditorButton
              icon="content-copy"
              title="Copy"
              onClick={this.handleCopy}
            />
            <EditorButton
              icon="content-cut"
              title="Cut"
              onClick={this.handleCut}
            />
            <EditorButton
              icon="content-paste"
              title="Paste"
              onClick={this.handlePaste}
            />
          </ButtonGroup>
          <ButtonGroup>
            <EditorButton icon="undo" title="undo" onClick={onUndo} />
            <EditorButton icon="redo" title="redo" onClick={onRedo} />
          </ButtonGroup>
          <ButtonGroup>
            <ColorPicker
              color={selectedColor}
              onColorSelect={this.onColorSelect}
            />
            <EditorButton
              onClick={this.toggleColoringMode}
              icon="fill-color"
              title={isColoringModeEnabled ? 'stop filling' : 'start filling'}
              active={isColoringModeEnabled}
            />
          </ButtonGroup>
          <EditorButton
            icon="agent-active"
            title="drag&drop active agent"
            onClick={() => this.addAgent({ active: 1 })}
            ref={this.addActiveAgentBtn}
          />
          <EditorButton
            icon="agent-passive"
            title="drag&drop passive agent"
            onClick={() => this.addAgent({ active: 0 })}
            ref={this.addStaticAgentBtn}
          />
          <EditorButton
            icon="image"
            title="download as image"
            onClick={this.onGetGraphImage}
          />
        </ButtonToolbar>
      </div>
    );
  }

  renderToolbars() {
    const { selection: { agents, ports, connections } } = this.state;
    const selectedElementsCount =
      agents.length + ports.length + connections.length;
    const isMultiSelection = selectedElementsCount > 1;

    // TODO: instead of rendering selectively menus
    // we can disable some buttons instead of hiding them. Is it a good idea?
    return (
      <div className={'c-alvis-graph-panel__toolbars-panel'}>
        {this.renderMainToolbar()}
        {isMultiSelection && this.renderElementsToolbar()}
        {!isMultiSelection && agents.length === 1 && this.renderAgentToolbar()}
        {!isMultiSelection && ports.length === 1 && this.renderPortToolbar()}
        {!isMultiSelection &&
          connections.length === 1 &&
          this.renderConnectionToolbar()}
      </div>
    );
  }

  render() {
    const {
      activePageId: activePageInternalId,
      onChangeActivePage,
      onClosePage,
      onProjectModify,
      onHierarchyRemove,
      openedPagesIds,
    } = this.props;

    const pagesElements = openedPagesIds.map((pageInternalId) =>
      this.getPageElements(pageInternalId),
    );
    const pagesTabs = pagesElements.map((pageElements): React.ReactElement<
      TabProps
    > => {
      const page = pageElements.page;
      const agents = pageElements.agents;
      const ports = pageElements.ports;
      const connections = pageElements.connections;
      const pageInternalId = page.internalId;

      return (
        <Tab id={pageInternalId} label={page.name} key={pageInternalId}>
          <AlvisGraph
            ref={(alvisGraph) => {
              if (pageInternalId === activePageInternalId) {
                this.activeAlvisGraph = alvisGraph;
              }
            }}
            active={pageInternalId === activePageInternalId}
            agents={agents}
            ports={ports}
            connections={connections}
            pageInternalId={pageInternalId}
            onChangeActivePage={onChangeActivePage}
            onProjectModify={onProjectModify}
            onHierarchyRemove={onHierarchyRemove}
            onAgentClick={this.onAgentClick}
            onPortClick={this.onPortClick}
            getNameFromUser={this.getNameFromUser}
            setSelection={this.setSelection}
          />
        </Tab>
      );
    });
    const className = classNames('c-alvis-graph-panel', 'modal-container');

    return (
      <div className={className}>
        <NamePicker
          container={this}
          ref={(namePicker) => {
            this.namePicker = namePicker;
          }}
        />
        {this.renderToolbars()}
        <div className={'c-alvis-graph-panel__tabs'}>
          <Tabs
            activeId={activePageInternalId}
            onTabClick={(pageInternalId) => {
              onChangeActivePage(pageInternalId);

              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
            onTabClose={onClosePage}
          >
            {pagesTabs}
          </Tabs>
        </div>
      </div>
    );
  }

  public getNameFromUser(callback: (chosenName: string) => void): void {
    this.namePicker.getName(callback);
  }

  private onColorSelect(selectedColor: string) {
    this.setState({
      selectedColor,
    });
  }
}

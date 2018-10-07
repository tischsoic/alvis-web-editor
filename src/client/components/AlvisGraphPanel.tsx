import * as React from 'react';
import {
  IAgentRecord,
  agentRecordFactory,
  IPortRecord,
  portRecordFactory,
  IConnectionRecord,
  connectionRecordFactory,
  IIdentifiableElement,
  IAlvisPageElement,
  ConnectionDirection,
  IPageRecord,
  IAlvisProjectRecord,
} from '../models/alvisProject';
import { List, Record } from 'immutable';
import {
  Nav,
  NavItem,
  Grid,
  Row,
  Col,
  Tab,
  Tabs,
  Glyphicon,
  Button,
  ButtonGroup,
  ButtonToolbar,
} from 'react-bootstrap';

import { ColorPicker } from './ColorPicker/ColorPicker';
import { AlvisGraph } from './AlvisGraph';
import { NamePicker } from './NamePicker';

export interface AlvisGraphPanelProps {
  alvisProject: IAlvisProjectRecord;
  activePageInternalId: string | null;
  projectId: number;
  onChangeActivePage: (newActivePageInternalId: string) => void;

  onMxGraphPageAdded: (page: IPageRecord) => any; // TODO: shouldn't return type be

  onMxGraphAgentAdded: (agent: IAgentRecord) => any;
  onMxGraphAgentDeleted: (agentInternalId: string) => any;
  onMxGraphAgentModified: (agent: IAgentRecord) => any;

  onMxGraphPortAdded: (port: IPortRecord) => any;
  onMxGraphPortDeleted: (portInternalId: string) => any;
  onMxGraphPortModified: (port: IPortRecord) => any;

  onMxGraphConnectionAdded: (connection: IConnectionRecord) => any;
  onMxGraphConnectionDeleted: (connectionInternalId: string) => any;
  onMxGraphConnectionModified: (connection: IConnectionRecord) => any;

  onUndo: () => any;
  onRedo: () => any;
}

export interface AlvisGraphPanelState {
  openedPagesInternalIds: List<string>;

  selectedColor: string;
  isColoringModeEnabled: boolean;
}

export class AlvisGraphPanel extends React.Component<
  AlvisGraphPanelProps,
  AlvisGraphPanelState
> {
  constructor(props: AlvisGraphPanelProps) {
    super(props);

    const { activePageInternalId } = this.props;
    const openedPagesInternalIds =
      activePageInternalId !== null ? [activePageInternalId] : [];
    this.state = {
      // TO DO: Check how initial state should be set - getInitialState() function overwriting
      openedPagesInternalIds: List(openedPagesInternalIds),

      selectedColor: '#000',
      isColoringModeEnabled: false,
    };

    this.getNameFromUser = this.getNameFromUser.bind(this);
    this.onColorSelect = this.onColorSelect.bind(this);
  }

  activeAlvisGraph: AlvisGraph | null = null;
  namePicker: NamePicker | null = null;

  componentWillReceiveProps(nextProps: AlvisGraphPanelProps) {
    const { projectId } = this.props;
    const { openedPagesInternalIds } = this.state;
    const nextActivePageInternalId = nextProps.activePageInternalId;

    if (nextProps.projectId !== projectId) {
      const openedPagesInternalIds =
        nextActivePageInternalId !== null ? [nextActivePageInternalId] : [];
      this.setState({
        openedPagesInternalIds: List(openedPagesInternalIds),
      });
      return;
    }

    const nextPagesInternalIds = nextProps.alvisProject.pages.map(
      (page) => page.internalId,
    );
    let newOpenedPagesInternalIds = openedPagesInternalIds.filter(
      (openedPageInternalId) =>
        nextPagesInternalIds.contains(openedPageInternalId),
    );

    if (
      nextActivePageInternalId &&
      !openedPagesInternalIds.contains(nextActivePageInternalId)
    ) {
      newOpenedPagesInternalIds = newOpenedPagesInternalIds.push(
        nextActivePageInternalId,
      );
    }

    this.setState({
      openedPagesInternalIds: newOpenedPagesInternalIds,
    });
  }

  getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean) {
    const elementIndex = elements.findIndex(fn);
    const element = elementIndex !== -1 ? elements.get(elementIndex) : null;

    return element;
  }

  getElementByInternalId<T extends IIdentifiableElement>(
    elements: List<T>,
    internalId: string,
  ): T {
    return this.getElementByFn(
      elements,
      (element) => element.internalId === internalId,
    );
  }

  getPageElements(pageInternalId: string) {
    const { alvisProject } = this.props;
    const page = this.getElementByInternalId(
      alvisProject.pages,
      pageInternalId,
    );
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

  colorElement = <T extends IAgentRecord | IPortRecord>(element: T): T => {
    const { selectedColor } = this.state;

    return (element as any).set('color', selectedColor);
  };

  manageElementColoring = <T extends IAgentRecord | IPortRecord>(
    element: T,
  ): T => {
    const { isColoringModeEnabled } = this.state;

    if (!isColoringModeEnabled) {
      return element;
    }

    const { selectedColor } = this.state;

    return (element as any).set('color', selectedColor);
  };

  onAgentClick = (id: string): void => {
    const { onMxGraphAgentModified, alvisProject } = this.props;
    const agent = alvisProject.agents.find((el) => el.internalId === id);
    const coloredAgent = this.manageElementColoring(agent);

    if (agent !== coloredAgent) {
      onMxGraphAgentModified(coloredAgent);
    }
  };

  onPortClick = (id: string): void => {
    const { onMxGraphPortModified, alvisProject } = this.props;
    const port = alvisProject.ports.find((el) => el.internalId === id);
    const coloredPort = this.manageElementColoring(port);

    if (port !== coloredPort) {
      onMxGraphPortModified(coloredPort);
    }
  };

  render() {
    const {
      activePageInternalId,
      onChangeActivePage,
      onMxGraphPageAdded,
      onMxGraphAgentAdded,
      onMxGraphAgentDeleted,
      onMxGraphAgentModified,
      onMxGraphPortAdded,
      onMxGraphPortDeleted,
      onMxGraphPortModified,
      onMxGraphConnectionAdded,
      onMxGraphConnectionDeleted,
      onMxGraphConnectionModified,
      onUndo,
      onRedo,
    } = this.props;
    const {
      openedPagesInternalIds,
      selectedColor,
      isColoringModeEnabled,
    } = this.state;

    const pagesElements = openedPagesInternalIds.map((pageInternalId) =>
      this.getPageElements(pageInternalId),
    );
    const pagesTabs = pagesElements.map((pageElements) => {
      const page = pageElements.page;
      const agents = pageElements.agents;
      const ports = pageElements.ports;
      const connections = pageElements.connections;
      const pageInternalId = page.internalId;

      return (
        <Tab eventKey={pageInternalId} title={page.name} key={pageInternalId}>
          <AlvisGraph
            ref={(alvisGraph) => {
              if (pageInternalId === activePageInternalId) {
                this.activeAlvisGraph = alvisGraph;
              }
            }}
            agents={agents}
            ports={ports}
            connections={connections}
            pageInternalId={pageInternalId}
            onChangeActivePage={onChangeActivePage}
            onMxGraphPageAdded={onMxGraphPageAdded}
            onMxGraphAgentAdded={onMxGraphAgentAdded}
            onMxGraphAgentDeleted={onMxGraphAgentDeleted}
            onMxGraphAgentModified={onMxGraphAgentModified}
            onMxGraphPortAdded={onMxGraphPortAdded}
            onMxGraphPortDeleted={onMxGraphPortDeleted}
            onMxGraphPortModified={onMxGraphPortModified}
            onMxGraphConnectionAdded={onMxGraphConnectionAdded}
            onMxGraphConnectionDeleted={onMxGraphConnectionDeleted}
            onMxGraphConnectionModified={onMxGraphConnectionModified}
            onAgentClick={this.onAgentClick}
            onPortClick={this.onPortClick}
            getNameFromUser={this.getNameFromUser}
          />
        </Tab>
      );
    });

    return (
      <div className="modal-container">
        <NamePicker
          container={this}
          ref={(namePicker) => {
            this.namePicker = namePicker;
          }}
        />
        <ButtonToolbar>
          <ButtonGroup>
            <Button onClick={() => this.activeAlvisGraph.zoomOut()}>
              <Glyphicon glyph="zoom-out" />
            </Button>
            <Button onClick={() => this.activeAlvisGraph.zoomIn()}>
              <Glyphicon glyph="zoom-in" />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button onClick={() => onUndo()}>undo</Button>
            <Button onClick={() => onRedo()}>redo</Button>
          </ButtonGroup>
          <ButtonGroup>
            <ColorPicker
              color={selectedColor}
              onColorSelect={this.onColorSelect}
            />
            <Button
              onClick={this.toggleColoringMode}
              active={isColoringModeEnabled}
            >
              {isColoringModeEnabled ? 'Stop coloring' : 'Start coloring'}
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
        <div>
          <Tabs
            activeKey={activePageInternalId}
            onSelect={onChangeActivePage}
            id="alvis-graph-panel"
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

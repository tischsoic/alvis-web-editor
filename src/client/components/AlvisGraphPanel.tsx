import * as React from 'react';
import {
    IAgentRecord, agentRecordFactory,
    IPortRecord, portRecordFactory,
    IConnectionRecord, connectionRecordFactory, IInternalRecord,
    IAlvisPageElement,
    ConnectionDirection,
    IPageRecord,
    IAlvisProjectRecord,
} from "../models/alvisProject";
import { List } from 'immutable';
import { Nav, NavItem, Grid, Row, Col, Tab, Tabs } from 'react-bootstrap';

import { AlvisGraph } from './AlvisGraph';

export interface AlvisGraphPanelProps {
    alvisProject: IAlvisProjectRecord,
    activePageInternalId: string | null,
    projectId: number,
    onChangeActivePage: (newActivePageInternalId: string) => void,

    mx: mxgraph.allClasses,

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

export interface AlvisGraphPanelState {
    openedPagesInternalIds: List<string>,
};

export class AlvisGraphPanel extends React.Component<AlvisGraphPanelProps, AlvisGraphPanelState> {
    constructor(props: AlvisGraphPanelProps) {
        super(props);

        const { activePageInternalId } = this.props;
        const openedPagesInternalIds = activePageInternalId !== null ? [activePageInternalId] : [];
        this.state = {
            openedPagesInternalIds: List(openedPagesInternalIds),
        };
    }

    componentWillReceiveProps(nextProps: AlvisGraphPanelProps) {
        const { projectId } = this.props,
            { openedPagesInternalIds } = this.state,
            nextActivePageInternalId = nextProps.activePageInternalId;

        if (nextProps.projectId !== projectId) {
            const openedPagesInternalIds = nextActivePageInternalId !== null ? [nextActivePageInternalId] : [];
            this.setState({
                openedPagesInternalIds: List(openedPagesInternalIds),
            });
            return;
        }

        const nextPagesInternalIds = nextProps.alvisProject.pages.map((page) => page.internalId);
        let newOpenedPagesInternalIds = openedPagesInternalIds.filter(
            (openedPageInternalId) => nextPagesInternalIds.contains(openedPageInternalId)).toList();

        if (nextActivePageInternalId && !openedPagesInternalIds.contains(nextActivePageInternalId)) {
            newOpenedPagesInternalIds = newOpenedPagesInternalIds.push(nextActivePageInternalId);
        }

        this.setState({
            openedPagesInternalIds: newOpenedPagesInternalIds,
        });
    }

    getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean) {
        const elementIndex = elements.findIndex(fn),
            element = elementIndex !== -1 ? elements.get(elementIndex) : null;

        return element;
    }

    getElementByInternalId<T extends IInternalRecord>(elements: List<T>, internalId: string): T {
        return this.getElementByFn(elements, (element) => element.internalId === internalId);
    }

    getPageElements(pageInternalId: string) {
        const { alvisProject } = this.props;
        const page = this.getElementByInternalId(alvisProject.pages, pageInternalId),
            agents = alvisProject.agents.filter((agent) => agent.pageInternalId === page.internalId),
            agentsInternalIds = agents.map((agent) => agent.internalId),
            ports = alvisProject.ports.filter((port) => agentsInternalIds.contains(port.agentInternalId)),
            portsInternalIds = ports.map((port) => port.internalId),
            connections = alvisProject.connections.filter((connection) => portsInternalIds.contains(connection.sourcePortInternalId));

        return {
            page,
            agents,
            ports,
            connections,
        }
    }

    render() {
        const { activePageInternalId, onChangeActivePage, mx,
            onMxGraphAgentAdded, onMxGraphAgentDeleted, onMxGraphAgentModified,
            onMxGraphPortAdded, onMxGraphPortDeleted, onMxGraphPortModified,
            onMxGraphConnectionAdded, onMxGraphConnectionDeleted, onMxGraphConnectionModified,
         } = this.props,
            { openedPagesInternalIds } = this.state;

        const pagesElements = openedPagesInternalIds.map((pageInternalId) => this.getPageElements(pageInternalId)),
            pagesTabs = pagesElements.map((pageElements) => {
                const page = pageElements.page,
                    agents = pageElements.agents.toList(),
                    ports = pageElements.ports.toList(),
                    connections = pageElements.connections.toList();

                return (
                    <Tab eventKey={page.internalId} title={page.name} key={page.internalId}>
                        <AlvisGraph
                            mx={mx}
                            agents={agents}
                            ports={ports}
                            connections={connections}
                            onChangeActivePage={onChangeActivePage}
                            onMxGraphAgentAdded={onMxGraphAgentAdded}
                            onMxGraphAgentDeleted={onMxGraphAgentDeleted}
                            onMxGraphAgentModified={onMxGraphAgentModified}
                            onMxGraphPortAdded={onMxGraphPortAdded}
                            onMxGraphPortDeleted={onMxGraphPortDeleted}
                            onMxGraphPortModified={onMxGraphPortModified}
                            onMxGraphConnectionAdded={onMxGraphConnectionAdded}
                            onMxGraphConnectionDeleted={onMxGraphConnectionDeleted}
                            onMxGraphConnectionModified={onMxGraphConnectionModified}
                        />
                    </Tab>
                );
            });

        return (
            <div>
                <Tabs activeKey={activePageInternalId} onSelect={onChangeActivePage} id='alvis-graph-panel'>
                    {pagesTabs}
                </Tabs>
            </div>
        );
    }

}
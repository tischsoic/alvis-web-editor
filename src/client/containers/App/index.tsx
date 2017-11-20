import * as React from 'react';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as dimActions from '../../actions/dimensions';
import * as graphActions from '../../actions/graph';
import * as projectActions from '../../actions/project';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { RootState } from '../../reducers';
import { DimensionForm } from '../../components';
import { DimensionsRec, GraphProjectRec } from '../../models';
import { GameBoard } from '../../components/GameBoard';
import { GraphDisplay } from '../../components/GraphDisplay';
import parseAlvisProjectXML from '../../utils/alvisXmlParser';

import { Nav, NavItem, Grid, Row, Col } from 'react-bootstrap';

import { AlvisGraph } from '../../components/AlvisGraph';
import { AlvisGraphPanel } from '../../components/AlvisGraphPanel';
import { HierarchyTree } from '../../components/HierarchyTree';

import mxgraph = require('mxgraph');

import * as brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/jsx';

const languages = [
    'java',
]

const themes = [
    'github',
]

languages.forEach((lang) => {
    require(`brace/mode/${lang}`)
    require(`brace/snippets/${lang}`)
})

themes.forEach((theme) => {
    require(`brace/theme/${theme}`)
})
/*eslint-disable no-alert, no-console */
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

import {
    IAgentRecord,
    IPortRecord,
    IConnectionRecord,
    IPageRecord,
    agentRecordFactory,
    IAlvisProjectRecord,
} from "../../models/alvisProject";
import { List } from 'immutable';

export namespace App {
    export interface StateProps { // extends RouteComponentProps<void> {
        xml: string,
        dims: DimensionsRec,
        graph: GraphProjectRec,
        alvisProject: IAlvisProjectRecord,
        agents: List<IAgentRecord>,
        ports: List<IPortRecord>,
        pages: List<IPageRecord>,
        connections: List<IConnectionRecord>,
    }

    export interface DispatchProps {
        actions: typeof dimActions,
        graphActions: typeof graphActions,
        projectActions: typeof projectActions, // TO DO thunk actions types are wrong
    }

    export interface OwnProps { }

    export type AllProps = StateProps & DispatchProps & OwnProps;

    export interface OwnState {
        codeEditorOpened: boolean,
        hierarchyTreeOpened: boolean,
        activePageInternalId: string,
    }
}

// @connect<App.StateProps, App.DispatchProps, App.State>(mapStateToProps, mapDispatchToProps)
// @connect<App.StateProps, App.DispatchProps, App.AllProps>(mapStateToProps, mapDispatchToProps)
export class AppComponent extends React.Component<App.AllProps, App.OwnState> {
    constructor(props?: App.AllProps, context?: App.OwnState) {
        super(props, context);

        const systemPage = this.getSystemPage(this.props.alvisProject.pages);

        this.state = {
            codeEditorOpened: true,
            hierarchyTreeOpened: false,
            activePageInternalId: systemPage ? systemPage.internalId : null,
        };

        this.mx = mxgraph({
            mxImageBasePath: "./mxgraph/images",
            mxBasePath: "./mxgraph"
        });
    }

    private mx: mxgraph.allClasses;

    componentWillMount() {
        this.props.graphActions.fetchGraphProjectXML();
        this.props.projectActions.fetchProjectXML(this.mx.mxUtils.parseXml);
    }

    componentWillReceiveProps(nextProps: App.AllProps) {
        const { activePageInternalId } = this.state,
            nextPages = nextProps.alvisProject.pages,
            nextPagesInternalIds = nextPages.map((page) => page.internalId);

        let nextActivePageInternalId: string = null;
        if (nextPagesInternalIds.contains(activePageInternalId)) {
            nextActivePageInternalId = activePageInternalId;
        } else if (!nextPagesInternalIds.contains(activePageInternalId) && nextPagesInternalIds.size !== 0) {
            const systemPage = this.getSystemPage(nextPages);
            nextActivePageInternalId = systemPage.internalId;
        }

        this.setState({
            activePageInternalId: nextActivePageInternalId,
        });
    }

    showHierarchyTree() {
        this.setState({
            codeEditorOpened: false,
            hierarchyTreeOpened: true,
        });
    }

    showCodeEditor() {
        this.setState({
            codeEditorOpened: true,
            hierarchyTreeOpened: false,
        });
    }

    setActivePageInternalId(pageInternalId: string) {
        this.setState({
            activePageInternalId: pageInternalId,
        })
    }

    getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean) {
        const elementIndex = elements.findIndex(fn),
            element = elementIndex !== -1 ? elements.get(elementIndex) : null;

        return element;
    }

    getSystemPage(pages: List<IPageRecord>) {
        return this.getElementByFn(pages, (page) => page.name === 'System');
    }

    render() {
        const { xDim, yDim } = this.props.dims;
        // const { xml } = this.props.graph
        const { xml, pages, agents, ports, connections, projectActions, alvisProject } = this.props;
        const { codeEditorOpened, hierarchyTreeOpened, activePageInternalId } = this.state;

        const onEditorChange = function (value: string, event?: any): void {
            console.log(arguments)
        }

        // TO DO: check what is xml string is empty
        if (xml && xml.length !== 0) {
            const xmlDocument = this.mx.mxUtils.parseXml(xml)
            console.log(parseAlvisProjectXML(xmlDocument));
        }

        console.log(agents);

        const onMxGraphAgentAdded: (agent: IAgentRecord) => any = (agent) => {
            projectActions.addAgent(agent);
        },
            onMxGraphAgentDeleted: (agentInternalId: string) => any = (agentInternalId) => {
                projectActions.deleteAgent(agentInternalId);
            },
            onMxGraphAgentModified: (agent: IAgentRecord) => any = (agent) => {
                projectActions.modifyAgent(agent);
            },
            onMxGraphPortAdded: (port: IPortRecord) => any = (port) => {
                projectActions.addPort(port);
            },
            onMxGraphPortDeleted: (portInternalId: string) => any = (portInternalId) => {
                projectActions.deletePort(portInternalId);
            },
            onMxGraphPortModified: (port: IPortRecord) => any = (port) => {
                projectActions.modifyPort(port);
            },
            onMxGraphConnectionAdded: (connection: IConnectionRecord) => any = (connection) => {
                projectActions.addConnection(connection);
            },
            onMxGraphConnectionDeleted: (connectionInternalId: string) => any = (connectionInternalId) => {
                projectActions.deleteConnection(connectionInternalId);
            },
            onMxGraphConnectionModified: (connection: IConnectionRecord) => any = (connection) => {
                projectActions.modifyConnection(connection);
            };

        return (
            <div>
                <div style={{ width: '50%' }}>
                    <Nav bsStyle="tabs" activeKey={codeEditorOpened ? '1' : '2'}>
                        <NavItem eventKey="1" onClick={() => { this.showCodeEditor(); }}>Editor</NavItem>
                        <NavItem eventKey="2" onClick={() => { this.showHierarchyTree(); }}>Hierarchy</NavItem>
                    </Nav>
                    {codeEditorOpened
                        ? <AceEditor
                            mode="java"
                            theme="github"
                            onChange={onEditorChange}
                            name="alvisCode_1"
                            value={"alvis Code"}
                            editorProps={{ $blockScrolling: true }}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                            }}
                        />
                        : <HierarchyTree pages={pages} agents={agents} onPageClick={(page) => this.setActivePageInternalId(page.internalId)} />
                    }
                </div>
                <div style={{ width: '50%' }}>
                    <AlvisGraphPanel
                        mx={this.mx}
                        alvisProject={alvisProject}
                        projectId={0}
                        onChangeActivePage={(newActivePageInternalId: string) => this.setActivePageInternalId(newActivePageInternalId)}
                        activePageInternalId={activePageInternalId}
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
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: RootState): App.StateProps {
    return {
        xml: state.project.xml,
        dims: state.dim,
        graph: state.graph,
        alvisProject: state.project.alvisProject,
        agents: state.project.alvisProject.agents, //.filter((agent) => agent.pageInternalId === '0').toList(),
        ports: state.project.alvisProject.ports,
        connections: state.project.alvisProject.connections,
        pages: state.project.alvisProject.pages,
    };
}

function mapDispatchToProps(dispatch: any): App.DispatchProps {
    return {
        actions: bindActionCreators(dimActions as any, dispatch),
        graphActions: bindActionCreators(graphActions as any, dispatch),
        projectActions: bindActionCreators(projectActions as any, dispatch),
    }
}

export const App: React.ComponentClass<App.OwnProps>
    = connect<App.StateProps, App.DispatchProps, App.OwnProps>(mapStateToProps, mapDispatchToProps)(AppComponent);
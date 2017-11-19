import * as React from 'react';
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

import { AlvisGraph } from '../../components/AlvisGraph';

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
    agentRecordFactory,
} from "../../models/alvisProject";
import { List } from 'immutable';

export namespace App {
    export interface StateProps { // extends RouteComponentProps<void> {
        xml: string,
        dims: DimensionsRec,
        graph: GraphProjectRec,
        agents: List<IAgentRecord>,
        ports: List<IPortRecord>,
        connections: List<IConnectionRecord>,
    }

    export interface DispatchProps {
        actions: typeof dimActions,
        graphActions: typeof graphActions,
        projectActions: typeof projectActions,
    }

    export interface OwnProps { }

    export type AllProps = StateProps & DispatchProps & OwnProps;

    export interface OwnState { }
}

// @connect<App.StateProps, App.DispatchProps, App.State>(mapStateToProps, mapDispatchToProps)
// @connect<App.StateProps, App.DispatchProps, App.AllProps>(mapStateToProps, mapDispatchToProps)
export class AppComponent extends React.Component<App.AllProps, App.OwnState> {
    constructor(props?: App.AllProps, context?: App.OwnState) {
        super(props, context);

        this.mx = mxgraph({
            mxImageBasePath: "./mxgraph/images",
            mxBasePath: "./mxgraph"
        });
    }

    private mx;

    componentWillMount() {
        this.props.graphActions.fetchGraphProjectXML();
        this.props.projectActions.fetchProjectXML();
    }

    render() {
        const { xDim, yDim } = this.props.dims;
        // const { xml } = this.props.graph
        const { xml, agents, ports, connections, projectActions } = this.props;

        const onEditorChange = function (value: string, event?: any): void {
            console.log(arguments)
        }

        // TO DO: check what is xml string is empty
        if (xml && xml.length !== 0) {
            const xmlDocument = this.mx.mxUtils.parseXml(xml)
            console.log(parseAlvisProjectXML(xmlDocument));
        }


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
                <DimensionForm xDim={xDim}
                    onXDimChange={this.props.actions.setXDimension}
                    getYDim={this.props.actions.getYDimensionFromServer}
                    addActiveAgent={this.props.projectActions.addAgent}
                />
                <GameBoard m={xDim} n={yDim} />
                <AlvisGraph
                    mx={this.mx}
                    agents={agents}
                    ports={ports}
                    connections={connections}
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
                {/* <GraphDisplay xml={xml} /> */}
                <AceEditor
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
            </div>
        );
    }
}

function mapStateToProps(state: RootState): App.StateProps {
    return {
        xml: state.project.xml,
        dims: state.dim,
        graph: state.graph,
        agents: state.project.alvisProject.agents,
        ports: state.project.alvisProject.ports,
        connections: state.project.alvisProject.connections,
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
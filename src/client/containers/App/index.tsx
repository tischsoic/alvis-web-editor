import * as React from 'react';
import * as dimActions from '../../actions/dimensions';
import * as graphActions from '../../actions/graph';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { RootState } from '../../reducers';
import { DimensionForm } from '../../components';
import { DimensionsRec, GraphProjectRec } from '../../models';
import { GameBoard } from '../../components/GameBoard';
import { GraphDisplay } from '../../components/GraphDisplay';
import parseAlvisProjectXML from '../../utils/alvisXmlParser';

import * as brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/java';
import 'brace/theme/github';

export namespace App {
    export interface StateProps { // extends RouteComponentProps<void> {
        dims: DimensionsRec,
        graph: GraphProjectRec
    }

    export interface DispatchProps {
        actions: typeof dimActions,
        graphActions: typeof graphActions
    }

    export interface OwnProps { }

    export type AllProps = StateProps & DispatchProps & OwnProps;

    export interface OwnState { }
}

// @connect<App.StateProps, App.DispatchProps, App.State>(mapStateToProps, mapDispatchToProps)
// @connect<App.StateProps, App.DispatchProps, App.AllProps>(mapStateToProps, mapDispatchToProps)
export class AppComponent extends React.Component<App.AllProps, App.OwnState> {

    componentWillMount() {
        this.props.graphActions.fetchGraphProjectXML();
    }

    render() {
        const { xDim, yDim } = this.props.dims;
        const { xml } = this.props.graph

        const onEditorChange = function (value: string, event?: any): void {
            console.log(arguments)
        }

        return (
            <div>
                <DimensionForm xDim={xDim} onXDimChange={this.props.actions.setXDimension} getYDim={this.props.actions.getYDimensionFromServer} />
                <GameBoard m={xDim} n={yDim} />
                <GraphDisplay xml={xml} />
                <AceEditor
                    mode="java"
                    theme="github"
                    onChange={onEditorChange}
                    name="alvisCode_1"
                    value={"alvis Code"}
                    editorProps={{ $blockScrolling: true }}
                />
            </div>
        );
    }
}

function mapStateToProps(state: RootState): App.StateProps {
    return {
        dims: state.dim,
        graph: state.graph
    };
}

function mapDispatchToProps(dispatch: any): App.DispatchProps {
    return {
        actions: bindActionCreators(dimActions as any, dispatch),
        graphActions: bindActionCreators(graphActions as any, dispatch)
    }
}

export const App: React.ComponentClass<App.OwnProps>
    = connect<App.StateProps, App.DispatchProps, App.OwnProps>(mapStateToProps, mapDispatchToProps)(AppComponent);
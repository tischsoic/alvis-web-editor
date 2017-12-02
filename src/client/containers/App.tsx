import * as React from 'react';
import * as appActions from '../actions/app';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps, Redirect, Switch, Route, withRouter } from 'react-router';
import { RootState } from '../reducers';
import { IAppRecord } from '../models/app';

import { Nav, NavItem, Grid, Row, Col, Modal, Button } from 'react-bootstrap';

import { LoginPanel } from '../components/LoginPanel';
import { RegisterPanel } from '../components/RegisterPanel';
import { Editor } from './Editor';

export namespace App {
    export interface StateProps { // extends RouteComponentProps<void> {
        appData: IAppRecord,
    }

    export interface DispatchProps {
        appBindedActions,
    }

    export interface OwnProps { }

    export type AllProps = StateProps & DispatchProps & OwnProps;

    export interface OwnState {
        codeEditorOpened: boolean,
        hierarchyTreeOpened: boolean,
        activePageInternalId: string,
    }
}

export class AppComponent extends React.Component<App.AllProps, App.OwnState> {
    constructor(props?: App.AllProps, context?: App.OwnState) {
        super(props, context);
    }

    render() {
        const { appData, appBindedActions } = this.props;
        const appOpened = appData.appOpened;

        return (
            <Switch>
                <Route exact path='/' render={() => {
                    return appOpened
                        ? (<Editor />)
                        : (<Redirect to='/login' />)
                }} />
                <Route path='/login' render={() => {
                    return (
                        <LoginPanel
                            appOpened={appData.appOpened}
                            duringSigningIn={appData.duringSigningIn}
                            onSigningIn={appBindedActions.signIn as any}
                        // TO DO: can we eliminate 'as any' 
                        />
                    );
                }} />
                <Route path='/register' render={() => {
                    return (
                        <RegisterPanel appOpened={appData.appOpened} duringRegistration={appData.duringRegistration} />
                    );
                }} />
            </Switch>
        )
    }
}

function mapStateToProps(state: RootState): App.StateProps {
    return {
        appData: state.app,
    };
}

function mapDispatchToProps(dispatch: any): App.DispatchProps {
    return {
        appBindedActions: bindActionCreators(appActions as any, dispatch),
    }
}

// It seems that you need withRouter when using connect. 
export const AppContainer: React.ComponentClass<App.OwnProps>
    = withRouter(connect<App.StateProps, App.DispatchProps, App.OwnProps>(mapStateToProps, mapDispatchToProps)(AppComponent));
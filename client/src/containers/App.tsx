import * as React from 'react';
import * as appActions from '../actions/app';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  RouteComponentProps,
  Redirect,
  Switch,
  Route,
  withRouter,
} from 'react-router';
import { RootState } from '../reducers';
import { IAppRecord } from '../models/app';

import { LoginPanel } from '../components/LoginPanel';
import { RegisterPanel } from '../components/RegisterPanel';
import { Editor } from './Editor';
import { Menu } from '../components/Menu/Menu';

const style = require('./App.scss');

export namespace App {
  export interface StateProps {
    // extends RouteComponentProps<void> {
    appData: IAppRecord;
  }

  export interface DispatchProps {
    appBindedActions: typeof appActions;
  }

  export interface OwnProps {}

  export type AllProps = StateProps & DispatchProps & OwnProps;

  export interface OwnState {}
}

export class AppComponent extends React.Component<App.AllProps, App.OwnState> {
  constructor(props?: App.AllProps, context?: App.OwnState) {
    super(props, context);

    this.state = {};
  }

  componentDidMount() {
    this.props.appBindedActions.initializeApp();
  }

  render() {
    const { appData, appBindedActions } = this.props;
    const appOpened = appData.appOpened;

    // TODO: consider using <main> HTML5 tag
    const app = (
      <div className="c-app"> 
        <div className="c-app__menu-panel">
          <Menu />
          {/* 
            </ButtonGroup>
            <Button onClick={appBindedActions.signOut}>Sign out</Button>
          </ButtonToolbar> */}
        </div>
        <div className="c-app__editor">
          <Editor />
        </div>
      </div>
    );

    return (
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            return appOpened ? app : <Redirect to="/login" />;
          }}
        />
        <Route
          path="/login"
          render={() => {
            return (
              <LoginPanel
                appOpened={appData.appOpened}
                duringSigningIn={appData.duringSigningIn}
                onSigningIn={appBindedActions.signIn as any}
                // TO DO: can we eliminate 'as any'
              />
            );
          }}
        />
        <Route
          path="/register"
          render={() => {
            return (
              <RegisterPanel
                appOpened={appData.appOpened}
                duringRegistration={appData.duringRegistration}
                onRegistration={appBindedActions.register as any}
              />
            );
          }}
        />
      </Switch>
    );
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
  };
}

// It seems that you need withRouter when using connect.
/* tslint:disable-next-line:variable-name */
export const AppContainer: React.ComponentClass = withRouter(connect<
  App.StateProps,
  App.DispatchProps,
  App.OwnProps
>(mapStateToProps, mapDispatchToProps)(AppComponent) as any);

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

import {
  Nav,
  NavItem,
  Grid,
  Row,
  Col,
  Modal,
  ButtonToolbar,
  ButtonGroup,
  Button,
  Glyphicon,
} from 'react-bootstrap';

import { LoginPanel } from '../components/LoginPanel';
import { RegisterPanel } from '../components/RegisterPanel';
import { OpenProjectModal } from '../components/OpenProjectModal';
import { AdministrationPanel } from '../components/AdministrationPanel';
import { Editor } from './Editor';

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

  export interface OwnState {
    showAdministrationPanel: boolean;
    showOpenProjectModal: boolean;
  }
}

export class AppComponent extends React.Component<App.AllProps, App.OwnState> {
  constructor(props?: App.AllProps, context?: App.OwnState) {
    super(props, context);

    this.state = {
      showAdministrationPanel: false,
      showOpenProjectModal: true,
    };

    this.closeOpenProjectModal = this.closeOpenProjectModal.bind(this);
    this.openOpenProjectModal = this.openOpenProjectModal.bind(this);
    this.closeAdministrationPanel = this.closeAdministrationPanel.bind(this);
    this.openAdministrationPanel = this.openAdministrationPanel.bind(this);
  }

  componentDidMount() {
    this.props.appBindedActions.initializeApp();
  }

  private showOpenProjectModal(show: boolean) {
    this.setState({
      showOpenProjectModal: show,
    });
  }

  private showAdministrationPanel(show: boolean) {
    this.setState({
      showAdministrationPanel: show,
    });
  }

  private closeOpenProjectModal() {
    this.showOpenProjectModal(false);
  }

  private openOpenProjectModal() {
    this.showOpenProjectModal(true);
  }

  private closeAdministrationPanel() {
    this.showAdministrationPanel(false);
  }

  private openAdministrationPanel() {
    this.showAdministrationPanel(true);
  }

  render() {
    const { appData, appBindedActions } = this.props;
    const { showOpenProjectModal, showAdministrationPanel } = this.state;
    const appOpened = appData.appOpened;

    const app = (
      <div>
        <Modal
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
          show={showAdministrationPanel}
          onHide={this.closeAdministrationPanel}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              Administration
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AdministrationPanel
              users={appData.users}
              usersAlreadyFetched={appData.usersAlreadyFetched}
              usersDuringFetching={appData.usersAlreadyFetched}
              fetchUsers={appBindedActions.fetchUsers as any}
              onUserSetActivated={appBindedActions.activateUser as any}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeAdministrationPanel}>Close</Button>
          </Modal.Footer>
        </Modal>
        <OpenProjectModal
          showModal={showOpenProjectModal}
          projects={appData.projects}
          projectsDuringFetching={appData.projectsDuringFetching}
          projectsAlreadyFetched={appData.projectsAlreadyFetched}
          openedProjectId={appData.openedProjectId}
          onFetchProjects={appBindedActions.fetchProjects}
          onModalClose={this.closeOpenProjectModal}
          onProjectOpen={appBindedActions.openProjectFromServer}
          onProjectFromFileCreate={
            appBindedActions.createProjectFromFile as any
          }
          onEmptyProjectCreate={appBindedActions.createEmptyProject as any}
          onProjectDelete={appBindedActions.deleteProject as any}
        />
        <Grid fluid={true}>
          <Row>
            <Col>
              <ButtonToolbar>
                <Button onClick={this.openAdministrationPanel}>
                  Administration
                </Button>
                <Button onClick={this.openOpenProjectModal}>
                  <Glyphicon glyph="open" />Projects Manager
                </Button>
                <ButtonGroup>
                  <Button onClick={appBindedActions.saveProjectToServer}>
                    <Glyphicon glyph="save" />Save
                  </Button>
                  {/* <Button><Glyphicon glyph='refresh' />Autosave</Button> */}
                </ButtonGroup>
                <Button onClick={appBindedActions.signOut}>Sign out</Button>
              </ButtonToolbar>
            </Col>
          </Row>
          <Row>
            <Col>
              <Editor />
            </Col>
          </Row>
        </Grid>
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

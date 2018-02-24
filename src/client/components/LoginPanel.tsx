import * as React from 'react';
import {
  IAgentRecord,
  agentRecordFactory,
  IPortRecord,
  portRecordFactory,
  IConnectionRecord,
  connectionRecordFactory,
  IInternalRecord,
  IAlvisPageElement,
  ConnectionDirection,
  IPageRecord,
} from '../models/alvisProject';
import { List } from 'immutable';
import { FormGroup, FormControl, Button, Modal } from 'react-bootstrap';
import { Redirect } from 'react-router';
import { AxiosPromise } from 'axios';

export interface LoginPanelProps {
  appOpened: boolean;
  duringSigningIn: boolean;

  onSigningIn: (email: string, password: string) => AxiosPromise;
}

export interface LoginPanelState {
  email: string;
  password: string;

  emailValid: boolean | null;
  passwordValid: boolean | null;

  redirectToRegister: boolean;
}

export class LoginPanel extends React.Component<
  LoginPanelProps,
  LoginPanelState
> {
  constructor(props: LoginPanelProps) {
    super(props);

    this.state = {
      email: '',
      password: '',

      emailValid: null,
      passwordValid: null,

      redirectToRegister: false,
    };

    this.onEmailChange = this.onEmailChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);

    this.switchToRegister = this.switchToRegister.bind(this);
  }

  private onEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const email = e.target.value;
    this.setState({
      email,
      emailValid: !!email && email.length > 0, // ("" && "".length > 0) === "" !!!!
    });
  }

  private onPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;
    this.setState({
      password,
      passwordValid: !!password && password.length > 0,
    });
  }

  getValidationStateForLoginPanel(state: boolean | null) {
    return state === false ? 'error' : null;
  }

  private renderLoginForm() {
    const { email, password, emailValid, passwordValid } = this.state;
    const { duringSigningIn, onSigningIn } = this.props;
    const allValid = emailValid && passwordValid;

    return (
      <div>
        <form>
          <FormGroup
            controlId="LoginPanelEmailInput"
            validationState={this.getValidationStateForLoginPanel(emailValid)}
          >
            <FormControl
              type="text"
              placeholder="Email"
              value={email}
              onChange={this.onEmailChange}
            />
            <FormControl.Feedback />
          </FormGroup>
          <FormGroup
            controlId="LoginPanelPasswordInput"
            validationState={this.getValidationStateForLoginPanel(
              passwordValid,
            )}
          >
            <FormControl
              type="password"
              placeholder="Password"
              value={password}
              onChange={this.onPasswordChange}
            />
            <FormControl.Feedback />
          </FormGroup>
          <Button
            type="submit"
            onClick={(e) => {
              console.log(e);
              console.log('Sub login');
              console.log(onSigningIn);
              onSigningIn(email, password);
              e.preventDefault();
            }}
            disabled={!allValid || duringSigningIn}
          >
            Submit
          </Button>
        </form>
      </div>
    );
  }

  private switchToRegister() {
    this.setState({
      redirectToRegister: true,
    });
  }

  render() {
    const { appOpened } = this.props;
    const { redirectToRegister } = this.state;

    if (appOpened) {
      return <Redirect to="/" />;
    }

    if (redirectToRegister) {
      return <Redirect to="/register" />;
    }

    return (
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderLoginForm()}
            <div className="text-center">
              <Button bsStyle="link" onClick={this.switchToRegister}>
                Register
              </Button>
            </div>
          </Modal.Body>
        </Modal.Dialog>
      </div>
    );
  }
}

import * as React from 'react';
import { List } from 'immutable';
import {
  FormGroup,
  FormControl,
  Button,
  HelpBlock,
  Modal,
  Alert,
} from 'react-bootstrap';
import * as isEmail from 'isemail';
import * as Rx from 'rxjs';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import { Redirect } from 'react-router';
import { urlBase } from '../serverApi';

export interface RegisterPanelProps {
  appOpened: boolean;
  duringRegistration: boolean;

  onRegistration: (
    email: string,
    firstname: string,
    lastname: string,
    password: string,
  ) => AxiosPromise;
}

export interface RegisterPanelState {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  passwordRepeat: string;

  emailUnique: boolean | null;

  firstnameValid: boolean | null;
  lastnameValid: boolean | null;
  passwordValid: boolean | null;
  passwordRepeatValid: boolean | null;

  redirectToLogin: boolean;

  registered: boolean;
}

export class RegisterPanel extends React.Component<
  RegisterPanelProps,
  RegisterPanelState
> {
  constructor(props: RegisterPanelProps) {
    super(props);

    this.state = {
      email: '',
      firstname: '',
      lastname: '',
      password: '',
      passwordRepeat: '',

      emailUnique: null,

      firstnameValid: null,
      lastnameValid: null,
      passwordValid: null,
      passwordRepeatValid: null,

      redirectToLogin: false,

      registered: false,
    };

    this.emailSubject = new Rx.Subject<string>();

    this.onEmailChange = this.onEmailChange.bind(this);
    this.onFirstnameChange = this.onFirstnameChange.bind(this);
    this.onLastnameChange = this.onLastnameChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onPasswordRepeatChange = this.onPasswordRepeatChange.bind(this);

    this.setEmailInputValidation = this.setEmailInputValidation.bind(this);
    this.switchToLogin = this.switchToLogin.bind(this);
  }

  private passwordMinLength = 5;

  private emailSubject: Rx.Subject<string>;

  private setEmailInputValidation(email: string) {
    const emailUniqueCheck = this.emailUnique(email);

    emailUniqueCheck
      .then((unique) => {
        this.setState({
          emailUnique: unique,
        });
      })
      .catch((e) => {
        this.setState({
          emailUnique: null,
        });
      });
  }

  private emailUnique(email: string): Promise<boolean | null> {
    return new Promise<boolean>((resolve, reject) => {
      const validEmail: boolean = isEmail.validate(email);

      if (!validEmail) {
        resolve(false);
        return;
      }

      const afterAccountEmail = axios.head(urlBase + '/account/' + email),
        emailUniqueByResponseStatus = (
          responseStatus: number,
        ): boolean | null => {
          let emailUnique = null;

          switch (responseStatus) {
            case 200:
              emailUnique = false;
              break;
            case 404:
              emailUnique = true;
              break;
          }

          return emailUnique;
        };

      afterAccountEmail
        .then((response: AxiosResponse) => {
          resolve(emailUniqueByResponseStatus(response.status));
        })
        .catch((e: AxiosError) => {
          resolve(emailUniqueByResponseStatus(e.response.status));
          console.log(e); // TO DO; remove it
        });
    });
  }

  private onEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    // TO DO: check if e type is correct
    const email = e.target.value;

    this.setState({
      email,
    });
    this.emailSubject.next(email); // TO DO: think it over - is this the best place for this.emailSubject.next(email);
  }

  private onFirstnameChange(e: React.ChangeEvent<HTMLInputElement>) {
    // TO DO: check if e type is correct
    const firstname = e.target.value;
    this.setState({
      firstname,
      firstnameValid: this.firstnameValid(firstname),
    });
  }

  private onLastnameChange(e: React.ChangeEvent<HTMLInputElement>) {
    // TO DO: check if e type is correct
    const lastname = e.target.value;
    this.setState({
      lastname,
      lastnameValid: this.lastnameValid(lastname),
    });
  }

  private onPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    // TO DO: check if e type is correct
    const password = e.target.value;
    this.setState({
      password,
      passwordValid: this.passwordValid(password),
    });
  }

  private onPasswordRepeatChange(e: React.ChangeEvent<HTMLInputElement>) {
    // TO DO: check if e type is correct
    const { password } = this.state;
    const passwordRepeat = e.target.value;
    this.setState({
      passwordRepeat,
      passwordRepeatValid: this.passwordRepeatValid(passwordRepeat, password),
    });
  }

  componentDidMount() {
    const emailSubscription = this.emailSubject
      .debounceTime(500)
      .subscribe(this.setEmailInputValidation);
  }

  componentWillUnmount() {
    if (this.emailSubject) {
      this.emailSubject.unsubscribe();
    }
  }

  private strIsLogerThan(str: string, len: number = 0): boolean {
    return str && str.length > 0;
  }

  private firstnameValid(firstname: string): boolean {
    return this.strIsLogerThan(firstname);
  }

  private lastnameValid(lastname: string): boolean {
    return this.strIsLogerThan(lastname);
  }

  private passwordValid(password: string): boolean {
    return this.strIsLogerThan(password, this.passwordMinLength - 1);
  }

  private passwordRepeatValid(
    passwordRepeat: string,
    password: string,
  ): boolean {
    return passwordRepeat === password;
  }

  private getValidationState(state: boolean | null) {
    if (state === null) {
      return null;
    }

    return state ? 'success' : 'error';
  }

  private messageOnNotValid(valid: boolean, message: string) {
    return valid || valid === null ? null : message;
  }

  private renderRegisterForm() {
    const {
      email,
      firstname,
      lastname,
      password,
      passwordRepeat,
      firstnameValid,
      lastnameValid,
      passwordValid,
      passwordRepeatValid,
      emailUnique,
      registered,
    } = this.state;
    const { duringRegistration, onRegistration } = this.props;
    const allInputsValid =
      emailUnique &&
      firstnameValid &&
      lastnameValid &&
      passwordValid &&
      passwordRepeatValid;

    return (
      <div>
        {registered ? (
          <Alert bsStyle="success">
            <h4>You have been registered!</h4>
            <p>Now you must wait for administrator to activate your account.</p>
          </Alert>
        ) : (
          <form>
            <FormGroup
              controlId="RegisterPanelEmailInput"
              validationState={this.getValidationState(emailUnique)}
            >
              <FormControl
                type="text"
                placeholder="Email"
                value={email}
                onChange={this.onEmailChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                {this.messageOnNotValid(
                  emailUnique,
                  'It is not valid email or another user has already this email.',
                )}
              </HelpBlock>
            </FormGroup>
            <FormGroup
              controlId="RegisterPanelFirstnameIntpu"
              validationState={this.getValidationState(firstnameValid)}
            >
              <FormControl
                type="text"
                placeholder="Firstname"
                value={firstname}
                onChange={this.onFirstnameChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                {this.messageOnNotValid(
                  firstnameValid,
                  'Firsname field cannot be blank.',
                )}
              </HelpBlock>
            </FormGroup>
            <FormGroup
              controlId="RegisterPanelLastnameInput"
              validationState={this.getValidationState(lastnameValid)}
            >
              <FormControl
                type="text"
                placeholder="Lastname"
                value={lastname}
                onChange={this.onLastnameChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                {this.messageOnNotValid(
                  lastnameValid,
                  'Lastname field cannot be blank.',
                )}
              </HelpBlock>
            </FormGroup>
            <FormGroup
              controlId="RegisterPanelPasswordInput"
              validationState={this.getValidationState(passwordValid)}
            >
              <FormControl
                type="password"
                placeholder="Password"
                value={password}
                onChange={this.onPasswordChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                {this.messageOnNotValid(
                  passwordValid,
                  'Firsname field cannot be blank.',
                )}
              </HelpBlock>
            </FormGroup>
            <FormGroup
              controlId="RegisterPanelRepeatPasswordInput"
              validationState={this.getValidationState(passwordRepeatValid)}
            >
              <FormControl
                type="password"
                placeholder="Repeat password"
                value={passwordRepeat}
                onChange={this.onPasswordRepeatChange}
              />
              <FormControl.Feedback />
              <HelpBlock>
                {this.messageOnNotValid(
                  passwordRepeatValid,
                  'Password and repeated password must be the same.',
                )}
              </HelpBlock>
            </FormGroup>
            <Button
              type="submit"
              onClick={(e) => {
                console.log('Sub reg');
                console.log(e);
                console.log(onRegistration);
                const afterRegistered = onRegistration(
                  email,
                  firstname,
                  lastname,
                  password,
                );
                afterRegistered
                  .then((response: AxiosResponse) => {
                    console.log(response);
                    const responseData = response.data,
                      success = responseData.success;

                    this.setState({
                      registered: success,
                    });
                  })
                  .catch((error: AxiosError) => {
                    console.log(error);
                    this.setState({
                      registered: false,
                    });
                  });
                e.preventDefault();
              }}
              disabled={!allInputsValid || duringRegistration}
            >
              Submit
            </Button>
          </form>
        )}
      </div>
    );
  }

  private switchToLogin() {
    this.setState({
      redirectToLogin: true,
    });
  }

  render() {
    const { redirectToLogin } = this.state;
    const { appOpened } = this.props;

    if (appOpened) {
      return <Redirect to="/" />;
    }

    if (redirectToLogin) {
      return <Redirect to="/login" />;
    }

    return (
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderRegisterForm()}
            <div className="text-center">
              <Button bsStyle="link" onClick={this.switchToLogin}>
                Login
              </Button>
            </div>
          </Modal.Body>
        </Modal.Dialog>
      </div>
    );
  }
}

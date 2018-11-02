import * as React from 'react';
import { IUserRecord } from '../models/app';
import { List } from 'immutable';
import { FormGroup, FormControl, Button, Modal, Table } from 'react-bootstrap';
import { Redirect } from 'react-router';
import { AxiosPromise } from 'axios';

export interface AdministrationPanelProps {
  users: List<IUserRecord>;
  usersDuringFetching: boolean;
  usersAlreadyFetched: boolean;

  fetchUsers: () => AxiosPromise;
  onUserSetActivated: (user: IUserRecord, activated: boolean) => AxiosPromise;
}

export interface AdministrationPanelState {}

export class AdministrationPanel extends React.Component<
  AdministrationPanelProps,
  AdministrationPanelState
> {
  constructor(props: AdministrationPanelProps) {
    super(props);

    this.state = {};

    const { fetchUsers, usersAlreadyFetched, usersDuringFetching } = this.props;
    if (!usersAlreadyFetched && !usersDuringFetching) {
      fetchUsers();
    }
  }

  render() {
    const { users, onUserSetActivated } = this.props;

    console.log(onUserSetActivated);
    return (
      <div>
        <Table responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>email</th>
              <th>Firstname</th>
              <th>Lastname</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: IUserRecord) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>
                  <Button
                    disabled={user.activated}
                    onClick={() => onUserSetActivated(user, !user.activated)}
                  >
                    Activate
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

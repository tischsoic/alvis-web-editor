import * as React from 'react';
import { IUserRecord } from '../../models/app';
import { List } from 'immutable';
import { Button, Table } from 'react-bootstrap';
import { MenuPanel } from '../MenuPanel/MenuPanel';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RootState } from '../../reducers';
import * as appActions from '../../actions/app';

interface MenuUsersPanelStateProps {
  users: List<IUserRecord>;
  usersDuringFetching: boolean;
  usersAlreadyFetched: boolean;
}

type MenuUsersPanelDispatchProps = ReturnType<typeof mapDispatchToProps>;

interface MenuUsersPanelOwnProps {
  onClose: () => void;
}

type MenuUsersPanelProps = MenuUsersPanelStateProps &
  MenuUsersPanelDispatchProps &
  MenuUsersPanelOwnProps;

interface MenuUsersPanelState {}

class MenuUsersPanel extends React.Component<
  MenuUsersPanelProps,
  MenuUsersPanelState
> {
  constructor(props: MenuUsersPanelProps) {
    super(props);

    const { fetchUsers, usersAlreadyFetched, usersDuringFetching } = this.props;
    if (!usersAlreadyFetched && !usersDuringFetching) {
      fetchUsers(); // TODO: move to componentDidMount
    }
  }

  renderUserRow = (user: IUserRecord) => {
    const { activateUser } = this.props;

    return (
      <tr key={user.id}>
        <td>{user.id}</td>
        <td>{user.email}</td>
        <td>{user.firstname}</td>
        <td>{user.lastname}</td>
        <td>
          <Button
            disabled={user.activated}
            onClick={() => activateUser(user, !user.activated)}
          >
            Activate
          </Button>
        </td>
      </tr>
    );
  };

  render() {
    const { users, onClose } = this.props;

    return (
      <MenuPanel onClose={onClose}>
        <Table responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>email</th>
              <th>First-name</th>
              <th>Last-name</th>
            </tr>
          </thead>
          <tbody>{users.map(this.renderUserRow)}</tbody>
        </Table>
      </MenuPanel>
    );
  }
}

function mapStateToProps(state: RootState): MenuUsersPanelStateProps {
  const { users, usersDuringFetching, usersAlreadyFetched } = state.app;

  return {
    users,
    usersDuringFetching,
    usersAlreadyFetched,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  const { activateUser, fetchUsers } = appActions;

  return bindActionCreators(
    {
      fetchUsers,
      activateUser,
    },
    dispatch,
  );
}

export default connect<
  MenuUsersPanelStateProps,
  MenuUsersPanelDispatchProps,
  MenuUsersPanelOwnProps
>(mapStateToProps, mapDispatchToProps)(MenuUsersPanel);

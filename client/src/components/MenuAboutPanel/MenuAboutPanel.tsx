import * as React from 'react';
import { IUserRecord } from '../../models/app';
import { List } from 'immutable';
import { Button, Table } from 'react-bootstrap';
import { MenuPanel } from '../MenuPanel/MenuPanel';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RootState } from '../../reducers';
import * as appActions from '../../actions/app';

interface MenuAboutPanelStateProps {}

type MenuAboutPanelDispatchProps = ReturnType<typeof mapDispatchToProps>;

interface MenuAboutPanelOwnProps {}

type MenuAboutPanelProps = MenuAboutPanelStateProps &
  MenuAboutPanelDispatchProps &
  MenuAboutPanelOwnProps;

interface MenuAboutPanelState {}

class MenuAboutPanel extends React.Component<
  MenuAboutPanelProps,
  MenuAboutPanelState
> {
  render() {
    return (
      <MenuPanel>
        In case of any bugs, report them on: <br />
        <a  target="_blank" href="https://github.com/tischsoic/alvis-web-editor/issues">https://github.com/tischsoic/alvis-web-editor/issues</a>
      </MenuPanel>
    );
  }
}

function mapStateToProps(state: RootState): MenuAboutPanelStateProps {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators({}, dispatch);
}

export default connect<
  MenuAboutPanelStateProps,
  MenuAboutPanelDispatchProps,
  MenuAboutPanelOwnProps
>(mapStateToProps, mapDispatchToProps)(MenuAboutPanel);

import * as React from 'react';

import { MenuButton } from '../MenuButton/MenuButton';
import MenuUsersPanel from '../MenuUsersPanel/MenuUsersPanel';

const style = require('./Menu.scss');

enum PanelKey {
  Users,
}

export interface MenuProps {}

export interface MenuState {
  openedPanel: PanelKey | null;
}

export class Menu extends React.Component<MenuProps, MenuState> {
  constructor(props: MenuProps) {
    super(props);

    this.state = {
      openedPanel: null,
    };
  }

  togglePanel(panelKey: PanelKey) {
    this.setState((state) => ({
      openedPanel: state.openedPanel === panelKey ? null : panelKey,
    }));
  }

  toggleUsersPanel = () => {
    this.togglePanel(PanelKey.Users);
  };

  renderMenuPanel() {
    const { openedPanel } = this.state;
    let panel = null;

    switch (openedPanel) {
      case PanelKey.Users:
        panel = <MenuUsersPanel />;
        break;
      default:
        return null;
    }

    return <div className="c-menu__menu-panel">{panel}</div>;
  }

  render() {
    const { openedPanel } = this.state;

    return (
      <div className="c-menu">
        <div className="c-menu__avatar" />
        <div className="c-menu__buttons">
          <MenuButton
            onClick={this.toggleUsersPanel}
            pressed={openedPanel === PanelKey.Users}
          >
            Users
          </MenuButton>
        </div>
        {this.renderMenuPanel()}
      </div>
    );
  }
}

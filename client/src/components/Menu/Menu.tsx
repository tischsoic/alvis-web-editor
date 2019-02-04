import * as React from 'react';

import { MenuButton } from '../MenuButton/MenuButton';
import MenuUsersPanel from '../MenuUsersPanel/MenuUsersPanel';
import MenuProjectsPanel from '../MenuProjectsPanel/MenuProjectsPanel';
import MenuAboutPanel from '../MenuAboutPanel/MenuAboutPanel';

const style = require('./Menu.scss');

enum PanelKey {
  Users,
  Projects,
  Preferences,
  About,
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

  closePanel = () => {
    this.setState({ openedPanel: null });
  };

  toggleProjectsPanel = () => {
    this.togglePanel(PanelKey.Projects);
  };

  toggleUsersPanel = () => {
    this.togglePanel(PanelKey.Users);
  };

  togglePreferencesPanel = () => {
    this.togglePanel(PanelKey.Preferences);
  };

  toggleAboutPanel = () => {
    this.togglePanel(PanelKey.About);
  };

  renderMenuPanel() {
    const { openedPanel } = this.state;
    let panel = null;

    switch (openedPanel) {
      case PanelKey.Projects:
        panel = <MenuProjectsPanel onMenuPanelClose={this.closePanel} />;
        break;
      case PanelKey.Users:
        panel = <MenuUsersPanel />;
        break;
      case PanelKey.About:
        panel = <MenuAboutPanel />;
        break;
      default:
        return null;
    }

    return <div className="c-menu__menu-panel">{panel}</div>;
  }

  renderUserInfo() {
    return 'Name Surname';
  }

  renderButtonsWrapper() {}

  render() {
    const { openedPanel } = this.state;

    return (
      <div className="c-menu">
        <div className="c-menu__user-info">{this.renderUserInfo()}</div>
        <div className="c-menu__buttons">
          <MenuButton
            onClick={this.toggleProjectsPanel}
            pressed={openedPanel === PanelKey.Projects}
          >
            Projects
          </MenuButton>
          <MenuButton
            onClick={this.toggleUsersPanel}
            pressed={openedPanel === PanelKey.Users}
          >
            Users
          </MenuButton>
          <MenuButton
            onClick={this.togglePreferencesPanel}
            pressed={openedPanel === PanelKey.Preferences}
          >
            Preferences
          </MenuButton>
          <MenuButton
            onClick={this.toggleAboutPanel}
            pressed={openedPanel === PanelKey.About}
          >
            About
          </MenuButton>
        </div>
        <div className="c-menu__filler" />
        {this.renderMenuPanel()}
      </div>
    );
  }
}

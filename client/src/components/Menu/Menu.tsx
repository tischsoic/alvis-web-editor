import * as React from 'react';

import { MenuButton } from '../MenuButton/MenuButton';
import MenuUsersPanel from '../MenuUsersPanel/MenuUsersPanel';
import MenuProjectsPanel from '../MenuProjectsPanel/MenuProjectsPanel';
import MenuAboutPanel from '../MenuAboutPanel/MenuAboutPanel';
import { Icon } from '../Icon/Icon';

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

  // TODO: maybe better idea would be to use React-router to manage panel opening/hiding ?
  renderMenuPanel() {
    const { openedPanel } = this.state;
    let panel = null;

    switch (openedPanel) {
      case PanelKey.Projects:
        panel = <MenuProjectsPanel onClose={this.closePanel} />;
        break;
      case PanelKey.Users:
        panel = <MenuUsersPanel onClose={this.closePanel} />;
        break;
      case PanelKey.About:
        panel = <MenuAboutPanel onClose={this.closePanel} />;
        break;
      default:
        return null;
    }

    return <div className="c-menu__menu-panel">{panel}</div>;
  }

  // TODO: not used
  renderUserBadge() {
    return (
      <div className="c-menu__user-badge">
        <Icon icon="account-circle" extraClasses={['c-menu__user-avatar']} />
        <span className="c-menu__user-email">john.smith@gmail.com</span>
      </div>
    );
  }

  render() {
    const { openedPanel } = this.state;

    return (
      <div className="c-menu">
        <div className="c-menu__user-info" />
        <div className="c-menu__buttons">
          <MenuButton
            icon="briefcase"
            label="Projects"
            onClick={this.toggleProjectsPanel}
            pressed={openedPanel === PanelKey.Projects}
          />
          <MenuButton
            icon="people"
            label="Users"
            onClick={this.toggleUsersPanel}
            pressed={openedPanel === PanelKey.Users}
          />
          <MenuButton
            icon="settings"
            label="Preferences"
            onClick={this.togglePreferencesPanel}
            pressed={openedPanel === PanelKey.Preferences}
          />
          <MenuButton
            icon="information"
            label="About"
            onClick={this.toggleAboutPanel}
            pressed={openedPanel === PanelKey.About}
          />
        </div>
        <div className="c-menu__filler" />
        {this.renderMenuPanel()}
      </div>
    );
  }
}

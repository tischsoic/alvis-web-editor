import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Icon } from '../Icon/Icon';

const style = require('./MenuPanel.scss');

export interface MenuPanelProps {
  onClose: () => void;
}

export interface MenuPanelState {}

export class MenuPanel extends React.Component<MenuPanelProps, MenuPanelState> {
  constructor(props: MenuPanelProps) {
    super(props);

    this.state = {};
  }

  private backdropContainer = document.querySelector(
    '#menu-backdrop-container',
  );

  renderBackdrop() {
    const { onClose } = this.props;

    return ReactDOM.createPortal(
      <div className="c-menu-panel__backdrop" onClick={onClose} />,
      this.backdropContainer,
    );
  }

  render() {
    const { children, onClose } = this.props;

    return (
      <div className="c-menu-panel">
        <div className="c-menu-panel__close-button" onClick={onClose}>
          <Icon icon="close" />
        </div>
        <div className="c-menu-panel__content">{children}</div>
        {this.renderBackdrop()}
      </div>
    );
  }
}

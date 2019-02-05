import * as React from 'react';

const style = require('./MenuPanel.scss');

export interface MenuPanelProps {
  // opened: boolean;
}

export interface MenuPanelState {}

export class MenuPanel extends React.Component<MenuPanelProps, MenuPanelState> {
  constructor(props: MenuPanelProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { children } = this.props;
    const baseClassName = 'c-menu-panel';
    const className = baseClassName;

    // if (opened) {
    //   className = `${className} ${baseClassName}--opened`;
    // }

    return <div className={className}>{children}</div>;
  }
}

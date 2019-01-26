import * as React from 'react';

export interface MenuPanelProps {}

export interface MenuPanelState {}

export class MenuPanel extends React.Component<MenuPanelProps, MenuPanelState> {
  constructor(props: MenuPanelProps) {
    super(props);

    this.state = {};
  }

  render() {
    return <div />;
  }
}

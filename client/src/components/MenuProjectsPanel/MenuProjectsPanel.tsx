import * as React from 'react';
import { MenuPanel } from '../MenuPanel/MenuPanel';

export interface MenuProps {}

export interface MenuState {}

export class Menu extends React.Component<MenuProps, MenuState> {
  constructor(props: MenuProps) {
    super(props);

    this.state = {};
  }

  render() {
    return <MenuPanel>

    </MenuPanel>;
  }
}

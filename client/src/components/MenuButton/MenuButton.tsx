import * as React from 'react';
import { Icon } from '../Icon/Icon';

const style = require('./MenuButton.scss');

export interface MenuButtonProps {
  pressed: boolean;
  label: string;
  icon: string;
  onClick: () => void;
}

export interface MenuButtonState {}

export class MenuButton extends React.PureComponent<
  MenuButtonProps,
  MenuButtonState
> {
  constructor(props: MenuButtonProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { pressed, label, icon, onClick } = this.props;
    const baseClassName = 'c-menu-button';
    let className = baseClassName;

    if (pressed) {
      className = `${className} ${baseClassName}--pressed`;
    }

    return (
      <button type="button" className={className} onClick={onClick}>
        <Icon icon={icon} extraClasses={['c-menu-button__icon']} />
        <span className="c-menu-button__label">{label}</span>
      </button>
    );
  }
}

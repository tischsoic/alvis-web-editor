import * as React from 'react';

const style = require('./MenuButton.scss');

export interface MenuButtonProps {
  pressed: boolean;
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
    const { pressed, onClick } = this.props;
    const baseClassName = 'c-menu-button';
    let className = baseClassName;

    if (pressed) {
      className = `${className} ${baseClassName}--pressed`;
    }

    return (
      <button type="button" className={className} onClick={onClick}>
        {this.props.children}
      </button>
    );
  }
}

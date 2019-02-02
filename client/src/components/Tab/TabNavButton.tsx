import * as React from 'react';
import * as classNames from 'classnames';

const style = require('./TabNavButton.scss');

interface TabNavButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (label: string) => void;
  onClose: (label: string) => void;
}

interface TabNavButtonState {}

export class TabNavButton extends React.PureComponent<
  TabNavButtonProps,
  TabNavButtonState
> {
  static defaultProps = {};

  onClick = () => {
    const { id, onClick } = this.props;

    onClick(id);
  };

  render() {
    const { label, active } = this.props;
    const className = classNames('c-tab-nav-button', {
      'c-tab-nav-button--active': active,
    });

    return (
      <li className={className} onClick={this.onClick}>
        {label}
      </li>
    );
  }
}

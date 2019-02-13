import * as React from 'react';
import * as classNames from 'classnames';
import { Icon } from '../Icon/Icon';

const style = require('./TabNavButton.scss');

interface TabNavButtonProps {
  id: string;
  label: string;
  active: boolean;
  onClick: (label: string) => void;
  onClose: (label: string) => void;
  noCloseButton: boolean;
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

  onClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const { id, onClose } = this.props;

    onClose(id);
  };

  renderCloseButton() {
    if (this.props.noCloseButton) {
      return null;
    }

    return (
      <button
        type="button"
        title="Close"
        className="c-tab-nav-button__close-button"
        onClick={this.onClose}
        tabIndex={-1}
      >
        <Icon
          icon="close"
          extraClasses={['c-tab-nav-button__close-button-icon']}
        />
      </button>
    );
  }

  render() {
    const { label, active } = this.props;
    const className = classNames('c-tab-nav-button', {
      'c-tab-nav-button--active': active,
    });

    return (
      <li className={className} onClick={this.onClick}>
        {label}
        {this.renderCloseButton()}
      </li>
    );
  }
}

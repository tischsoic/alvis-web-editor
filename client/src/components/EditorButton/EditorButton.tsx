import * as React from 'react';
import { Icon } from '../Icon/Icon';

const style = require('./EditorButton.scss');

export interface EditorButtonProps {
  icon: string;
  title: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export interface EditorButtonState {}

export class EditorButton extends React.PureComponent<
  EditorButtonProps,
  EditorButtonState
> {
  constructor(props: EditorButtonProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { icon, title, onClick } = this.props;

    return (
      <button
        type="button"
        title={title}
        className="btn btn-default c-editor-button"
        onClick={onClick}
      >
        <Icon icon={icon} />
      </button>
    );
  }
}

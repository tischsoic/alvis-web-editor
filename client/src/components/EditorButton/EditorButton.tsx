import * as React from 'react';
import * as classNames from 'classnames';

import { Icon } from '../Icon/Icon';

const style = require('./EditorButton.scss');

interface EditorButtonProps {
  icon: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/* tslint:disable variable-name */
const EditorButton = React.forwardRef<HTMLButtonElement, EditorButtonProps>(
  (props, ref) => {
    const { icon, title, active, disabled, onClick } = props;
    const className = classNames('btn ', 'btn-default ', 'c-editor-button', {
      active,
    });

    return (
      <button
        type="button"
        title={title}
        className={className}
        disabled={disabled}
        onClick={onClick}
        ref={ref}
      >
        <Icon icon={icon} />
      </button>
    );
  },
);

export { EditorButton };

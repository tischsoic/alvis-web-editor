import * as React from 'react';
import ReactDOM = require('react-dom');

const style = require('./EditorButton.scss');

export interface EditorButtonProps {}

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
    const { children } = this.props;

    return <button type="button" className="c-editor-button">{children}</button>;
  }
}

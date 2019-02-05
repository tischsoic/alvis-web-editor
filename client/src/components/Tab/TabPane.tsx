import * as React from 'react';
import * as classNames from 'classnames';

const style = require('./TabPane.scss');

export interface TabPaneProps {
  active: boolean;
  children: JSX.Element; // React.Element?
}

interface TabPaneState {}

export class TabPane extends React.PureComponent<TabPaneProps, TabPaneState> {
  static defaultProps = {};

  render() {
    const { children, active } = this.props;
    const className = classNames('c-tab-pane', { 'c-tab-pane--active': active });

    return <div className={className}>{children}</div>;
  }
}

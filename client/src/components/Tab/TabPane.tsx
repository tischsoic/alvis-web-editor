import * as React from 'react';
import * as classNames from 'classnames';

const style = require('./TabPane.scss');

export interface TabPaneProps {
  active: boolean;
  extraClasses: string[];
  children: JSX.Element; // React.Element?
}

interface TabPaneState {}

export class TabPane extends React.PureComponent<TabPaneProps, TabPaneState> {
  static defaultProps = {};

  render() {
    const { children, active, extraClasses } = this.props;
    const style = active ? {} : { display: 'none' };
    const className = classNames('c-tab-pane', extraClasses, {
      'c-tab-pane--active': active,
    });

    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
}

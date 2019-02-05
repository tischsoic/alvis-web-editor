import * as React from 'react';
import { TabNavButton } from './TabNavButton';
import * as classNames from 'classnames';

const style = require('./TabNav.scss');

export interface TabNavProps {
  tabsData: { id: string; label: string }[];
  activeId: string;
  onClick: (label: string) => void;
  onClose: (label: string) => void;
}

interface TabNavState {}

export class TabNav extends React.PureComponent<TabNavProps, TabNavState> {
  static defaultProps = {};

  render() {
    const { tabsData, activeId, onClick, onClose } = this.props;
    const className = classNames('c-tab-nav');

    return (
      <ul className={className}>
        {tabsData.map(({ id, label }) => (
          <TabNavButton
            key={id}
            id={id}
            label={label}
            active={id === activeId}
            onClick={onClick}
            onClose={onClose}
          />
        ))}
      </ul>
    );
  }
}

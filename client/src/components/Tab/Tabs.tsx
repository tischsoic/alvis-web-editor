import * as React from 'react';
import * as classNames from 'classnames';

import { TabPane } from './TabPane';
import { TabNav, TabNavProps } from './TabNav';
import { TabProps } from './Tab';

const style = require('./Tabs.scss');

interface TabsProps {
  activeId: string;
  children:
    | React.ReactElement<TabProps>
    | Iterable<React.ReactElement<TabProps>>;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}

interface TabsState {}

function isIterable(
  children: any,
): children is Iterable<React.ReactElement<TabProps>> {
  return typeof children[Symbol.iterator] === 'function';
}

export class Tabs extends React.PureComponent<TabsProps, TabsState> {
  static defaultProps = {};

  getChildrenArray(): React.ReactElement<TabProps>[] {
    const { children } = this.props;

    if (children === null) {
      return [];
    }

    // TODO: why this guard is not working?
    if (isIterable(children)) {
      return [...(children as Iterable<React.ReactElement<TabProps>>)];
    }

    return [children];
  }

  renderTabNav() {
    const { activeId, onTabClick, onTabClose } = this.props;
    const childrenArray = this.getChildrenArray();
    const tabsData = childrenArray.reduce<TabNavProps['tabsData']>(
      (tabsData, tab) => {
        const { id, label } = tab.props;
        tabsData.push({ id, label });
        return tabsData;
      },
      [],
    );

    return (
      <TabNav
        tabsData={tabsData}
        activeId={activeId}
        onClick={onTabClick}
        onClose={onTabClose}
      />
    );
  }

  renderTabs() {
    const { activeId } = this.props;
    const childrenArray = this.getChildrenArray();

    return childrenArray.map((tab) => {
      const { id } = tab.props;

      return (
        <TabPane key={id} active={id === activeId}>
          {tab.props.children}
        </TabPane>
      );
    });
  }

  render() {
    const className = classNames('c-tabs');

    return (
      <div className={className}>
        {this.renderTabNav()}
        {this.renderTabs()}
      </div>
    );
  }
}

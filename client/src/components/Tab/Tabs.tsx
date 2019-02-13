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
  noNavigation: boolean;
  noCloseButton: boolean;
}

interface TabsState {}

function isIterable(
  children: any,
): children is Iterable<React.ReactElement<TabProps>> {
  return typeof children[Symbol.iterator] === 'function';
}

export class Tabs extends React.PureComponent<TabsProps, TabsState> {
  static defaultProps = {
    onTabClick: () => {},
    onTabClose: () => {},
    noNavigation: false,
    noCloseButton: false,
  };

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
    const { activeId, onTabClick, onTabClose, noCloseButton } = this.props;
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
        noCloseButton={noCloseButton}
      />
    );
  }

  renderTabs() {
    const { activeId } = this.props;
    const childrenArray = this.getChildrenArray();

    return childrenArray.map((tab) => {
      const { id, extraClasses } = tab.props;

      return (
        <TabPane key={id} active={id === activeId} extraClasses={extraClasses}>
          {tab.props.children}
        </TabPane>
      );
    });
  }

  render() {
    const { noNavigation } = this.props;
    const className = classNames('c-tabs');

    return (
      <div className={className}>
        {!noNavigation && this.renderTabNav()}
        {this.renderTabs()}
      </div>
    );
  }
}

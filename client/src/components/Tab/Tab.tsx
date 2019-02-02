import * as React from 'react';

export interface TabProps {
  id: string;
  label: string;
  children: React.ReactElement<any>;
}

interface TabState {}

export class Tab extends React.PureComponent<TabProps, TabState> {
  constructor(props: TabProps) {
    super(props);

    this.state = {};
  }

  static defaultProps = {};

  render() {
    throw new Error('This component should not be rendered!');

    return null;
  }
}

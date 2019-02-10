import * as React from 'react';

const style = require('./Icon.scss');

export interface IconProps {
  icon: string;
}

export interface IconState {}

export class Icon extends React.PureComponent<IconProps, IconState> {
  constructor(props: IconProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { icon } = this.props;

    return (
      <svg className="c-icon">
        <use xlinkHref={`/public/svg/all.svg#${icon}`} />
      </svg>
    );
  }
}

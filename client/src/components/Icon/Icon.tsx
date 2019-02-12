import * as React from 'react';
import * as classNames from 'classnames';

const style = require('./Icon.scss');

export interface IconProps {
  icon: string;
  extraClasses: string[];
}

export interface IconState {}

export class Icon extends React.PureComponent<IconProps, IconState> {
  constructor(props: IconProps) {
    super(props);

    this.state = {};
  }

  static defaultProps = {
    extraClasses: [],
  };

  render() {
    const { icon, extraClasses } = this.props;
    const className = classNames('c-icon', extraClasses);

    return (
      <svg className={className}>
        <use xlinkHref={`/public/svg/all.svg#${icon}`} />
      </svg>
    );
  }
}

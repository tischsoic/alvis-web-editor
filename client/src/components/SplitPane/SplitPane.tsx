import * as React from 'react';

export interface SplitPaneProps {
  additionalClassName?: string; // TODO: this is how we mark props with default value in TS? Check it!
  vertical?: boolean; // change to type 'vertical' | 'horizontal or even create enum (?)
  minSpan?: number;
  initialSpan?: number;
  children: JSX.Element[];
  onResize?: () => void;
}

export interface SplitPaneState {
  size: number | null; // TODO: rename to `span` or maybe vive versa?
  isDuringResize: boolean;
}

// TODO: when resizing fast user can by accident select some text etc.
export class SplitPane extends React.PureComponent<SplitPaneProps, SplitPaneState> {
  constructor(props: SplitPaneProps) {
    super(props);

    const { initialSpan } = this.props;

    this.state = {
      size: initialSpan ? initialSpan : null,
      isDuringResize: false,
    };
  }

  static defaultProps = {
    vertical: true,
    additionalClassName: '',
    minSpan: 100,
    // initialSpan: 100,
  };

  private dragbarRef = React.createRef<HTMLDivElement>();
  private splitPaneRef = React.createRef<HTMLDivElement>();
  private firstContainerRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { vertical, minSpan, initialSpan } = this.props;
    const dragbar = this.dragbarRef.current;
    const firstContainer = this.firstContainerRef.current;

    if (!initialSpan) {
      if (vertical) {
        const { offsetWidth } = firstContainer;
        const firstContainerWidth = Math.max(offsetWidth, minSpan);

        this.setState({
          size: firstContainerWidth,
        });
      } else {
        const { offsetHeight } = firstContainer;
        const firstContainerHeight = Math.max(offsetHeight, minSpan);

        this.setState({
          size: firstContainerHeight,
        });
      }
    }

    dragbar.addEventListener('mousedown', this.startDrag, false);
    document.addEventListener('mouseup', this.endDrag, false);
  }

  componentDidUpdate(prevProps, prevState) {
    const { isDuringResize } = this.state;
    const { onResize } = this.props;

    if (!isDuringResize && prevState.isDuringResize && onResize) {
      onResize();
    }
  }

  private startDrag = () => {
    this.setState({ isDuringResize: true }, () => {
      document.addEventListener('mousemove', this.handleMouseMove, false);
    });
  };

  private endDrag = () => {
    this.setState({ isDuringResize: false }, () => {
      document.removeEventListener('mousemove', this.handleMouseMove, false); // TODO: Now it is called every time we release mouse over document
    });
  };

  private handleMouseMove: EventListener = (event: MouseEvent) => {
    const { minSpan, vertical } = this.props;
    const splitPane = this.splitPaneRef.current;

    if (vertical) {
      const pointerRelativeXPos = event.clientX - splitPane.offsetLeft;
      const dragbarWidth = 5;
      const firstContainerWidth = Math.max(
        pointerRelativeXPos - dragbarWidth / 2,
        minSpan,
      ); // TODO: what about caring for min-width of second pane???
      console.log(pointerRelativeXPos - dragbarWidth / 2);
      console.log(minSpan);
      console.log(firstContainerWidth);

      this.setState({
        size: firstContainerWidth,
      });
    } else {
      const pointerRelativeYPos = event.clientY - splitPane.offsetTop;
      const dragbarHeight = 5;
      const firstContainerHeight = Math.max(
        pointerRelativeYPos - dragbarHeight / 2,
        minSpan,
      ); // TODO: what about caring for min-width of second pane???
      console.log(pointerRelativeYPos - dragbarHeight / 2);
      console.log(minSpan);
      console.log(firstContainerHeight);

      this.setState({
        size: firstContainerHeight,
      });
    }
  };

  render() {
    const { children, additionalClassName, vertical } = this.props;
    const { size } = this.state;
    const positionClassName = vertical
      ? 'c-split-pane--vertical'
      : 'c-split-pane--horizontal';
    const dragbarPositionClassName = vertical
      ? 'c-split-pane__dragbar--vertical'
      : 'c-split-pane__dragbar--horizontal';

    console.log(children); // TODO: should we filter out nulls, '' etc?
    const style: { height?: number; width?: number } = {};

    if (size) {
      if (vertical) {
        style.width = size;
      } else {
        style.height = size;
      }
    }

    console.log(children, children[0], children[1]);

    return (
      <div
        className={`c-split-pane ${positionClassName} ${additionalClassName}`}
        ref={this.splitPaneRef}
      >
        <div
          className="c-split-pane__first-container"
          ref={this.firstContainerRef}
          style={style}
        >
          {children[0]}
        </div>
        <div
          className={`c-split-pane__dragbar ${dragbarPositionClassName}`}
          ref={this.dragbarRef}
        />
        <div className="c-split-pane__second-container">{children[1]}</div>
      </div>
    );
  }
}

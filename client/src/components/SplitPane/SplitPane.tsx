import * as React from 'react';

export interface SplitPaneProps {
  additionalClassName?: string; // TODO: this is how we mark props with default value in TS? Check it!
  vertical?: boolean; // maybe also clreate horizontal and require set to set only one of them
  minSpan?: number;
  initialSpan?: number;
}

export interface SplitPaneState {}

export class SplitPane extends React.Component<SplitPaneProps, SplitPaneState> {
  constructor(props: SplitPaneProps) {
    super(props);

    this.state = {};
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
    const { vertical, minSpan } = this.props;
    const dragbar = this.dragbarRef.current;
    const firstContainer = this.firstContainerRef.current;

    if (vertical) {
      const { offsetWidth } = firstContainer;
      const firstContainerWidth = Math.max(offsetWidth, minSpan);

      firstContainer.style.width = `${firstContainerWidth}px`;
      firstContainer.style.flexGrow = String(0);
    } else {
      const { offsetHeight } = firstContainer;
      const firstContainerHeight = Math.max(offsetHeight, minSpan);

      firstContainer.style.height = `${firstContainerHeight}px`;
      firstContainer.style.flexGrow = String(0);
    }

    dragbar.addEventListener('mousedown', this.startDrag, false);
    document.addEventListener('mouseup', this.endDrag, false);
  }

  private startDrag = () => {
    document.addEventListener('mousemove', this.handleMouseMove, false);
  };

  private endDrag = () => {
    document.removeEventListener('mousemove', this.handleMouseMove, false); // TODO: Now it is called every time we release mouse over document
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

      this.firstContainerRef.current.style.width = `${firstContainerWidth}px`;
      this.firstContainerRef.current.style.flexGrow = String(0);
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

      this.firstContainerRef.current.style.height = `${firstContainerHeight}px`;
      this.firstContainerRef.current.style.flexGrow = String(0);
    }
  };

  render() {
    const { children, additionalClassName, vertical } = this.props;
    const positionClassName = vertical
      ? 'c-split-pane--vertical'
      : 'c-split-pane--horizontal';
    const dragbarPositionClassName = vertical
      ? 'c-split-pane__dragbar--vertical'
      : 'c-split-pane__dragbar--horizontal';

    console.log(children); // TODO: should we filter out nulls, '' etc?

    return (
      <div
        className={`c-split-pane ${positionClassName} ${additionalClassName}`}
        ref={this.splitPaneRef}
      >
        <div
          className="c-split-pane__first-container"
          ref={this.firstContainerRef}
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

import * as React from 'react';

export interface SplitPaneProps {
  additionalClassName?: string;
  minSpan?: number;
}

export interface SplitPaneState {}

export class SplitPane extends React.Component<SplitPaneProps, SplitPaneState> {
  constructor(props: SplitPaneProps) {
    super(props);

    this.state = {};
  }

  static defaultProps = {
    additionalClassName: '',
    minSpan: 100,
  };

  private dragbarRef = React.createRef<HTMLDivElement>();
  private splitPaneRef = React.createRef<HTMLDivElement>();
  private firstContainerRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const dragbar = this.dragbarRef.current;

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
    const { minSpan } = this.props;
    const splitPane = this.splitPaneRef.current;
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
  };

  render() {
    const { children, additionalClassName } = this.props;

    console.log(children);

    return (
      <div
        className={`c-split-pane ${additionalClassName}`}
        ref={this.splitPaneRef}
      >
        <div
          className="c-split-pane__first-container"
          ref={this.firstContainerRef}
        >
          {children[0]}
        </div>
        <div className="c-split-pane__dragbar" ref={this.dragbarRef} />
        <div className="c-split-pane__second-container">{children[1]}</div>
      </div>
    );
  }
}

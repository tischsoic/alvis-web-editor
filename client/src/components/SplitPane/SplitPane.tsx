import * as React from 'react';

export interface SplitPaneProps {}

export interface SplitPaneState {}

export class SplitPane extends React.Component<SplitPaneProps, SplitPaneState> {
  constructor(props: SplitPaneProps) {
    super(props);

    this.state = {};
  }

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
    document.removeEventListener('mousemove', this.handleMouseMove, false);
  };

  private handleMouseMove: EventListener = (event: MouseEvent) => {
    const splitPane = this.splitPaneRef.current;
    const pointerRelativeXPos = event.clientX - splitPane.offsetLeft;
    const dragbarWidth = 5;
    const firstContainerWidth = pointerRelativeXPos - dragbarWidth / 2;

    this.firstContainerRef.current.style.width = `${firstContainerWidth}px`;
    this.firstContainerRef.current.style.flexGrow = String(0);
  };

  render() {
    const { children } = this.props;

    console.log(children);

    return (
      <div className="c-split-pane" ref={this.splitPaneRef}>
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

import * as React from 'react';
import ReactDOM = require('react-dom');

const style = require('./Modal.scss');

export interface ModalProps {
  onClose?: () => void;
  children: React.ReactNode;
}

export interface ModalState {}

export class Modal extends React.PureComponent<ModalProps, ModalState> {
  constructor(props: ModalProps) {
    super(props);

    this.state = {};
  }

  private modalContainer = document.querySelector('#modal-container');
  private dialog = React.createRef<HTMLDivElement>();

  private handleClickOutsideDialog = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const { target } = event;

    if (!(target instanceof Node) || !this.dialog.current.contains(target)) {
      this.props.onClose();
    }
  };

  render() {
    const { children } = this.props;

    return ReactDOM.createPortal(
      <div className="c-modal">
        <div className="c-modal__backdrop" />
        <div
          className="c-modal__container"
          onClick={this.handleClickOutsideDialog}
        >
          <div className="c-modal__filler-top" />
          <div className="c-modal__dialog" ref={this.dialog}>
            {children}
          </div>
          <div className="c-modal__filler-bottom" />
        </div>
      </div>,
      this.modalContainer,
    );
  }
}

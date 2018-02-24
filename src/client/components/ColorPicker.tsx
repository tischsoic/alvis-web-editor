import * as React from 'react';
import {
  Glyphicon,
  Modal,
  FormControl,
  FormGroup,
  Button,
  ButtonGroup,
  ButtonToolbar,
} from 'react-bootstrap';
import * as ModalDialog from 'react-bootstrap/lib/ModalDialog';

import { SketchPicker, ColorResult } from 'react-color';
import Draggable, {
  DraggableEventHandler,
  DraggableData,
  ControlPosition,
} from 'react-draggable';
import * as Color from 'color';

export class DraggableModalDialog extends React.Component {
  // TO DO: think about better solution => decorator?
  static onStop: DraggableEventHandler;
  static defaultPosition: ControlPosition;

  render() {
    return (
      <Draggable
        handle=".modal-header"
        onStop={DraggableModalDialog.onStop}
        defaultPosition={DraggableModalDialog.defaultPosition}
      >
        <ModalDialog {...this.props} />
      </Draggable>
    );
  }
}

export interface ColorPickerProps {
  color: string;
  onColorSelect: (selectedColor: string) => void;
}

export interface ColorPickerState {
  show: boolean;
  position;
}

export class ColorPicker extends React.Component<
  ColorPickerProps,
  ColorPickerState
> {
  constructor(props: ColorPickerProps) {
    super(props);

    this.state = {
      show: false,
      position: { x: 0, y: 0 },
    };

    this.onModalShow = this.onModalShow.bind(this);
    this.onModalClose = this.onModalClose.bind(this);
    this.onSketchPickerChangeComplete = this.onSketchPickerChangeComplete.bind(
      this,
    );
    this.onModalMoveStop = this.onModalMoveStop.bind(this);

    DraggableModalDialog.onStop = this.onModalMoveStop;
  }

  render() {
    const { color, onColorSelect } = this.props;
    const { show, position } = this.state;

    DraggableModalDialog.defaultPosition = position;

    return (
      <>
        <Button onClick={this.onModalShow} style={{ backgroundColor: color }}>
          <span
            className="glyphicon glyphicon-pencil"
            style={{ color: this.getGlyphiconColor() }}
          />
        </Button>
        <Modal
          show={show}
          enforceFocus={false}
          backdrop={false}
          onHide={this.onModalClose}
          aria-labelledby="contained-modal-title-sm"
          dialogComponentClass={DraggableModalDialog}
          dialogClassName="color-picker-dialog"
        >
          <Modal.Header closeButton />
          <Modal.Body bsClass="color-picker-body">
            <SketchPicker
              color={color}
              onChangeComplete={this.onSketchPickerChangeComplete}
              disableAlpha={true}
            />
          </Modal.Body>
          {/* <Modal.Footer>
                    <Button onClick={this.onModalClose}>OK</Button>
                    <Button onClick={this.onModalClose}>Cancel</Button>
                </Modal.Footer> */}
        </Modal>
      </>
    );
  }

  private onSketchPickerChangeComplete(color: ColorResult) {
    const { onColorSelect } = this.props;
    onColorSelect(color.hex);
  }

  private onModalShow() {
    const { show } = this.state;
    this.setState({
      show: !show,
    });
  }

  private onModalClose() {
    this.setState({
      show: false,
    });
  }

  private getGlyphiconColor(): string {
    const { color } = this.props;
    const glyphColor = Color(color).isDark() ? 'white' : 'black';

    return glyphColor;
  }

  private onModalMoveStop(e: MouseEvent, data: DraggableData): void | false {
    this.setState({
      position: {
        x: data.x,
        y: data.y,
      },
    });
  }
}

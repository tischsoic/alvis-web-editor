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

export interface NamePickerProps {
  container;
}

export interface NamePickerState {
  show: boolean;
  name: string;
  callback: (chosenName: string) => void;
}

export class NamePicker extends React.Component<
  NamePickerProps,
  NamePickerState
> {
  constructor(props: NamePickerProps) {
    super(props);

    this.state = {
      show: false,
      name: '',
      callback: null,
    };
  }

  render() {
    const { container } = this.props;
    const { show } = this.state;
    const onNameChange = (e) => {
      this.setState({
        name: e.target.value,
      });
    };

    return (
      <Modal
        show={show}
        onHide={() => this.onModalClose(false)}
        container={container}
        bsSize="small"
        aria-labelledby="contained-modal-title-sm"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-sm">Choose name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              this.onModalClose(true);
            }}
          >
            <FormGroup controlId="chooseNameFormGroup">
              <FormControl
                type="text"
                value={this.state.name}
                placeholder="Enter name"
                onChange={onNameChange}
              />
              <FormControl.Feedback />
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.onModalClose(true)}>OK</Button>
          <Button onClick={() => this.onModalClose(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  private onModalClose(success: boolean) {
    const { name, callback } = this.state;
    const finalChosenName = success ? name : null;

    if (callback !== null) {
      callback(finalChosenName);
    }

    this.setState({
      show: false,
      name: '',
      callback: null,
    });
  }

  public getName(callback: (name: string) => void) {
    const { show } = this.state;
    if (show) {
      throw {
        message: 'Choose name modal has been already opened!',
      };
    }

    this.setState({
      callback,
      show: true,
      name: '',
    });
  }
}

import * as React from 'react';
import ReactDOM = require('react-dom');
import { Modal } from '../../Modal/Modal';

const style = require('./ModalProjectName.scss');

export interface ModalProjectNameProps {
  onOkay: (projectName: string) => void;
  onCancel: () => void;
}

export interface ModalProjectNameState {
  projectName: string;
}

export class ModalProjectName extends React.PureComponent<
  ModalProjectNameProps,
  ModalProjectNameState
> {
  constructor(props: ModalProjectNameProps) {
    super(props);

    this.state = {
      projectName: '',
    };
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newProjectName } = event.target;

    this.setState({
      projectName: newProjectName,
    });
  };

  handleOkay = () => {
    const { onOkay } = this.props;
    const { projectName } = this.state;

    onOkay(projectName);
  };

  handleModalClose = () => {
    this.handleCancel();
  };

  handleCancel = () => {
    this.props.onCancel();
  };

  render() {
    const { projectName } = this.state;

    return (
      <Modal onClose={this.handleModalClose}>
        <div className="c-modal-project-name">
          <div className="c-modal-project-name__body">
            <form>
              <div className="form-group has-feedback">
                <input
                  placeholder="Enter name"
                  type="text"
                  className="form-control"
                  value={projectName}
                  onChange={this.handleNameChange}
                />
              </div>
            </form>
          </div>
          <div className="c-modal-project-name__footer">
            <button
              type="button"
              className="btn btn-default"
              onClick={this.handleOkay}
              disabled={projectName === ''}
            >
              OK
            </button>
            <button
              type="button"
              className="btn btn-default"
              onClick={this.handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

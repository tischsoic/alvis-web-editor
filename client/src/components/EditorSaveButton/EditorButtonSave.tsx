import * as React from 'react';
import { ModalProjectName } from '../Modals/ModalProjectName/ModalProjectName';
import { RootState } from '../../reducers';
import { bindActionCreators } from 'redux';
import { Dispatch, connect } from 'react-redux';
import { IProjectRecord } from '../../models/app';
import * as appActions from '../../actions/app';

const style = require('./EditorButtonSave.scss');

interface EditorButtonSaveStateProps {
  openedProject: IProjectRecord;
}

type EditorButtonSaveDispatchProps = ReturnType<typeof mapDispatchToProps>;

interface EditorButtonSaveOwnProps {}

type EditorButtonSaveProps = EditorButtonSaveStateProps &
  EditorButtonSaveDispatchProps &
  EditorButtonSaveOwnProps;

interface EditorButtonSaveState {
  isDuringChoosingName: boolean;
}

class EditorButtonSave extends React.PureComponent<
  EditorButtonSaveProps,
  EditorButtonSaveState
> {
  constructor(props: EditorButtonSaveProps) {
    super(props);

    this.state = {
      isDuringChoosingName: false,
    };
  }

  toggleProjectNameModal() {
    this.setState((state) => ({
      isDuringChoosingName: !state.isDuringChoosingName,
    }));
  }

  handleButtonClick = () => {
    const {openedProject, saveProjectToServer} = this.props

    if(openedProject) {
      saveProjectToServer();
      return;
    }

    this.toggleProjectNameModal();
  };

  saveProjectAs = (projectName: string) => {
    const {createProjectFromCurrent} = this.props;

    console.log('save: ', projectName);
    createProjectFromCurrent(projectName);
    this.toggleProjectNameModal();
  };

  cancelSave = () => {
    this.toggleProjectNameModal();
  };

  render() {
    const { isDuringChoosingName } = this.state;

    return (
      <>
        <button
          type="button"
          className="btn btn-default c-editor-button-save"
          onClick={this.handleButtonClick}
        >
          Save
        </button>
        {isDuringChoosingName && (
          <ModalProjectName
            onOkay={this.saveProjectAs}
            onCancel={this.cancelSave}
          />
        )}
      </>
    );
  }
}

function mapStateToProps(state: RootState): EditorButtonSaveStateProps {
  const { openedProject } = state.app;

  return {
    openedProject,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  const { createProjectFromCurrent, saveProjectToServer } = appActions;

  return bindActionCreators(
    {
      createProjectFromCurrent,
      saveProjectToServer,
    },
    dispatch,
  );
}

export default connect<
  EditorButtonSaveStateProps,
  EditorButtonSaveDispatchProps,
  EditorButtonSaveOwnProps
>(mapStateToProps, mapDispatchToProps)(EditorButtonSave);

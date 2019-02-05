import * as React from 'react';
import { List } from 'immutable';
import { IProjectRecord } from '../../models/app';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RootState } from '../../reducers';
import * as appActions from '../../actions/app';
import { getValidationState } from '../../utils/reactBootstrapUtils';

import {
  Button,
  ButtonGroup,
  ListGroup,
  FormGroup,
  FormControl,
  ControlLabel,
  Glyphicon,
} from 'react-bootstrap';
import { MenuPanel } from '../MenuPanel/MenuPanel';

interface MenuProjectsPanelStateProps {
  projects: List<IProjectRecord>;
  projectsDuringFetching: boolean;
  projectsAlreadyFetched: boolean;

  openedProjectId: number | null;
}

type MenuProjectsPanelDispatchProps = ReturnType<typeof mapDispatchToProps>;

interface MenuProjectsPanelOwnProps {
  onMenuPanelClose: () => void;
}

type MenuProjectsPanelProps = MenuProjectsPanelStateProps &
  MenuProjectsPanelDispatchProps &
  MenuProjectsPanelOwnProps;

interface MenuProjectsPanelState {
  newProjectName: string;
  newProjectNameValid: boolean | null;

  newProjectFiles: FileList;
  newProjectFileValid: boolean | null;
}

//////////////////////////////////////////////

/* tslint:disable-next-line:variable-name */
const CustomListGroupItem = ({ projectName, onOpen, onDelete }) => {
  // TODO: Change (rather) to class component
  return (
    <li
      className="list-group-item clearfix"
      onClick={() => {
        onOpen();
      }}
    >
      {projectName}
      <span className="pull-right">
        <Button
          bsStyle="danger"
          bsSize="xs"
          onClick={(e: Event) => {
            onDelete();
            e.stopPropagation();
          }}
        >
          <Glyphicon glyph="trash" />
        </Button>
      </span>
    </li>
  );
};

/////////////////////////////////////////////

class MenuProjectsPanel extends React.Component<
  MenuProjectsPanelProps,
  MenuProjectsPanelState
> {
  constructor(props: MenuProjectsPanelProps) {
    super(props);

    this.state = {
      newProjectName: '',
      newProjectNameValid: null,

      newProjectFiles: null,
      newProjectFileValid: null,
    };

    this.onNewProjectFileChange = this.onNewProjectFileChange.bind(this);
    this.onNewProjectNameChange = this.onNewProjectNameChange.bind(this);
  }

  componentWillMount() {
    const {
      projectsAlreadyFetched,
      projectsDuringFetching,
      onFetchProjects,
    } = this.props;

    if (!projectsAlreadyFetched && !projectsDuringFetching) {
      onFetchProjects();
    }
  }

  private onNewProjectNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newProjectName = e.target.value;
    this.setState({
      newProjectName,
    });
  }

  private onNewProjectFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e);
    console.log(e.target.files);
    const inputFiles = e.target.files;
    this.setState({
      newProjectFiles: inputFiles,
    });
  }

  private strNotEmpty(str: string): boolean {
    return !!str && str.length > 0;
  }

  private newProjectNameValid(newProjectName: string) {
    return this.strNotEmpty(newProjectName);
  }

  private newProjectFileValid(newProjectFiles: FileList): boolean {
    return !!newProjectFiles && newProjectFiles.length === 1;
  }

  private validateNewProjectName() {
    const { newProjectName } = this.state;
    this.setState({
      newProjectNameValid: this.newProjectNameValid(newProjectName),
    });
  }

  private validateNewProjectFile() {
    const { newProjectFiles } = this.state;
    this.setState({
      newProjectFileValid: this.newProjectFileValid(newProjectFiles),
    });
  }

  private renderProjectListItem(project: IProjectRecord) {
    const { onProjectOpen, onProjectDelete, onMenuPanelClose } = this.props;

    return (
      <CustomListGroupItem
        key={project.id}
        projectName={project.name}
        onOpen={() => {
          onProjectOpen(project.id);
          onMenuPanelClose();
        }}
        onDelete={() => {
          onProjectDelete(project.id);
        }}
      />
      // <ListGroupItem
      //     onClick={() => {
      //         onProjectOpen(project.id);
      //         onModalClose();
      //     }}
      //     key={project.id} >
      //     {project.name}
      //     <span className="pull-right">
      //         <Button bsStyle='danger' bsSize='xs'
      //         onClick={() => { onProjectDelete(project.id) }}>
      //             <Glyphicon glyph='trash' />
      //         </Button>
      //     </span>
      // </ListGroupItem>
    );
  }

  private renderProjectsList() {
    const { projects, projectsDuringFetching } = this.props;
    const projectListTitle = 'Old project';

    if (projectsDuringFetching) {
      return '...';
    }

    const projectsListItems = projects
      .map((project) => this.renderProjectListItem(project))
      .toArray();

    return (
      <ListGroup>
        <h4>{projectListTitle}</h4>
        {projectsListItems}
      </ListGroup>
    );
  }

  private renderNewProjectForm() {
    const {
      onProjectFromFileCreate,
      onEmptyProjectCreate,
      onMenuPanelClose,
    } = this.props;
    const {
      newProjectName,
      newProjectNameValid,
      newProjectFiles,
      newProjectFileValid,
    } = this.state;
    const formTitle = 'New project';

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault(); // TO DO: submit should be handled here: https://github.com/christianalfoni/formsy-react/issues/145
        }}
      >
        <h4>{formTitle}</h4>
        <FormGroup
          controlId="OpenProjectModalNewProjectNameInput"
          validationState={getValidationState(newProjectNameValid)}
        >
          <FormControl
            type="text"
            placeholder="Project name"
            value={newProjectName}
            onChange={this.onNewProjectNameChange}
            onBlur={() => {
              this.validateNewProjectName();
            }}
          />
          <FormControl.Feedback />
        </FormGroup>
        <FormGroup
          controlId="OpenProjectModalNewProjectFileInput"
          validationState={getValidationState(newProjectFileValid)}
        >
          <ControlLabel>.alvis file</ControlLabel>
          <FormControl
            type="file"
            accept=".alvis"
            onChange={this.onNewProjectFileChange}
          />
          <FormControl.Feedback />
        </FormGroup>
        <ButtonGroup>
          <Button
            type="submit"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              const nameValid = this.newProjectNameValid(newProjectName);

              this.setState({
                newProjectFileValid: newProjectFileValid || null,
              });

              if (!nameValid) {
                this.validateNewProjectName();
                e.preventDefault();
                return;
              }

              // TODO: fix TS types
              (onEmptyProjectCreate(newProjectName) as any).then(() => {
                onMenuPanelClose();
                // TO DO: update projects list data
              });

              e.preventDefault();
            }}
          >
            Empty
          </Button>
          <Button
            type="submit"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              const nameValid = this.newProjectNameValid(newProjectName);
              const fileValid = this.newProjectFileValid(newProjectFiles);

              if (!nameValid || !fileValid) {
                this.validateNewProjectName();
                this.validateNewProjectFile();

                e.preventDefault();
                return;
              }

              // TODO: fix TS types
              (onProjectFromFileCreate(
                newProjectName,
                newProjectFiles[0],
              ) as any).then(() => {
                onMenuPanelClose();
              });

              e.preventDefault();
            }}
          >
            From file
          </Button>
        </ButtonGroup>
      </form>
    );
  }

  render() {
    const {
      projects,
      projectsDuringFetching,
      projectsAlreadyFetched,
      openedProjectId,
      onMenuPanelClose,
    } = this.props;
    const someProjectIsOpened = openedProjectId !== null;

    return (
      <MenuPanel>
        {this.renderProjectsList()}
        {this.renderNewProjectForm()}
      </MenuPanel>
    );
  }
}

function mapStateToProps(state: RootState): MenuProjectsPanelStateProps {
  const {
    projects,
    projectsDuringFetching,
    projectsAlreadyFetched,
    openedProjectId,
  } = state.app;

  return {
    projects,
    projectsDuringFetching,
    projectsAlreadyFetched,
    openedProjectId,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  const {
    fetchProjects,
    openProjectFromServer,
    createProjectFromFile,
    createEmptyProject,
    deleteProject,
  } = appActions;

  return bindActionCreators(
    {
      onFetchProjects: fetchProjects,
      onProjectOpen: openProjectFromServer,
      onProjectFromFileCreate: createProjectFromFile,
      onEmptyProjectCreate: createEmptyProject,
      onProjectDelete: deleteProject,
    },
    dispatch,
  );
}

export default connect<
  MenuProjectsPanelStateProps,
  MenuProjectsPanelDispatchProps,
  MenuProjectsPanelOwnProps
>(mapStateToProps, mapDispatchToProps)(MenuProjectsPanel);

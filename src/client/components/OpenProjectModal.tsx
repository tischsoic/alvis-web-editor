import * as React from 'react';
import {
    IAgentRecord, agentRecordFactory,
    IPortRecord, portRecordFactory,
    IConnectionRecord, connectionRecordFactory, IInternalRecord,
    IAlvisPageElement,
    ConnectionDirection,
    IPageRecord,
} from "../models/alvisProject";
import { List } from 'immutable';
import {
    Modal, Button, ButtonGroup, Grid, Row, Col, ListGroup, ListGroupItem,
    FormGroup, FormControl, ControlLabel, Glyphicon,
} from 'react-bootstrap';
import { AxiosPromise } from 'axios';
import { IProjectRecord } from '../models/app';
import { getValidationState } from '../utils/reactBootstrapUtils';

function CustomListGroupItem({ projectName, onOpen, onDelete }) {
    return (
        <li className="list-group-item clearfix" onClick={() => {
            onOpen()
        }}>
            {projectName}
            <span className="pull-right">
                <Button bsStyle='danger' bsSize='xs' onClick={(e: Event) => {
                    onDelete()
                    e.stopPropagation();
                }}>
                    <Glyphicon glyph='trash' />
                </Button>
            </span>
        </li>
    );
}

export interface OpenProjectModalProps {
    showModal: boolean,

    projects: List<IProjectRecord>,
    projectsDuringFetching: boolean,
    projectsAlreadyFetched: boolean,

    openedProjectId: number | null,

    onFetchProjects: () => void,
    onModalClose: () => void,
    onProjectOpen: (projectId: number) => void,
    onProjectFromFileCreate: (name: string, sourceCodeFile: File) => AxiosPromise,
    onEmptyProjectCreate: (projectName: string) => AxiosPromise,
    onProjectDelete: (projectId: number) => AxiosPromise,
};

export interface OpenProjectModalState {
    newProjectName: string,
    newProjectNameValid: boolean | null,

    newProjectFiles: FileList,
    newProjectFileValid: boolean | null,
};

// TO DO: rename to ProjectManagerModal etc.
export class OpenProjectModal extends React.Component<OpenProjectModalProps, OpenProjectModalState> {
    constructor(props: OpenProjectModalProps) {
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
        const { projectsAlreadyFetched, projectsDuringFetching, onFetchProjects } = this.props;

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
        console.log(e.target.files)
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
        })
    }

    private validateNewProjectFile() {
        const { newProjectFiles } = this.state;
        this.setState({
            newProjectFileValid: this.newProjectFileValid(newProjectFiles),
        })
    }

    private renderProjectListItem(project: IProjectRecord) {
        const { onProjectOpen, onModalClose, onProjectDelete } = this.props;

        return (
            <CustomListGroupItem
                key={project.id}
                projectName={project.name}
                onOpen={() => {
                    onProjectOpen(project.id);
                    onModalClose();
                }}
                onDelete={() => { onProjectDelete(project.id) }} />
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
        const projectListTitle = 'Old project'

        if (projectsDuringFetching) {
            return '...';
        }

        const projectsListItems = projects.map((project) => this.renderProjectListItem(project)).toArray();

        return (
            <ListGroup>
                <h4>{projectListTitle}</h4>
                {projectsListItems}
            </ListGroup>
        );
    }

    private renderNewProjectForm() {
        const { onProjectFromFileCreate, onEmptyProjectCreate, onModalClose } = this.props;
        const { newProjectName, newProjectNameValid, newProjectFiles, newProjectFileValid } = this.state;
        const formTitle = 'New project';

        return (
            <form onSubmit={(e) => {
                e.preventDefault(); // TO DO: submit should be handled here: https://github.com/christianalfoni/formsy-react/issues/145
            }}>
                <h4>{formTitle}</h4>
                <FormGroup
                    controlId='OpenProjectModalNewProjectNameInput'
                    validationState={getValidationState(newProjectNameValid)}>
                    <FormControl
                        type='text'
                        placeholder='Project name'
                        value={newProjectName}
                        onChange={this.onNewProjectNameChange}
                        onBlur={() => {
                            this.validateNewProjectName();
                        }} />
                    <FormControl.Feedback />
                </FormGroup>
                <FormGroup
                    controlId='OpenProjectModalNewProjectFileInput'
                    validationState={getValidationState(newProjectFileValid)} >
                    <ControlLabel>.alvis file</ControlLabel>
                    <FormControl
                        type='file'
                        accept='.alvis'
                        onChange={this.onNewProjectFileChange} />
                    <FormControl.Feedback />
                </FormGroup>
                <ButtonGroup>
                    <Button type='submit' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        const nameValid = this.newProjectNameValid(newProjectName);

                        this.setState({
                            newProjectFileValid: newProjectFileValid || null,
                        });

                        if (!nameValid) {
                            this.validateNewProjectName();
                            e.preventDefault();
                            return;
                        }

                        onEmptyProjectCreate(newProjectName)
                            .then(() => {
                                onModalClose();
                                // TO DO: update projects list data
                            });

                        e.preventDefault();
                    }}>
                        Empty
                    </Button>
                    <Button type='submit' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        const nameValid = this.newProjectNameValid(newProjectName),
                            fileValid = this.newProjectFileValid(newProjectFiles);

                        if (!nameValid || !fileValid) {
                            this.validateNewProjectName();
                            this.validateNewProjectFile();

                            e.preventDefault();
                            return;
                        }

                        onProjectFromFileCreate(newProjectName, newProjectFiles[0])
                            .then(() => {
                                onModalClose();
                            });

                        e.preventDefault();
                    }}>
                        From file
                    </Button>
                </ButtonGroup>
            </form>
        )
    }

    render() {
        const { showModal, projects, projectsDuringFetching, projectsAlreadyFetched, openedProjectId, onModalClose } = this.props;
        const someProjectIsOpened = openedProjectId !== null,
            modalTitle = 'Open';

        return (
            <div>
                <Modal show={showModal} onHide={onModalClose} >
                    <Modal.Header closeButton={someProjectIsOpened} >
                        <Modal.Title>{modalTitle}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Grid bsClass='container-fluid'>
                            <Row>
                                <Col xs={6} md={6}>
                                    {this.renderProjectsList()}
                                </Col>
                                <Col xs={6} md={6}>
                                    <Col xs={12} md={12}>
                                        {this.renderNewProjectForm()}
                                    </Col>
                                </Col>
                            </Row>
                        </Grid>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={!someProjectIsOpened} onClick={onModalClose}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

}




// open/upload/empty
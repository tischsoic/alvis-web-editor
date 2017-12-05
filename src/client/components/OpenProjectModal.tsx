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
    FormGroup, FormControl, ControlLabel,
} from 'react-bootstrap';
import { AxiosPromise } from 'axios';
import { IProjectRecord } from '../models/app';
import { getValidationState } from '../utils/reactBootstrapUtils';

export interface OpenProjectModalProps {
    showModal: boolean,

    projects: List<IProjectRecord>,
    projectsDuringFetching: boolean,
    projectsAlreadyFetched: boolean,

    openedProjectId: number | null,

    onFetchProjects: () => void,
    onModalClose: () => void,
    onProjectOpen: (projectId: number) => void,
    onProjectFileCreate: () => void,
    onEmptyProjectCreate: () => void,
};

export interface OpenProjectModalState {
    newProjectName: string,
    newProjectNameValid: boolean | null,

    newProjectFile: any,
    newProjectFileValid: boolean | null,
};

export class OpenProjectModal extends React.Component<OpenProjectModalProps, OpenProjectModalState> {
    constructor(props: OpenProjectModalProps) {
        super(props);

        this.state = {
            newProjectName: '',
            newProjectNameValid: null,

            newProjectFile: '',
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
        const newProjectFile = e.target.value;
        this.setState({
            newProjectFile,
        });
    }

    private strNotEmpty(str: string) {
        return str && str.length > 0;
    }

    private newProjectNameValid(newProjectName: string) {
        return this.strNotEmpty(newProjectName);
    }

    private newProjectFileValid(newProjectFile: string) {
        return this.strNotEmpty(newProjectFile);
    }

    private validateNewProjectName() {
        const { newProjectName } = this.state;
        this.setState({
            newProjectNameValid: this.newProjectNameValid(newProjectName),
        })
    }

    private validateNewProjectFile() {
        const { newProjectFile } = this.state;
        this.setState({
            newProjectFileValid: this.newProjectFileValid(newProjectFile),
        })
    }

    private renderProjectListItem(project: IProjectRecord) {
        const { onProjectOpen, onModalClose } = this.props;

        return (
            <ListGroupItem
                onClick={() => {
                    onProjectOpen(project.id);
                    onModalClose();
                }}
                key={project.id} >
                {project.name}
            </ListGroupItem>
        );
    }

    private renderProjectsList() {
        const { projects, projectsDuringFetching } = this.props;

        if (projectsDuringFetching) {
            return '...';
        }

        const projectsListItems = projects.map((project) => this.renderProjectListItem(project)).toArray();

        return (
            <ListGroup>
                {projectsListItems}
            </ListGroup>
        );
    }

    private renderNewProjectForm() {
        const { } = this.props;
        const { newProjectName, newProjectNameValid, newProjectFile, newProjectFileValid } = this.state;
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
                        value={newProjectFile}
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

                        e.preventDefault();
                    }}>
                        Empty
                    </Button>
                    <Button type='submit' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        const nameValid = this.newProjectNameValid(newProjectName),
                            fileValid = this.newProjectFileValid(newProjectFile);

                        if (!nameValid || !fileValid) {
                            this.validateNewProjectName();
                            this.validateNewProjectFile();

                            e.preventDefault();
                            return;
                        }

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
            modalTitle = 'Open project';

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
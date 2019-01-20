import * as React from 'react';
import axios, { AxiosResponse, AxiosError, AxiosPromise } from 'axios';
import * as projectActions from '../actions/project/project';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  RouteComponentProps,
  Redirect,
  Switch,
  Route,
  withRouter,
} from 'react-router';
import { RootState } from '../reducers';
import parseAlvisProjectXML from '../utils/alvisXmlParser';
import { IAppRecord } from '../models/app';

import { Nav, NavItem, Grid, Row, Col, Modal, Button } from 'react-bootstrap';

import { AlvisGraph } from '../components/AlvisGraph';
import { AlvisGraphPanel } from '../components/AlvisGraphPanel';
import { HierarchyTree } from '../components/HierarchyTree';

// import mxgraph = require('mxgraph');
import { mx } from '../utils/mx';

import * as brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/jsx';

// const languages = [
//     'java',
// ]

const themes = [
  // 'github',
  'xcode',
];

// languages.forEach((lang) => {
//     require(`brace/mode/${lang}`)
//     require(`brace/snippets/${lang}`)
// })

require('./alvisMode');

themes.forEach((theme) => {
  require(`brace/theme/${theme}`);
});
/*eslint-disable no-alert, no-console */
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

import {
  IAgentRecord,
  IPortRecord,
  IConnectionRecord,
  IPageRecord,
  agentRecordFactory,
  IAlvisProjectRecord,
} from '../models/alvisProject';
import { List, Map } from 'immutable';
import { LoginPanel } from '../components/LoginPanel';
import { RegisterPanel } from '../components/RegisterPanel';

export namespace Editor {
  export interface StateProps {
    // extends RouteComponentProps<void> {
    appData: IAppRecord;
    xml: string;
    alvisProject: IAlvisProjectRecord;
    agents: Map<string, IAgentRecord>;
    ports: Map<string, IPortRecord>;
    pages: Map<string, IPageRecord>;
    connections: Map<string, IConnectionRecord>;
  }

  export interface DispatchProps {
    projectBindedActions: typeof projectActions; // TO DO thunk actions types are wrong
  }

  export interface OwnProps {}

  export type AllProps = StateProps & DispatchProps & OwnProps;

  export interface OwnState {
    codeEditorOpened: boolean;
    hierarchyTreeOpened: boolean;
    activePageInternalId: string;
  }
}

// @connect<Editor.StateProps, Editor.DispatchProps, Editor.State>(mapStateToProps, mapDispatchToProps)
// @connect<Editor.StateProps, Editor.DispatchProps, Editor.AllProps>(mapStateToProps, mapDispatchToProps)
export class EditorComponent extends React.Component<
  Editor.AllProps,
  Editor.OwnState
> {
  constructor(props?: Editor.AllProps, context?: Editor.OwnState) {
    super(props, context);

    const systemPage = this.getSystemPage(this.props.alvisProject.pages);

    this.state = {
      codeEditorOpened: true,
      hierarchyTreeOpened: false,
      activePageInternalId: systemPage ? systemPage.internalId : null,
    };
  }

  componentWillReceiveProps(nextProps: Editor.AllProps) {
    const { activePageInternalId } = this.state;
    const nextPages = nextProps.alvisProject.pages;
    const nextPagesInternalIds = nextPages.map((page) => page.internalId);

    let nextActivePageInternalId: string = null;
    if (nextPagesInternalIds.contains(activePageInternalId)) {
      nextActivePageInternalId = activePageInternalId;
    } else if (
      !nextPagesInternalIds.contains(activePageInternalId) &&
      nextPagesInternalIds.size !== 0
    ) {
      const systemPage = this.getSystemPage(nextPages);
      nextActivePageInternalId = systemPage.internalId;
    }

    this.setState({
      activePageInternalId: nextActivePageInternalId,
    });
  }

  showHierarchyTree() {
    this.setState({
      codeEditorOpened: false,
      hierarchyTreeOpened: true,
    });
  }

  showCodeEditor() {
    this.setState({
      codeEditorOpened: true,
      hierarchyTreeOpened: false,
    });
  }

  setActivePageInternalId(pageInternalId: string) {
    this.setState({
      activePageInternalId: pageInternalId,
    });
  }

  getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean) {
    const elementIndex = elements.findIndex(fn);
    const element = elementIndex !== -1 ? elements.get(elementIndex) : null;

    return element;
  }

  getSystemPage(pages: Map<string, IPageRecord>) {
    // TODO: store 'System' in some global variable
    return pages.find((page) => page.name === 'System')
  }

  render() {
    const {
      xml,
      pages,
      agents,
      ports,
      connections,
      projectBindedActions,
      alvisProject,
    } = this.props;
    const {
      codeEditorOpened,
      hierarchyTreeOpened,
      activePageInternalId,
    } = this.state;
    const { appData } = this.props;

    const onEditorChange = function(value: string, event?: any): void {
      console.log(arguments);
    };

    return (
      <div>
        <div style={{ width: '33%', float: 'left' }}>
          <Nav bsStyle="tabs" activeKey={codeEditorOpened ? '1' : '2'}>
            <NavItem
              eventKey="1"
              onClick={() => {
                this.showCodeEditor();
              }}
            >
              Editor
            </NavItem>
            <NavItem
              eventKey="2"
              onClick={() => {
                this.showHierarchyTree();
              }}
            >
              Hierarchy
            </NavItem>
          </Nav>
          {codeEditorOpened ? (
            <AceEditor
              mode="alvis"
              theme="xcode"
              onChange={onEditorChange}
              name="alvisCode_1"
              value={alvisProject.code.text}
              editorProps={{ $blockScrolling: true }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
              }}
              width="100%"
            />
          ) : (
            <HierarchyTree
              pages={pages}
              agents={agents}
              onPageClick={(page) =>
                this.setActivePageInternalId(page.internalId)
              }
              onMxGraphPageDeleted={projectBindedActions.deletePage}
            />
          )}
        </div>
        <div style={{ width: '67%', float: 'left' }}>
          <AlvisGraphPanel
            alvisProject={alvisProject}
            projectId={0}
            onChangeActivePage={(newActivePageInternalId: string) =>
              this.setActivePageInternalId(newActivePageInternalId)
            }
            activePageInternalId={activePageInternalId}
            onMxGraphPageAdded={projectBindedActions.addPage}
            onMxGraphAgentAdded={projectBindedActions.addAgent}
            onMxGraphAgentDeleted={projectBindedActions.deleteAgent}
            onMxGraphAgentModified={projectBindedActions.modifyAgent}
            onMxGraphPortAdded={projectBindedActions.addPort}
            onMxGraphPortDeleted={projectBindedActions.deletePort}
            onMxGraphPortModified={projectBindedActions.modifyPort}
            onMxGraphConnectionAdded={projectBindedActions.addConnection}
            onMxGraphConnectionDeleted={projectBindedActions.deleteConnection}
            onMxGraphConnectionModified={projectBindedActions.modifyConnection}
            onUndo={projectBindedActions.undo}
            onRedo={projectBindedActions.redo}
            onCopy={projectBindedActions.copy}
            onCut={projectBindedActions.cut}
            onPaste={projectBindedActions.paste}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState): Editor.StateProps {
  return {
    appData: state.app,
    xml: state.project.xml,
    alvisProject: state.project.alvisProject,
    agents: state.project.alvisProject.agents, // .filter((agent) => agent.pageInternalId === '0').toList(),
    ports: state.project.alvisProject.ports,
    connections: state.project.alvisProject.connections,
    pages: state.project.alvisProject.pages,
  };
}

function mapDispatchToProps(dispatch: any): Editor.DispatchProps {
  return {
    projectBindedActions: bindActionCreators(projectActions as any, dispatch),
  };
}

// It seems that you need withRouter when using connect.
/* tslint:disable-next-line:variable-name */
export const Editor: React.ComponentClass = withRouter(connect<
  Editor.StateProps,
  Editor.DispatchProps,
  Editor.OwnProps
>(mapStateToProps, mapDispatchToProps)(EditorComponent) as any);

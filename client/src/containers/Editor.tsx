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
import { List, Map, OrderedSet } from 'immutable';
import { LoginPanel } from '../components/LoginPanel';
import { RegisterPanel } from '../components/RegisterPanel';
import { SplitPane } from '../components/SplitPane/SplitPane';
import { Tabs } from '../components/Tab/Tabs';
import { Tab } from '../components/Tab/Tab';

const style = require('./Editor.scss');

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
    openedView: 'code-editor' | 'hierarchy-tree'; // TODO: replace with Enum - panelOpenedId = 'code-editor' | 'hierarchy-tree'
    activePageId: string;
    openedPagesIds: OrderedSet<string>;
    aceEditorWidth: number;
    aceEditorHeight: number;
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
      openedView: 'code-editor', // TODO: store setting in localStorage
      activePageId: systemPage ? systemPage.internalId : null,
      openedPagesIds: systemPage
        ? OrderedSet([systemPage.internalId])
        : OrderedSet(),
      aceEditorWidth: 0,
      aceEditorHeight: 0,
    };
  }

  private topContainerContentRef = React.createRef<HTMLDivElement>();
  private aceEditorRef = React.createRef<AceEditor>();

  componentWillReceiveProps(nextProps: Editor.AllProps) {
    const { activePageId, openedPagesIds } = this.state;
    const nextPages = nextProps.alvisProject.pages;
    const nextPagesInternalIds = nextPages.map((page) => page.internalId);

    let nextActivePageId: string = null;
    let nextOpenedPagesIds: OrderedSet<string> = OrderedSet();
    if (nextPagesInternalIds.contains(activePageId)) {
      nextActivePageId = activePageId;
      nextOpenedPagesIds = openedPagesIds.intersect(
        nextPagesInternalIds.keys(),
      );
    } else if (
      !nextPagesInternalIds.contains(activePageId) &&
      nextPagesInternalIds.size !== 0
    ) {
      const systemPage = this.getSystemPage(nextPages);
      const systemPageId = systemPage.internalId;

      nextActivePageId = systemPageId;
      nextOpenedPagesIds = OrderedSet([systemPageId]);
    }

    this.setState({
      activePageId: nextActivePageId,
      openedPagesIds: nextOpenedPagesIds,
    });
  }

  componentDidUpdate() {
    const { aceEditorWidth, aceEditorHeight } = this.state;
    const aceEditorContainer = this.topContainerContentRef.current;
    const { offsetWidth, offsetHeight } = aceEditorContainer;

    // TODO: It is a little bit unsafe, can we change it?
    if (aceEditorWidth !== offsetWidth || aceEditorHeight !== offsetHeight) {
      this.setState({
        aceEditorWidth: offsetWidth,
        aceEditorHeight: offsetHeight,
      });
    }
  }

  changeTab = (tabId: string) => {
    this.setState({
      openedView: tabId as 'code-editor' | 'hierarchy-tree',
    });
  };

  closePage = (pageId: string) => {
    this.setState((state) => {
      const oldActivePageId = state.activePageId;
      const openedPagesIds = state.openedPagesIds.remove(pageId);
      const activePageId =
        pageId !== oldActivePageId
          ? oldActivePageId
          : openedPagesIds.last(null);

      return {
        activePageId,
        openedPagesIds,
      };
    });
  };

  setActivePageInternalId = (pageId: string) => {
    this.setState((state) => ({
      activePageId: pageId,
      openedPagesIds: state.openedPagesIds.add(pageId),
    }));
  };

  getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean) {
    const elementIndex = elements.findIndex(fn);
    const element = elementIndex !== -1 ? elements.get(elementIndex) : null;

    return element;
  }

  getSystemPage(pages: Map<string, IPageRecord>) {
    // TODO: store 'System' in some global variable
    return pages.find((page) => page.name === 'System');
  }

  // TODO: to avoid using forceUpdate we should store SplitPane width/height not in SplitPane but in this component
  // and pass this width/height to SplitPane
  private onSplitPaneResize = (): void => {
    const aceEditor = this.aceEditorRef.current;

    if (aceEditor) {
      this.forceUpdate();
      // console.log(aceEditor);
      // aceEditor.editor
    }
  };

  private onRightSplitPaneResize = (): void => {};

  renderOutlineTabs() {
    const { activePageId, openedPagesIds } = this.state;
    const tabs = openedPagesIds
      .map((pageId) => (
        <Tab id={pageId} label={pageId} key={pageId}>
          <div
            className="c-editor__outline-container"
            id={`c-editor__outline-${pageId}`}
            style={{ position: 'absolute', width: '100%' }} // TODO: move to some scss etc.
          />
        </Tab>
      ))
      .toList();

    // TODO: turns out our type system allows passing
    return (
      <Tabs activeId={activePageId} noNavigation>
        {tabs}
      </Tabs>
    );
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
      openedView,
      activePageId,
      openedPagesIds,
      aceEditorWidth,
      aceEditorHeight,
    } = this.state;
    const { appData } = this.props;

    const onEditorChange = function(value: string, event?: any): void {
      console.log(arguments);
    };

    return (
      <>
        <SplitPane
          additionalClassName="c-editor__split-pane"
          onResize={this.onSplitPaneResize}
        >
          <SplitPane
            vertical={false}
            onResize={this.onSplitPaneResize}
            additionalClassName="c-editor__split-pane-horizontal-fst"
          >
            <div className="c-editor__top-container-wrapper">
              <Tabs
                activeId={openedView}
                onTabClick={this.changeTab}
                noCloseButton
              >
                <Tab
                  id="code-editor"
                  label="Editor"
                  extraClasses={['c-editor__top-container-tab']}
                >
                  <div
                    className="c-editor__ace-editor-wrapper"
                    ref={this.topContainerContentRef}
                  >
                    <AceEditor
                      mode="alvis"
                      theme="xcode"
                      onChange={onEditorChange}
                      name="alvisCode_1"
                      value={alvisProject.code.text}
                      editorProps={{ $blockScrolling: false }}
                      setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                      }}
                      width={`${aceEditorWidth}px`}
                      height={`${aceEditorHeight}px`}
                      ref={this.aceEditorRef}
                    />
                  </div>
                </Tab>
                <Tab
                  id="hierarchy-tree"
                  label="Hierarchy"
                  extraClasses={['c-editor__top-container-tab']}
                >
                  <HierarchyTree
                    pages={pages}
                    agents={agents}
                    onPageClick={(page) =>
                      this.setActivePageInternalId(page.internalId)
                    }
                    onMxGraphPageDeleted={projectBindedActions.deletePage}
                  />
                </Tab>
              </Tabs>
            </div>
            <div className="c-editor__outline">{this.renderOutlineTabs()}</div>
          </SplitPane>
          <SplitPane
            vertical={false}
            onResize={this.onRightSplitPaneResize}
            additionalClassName="c-editor__split-pane-horizontal-snd"
          >
            <div className="c-editor__graph-editor">
              <AlvisGraphPanel
                alvisProject={alvisProject}
                onChangeActivePage={this.setActivePageInternalId}
                onClosePage={this.closePage}
                activePageId={activePageId}
                openedPagesIds={openedPagesIds}
                onProjectModify={projectBindedActions.applyModification}
                onHierarchyRemove={projectBindedActions.removeHierarchy}
                onUndo={projectBindedActions.undo}
                onRedo={projectBindedActions.redo}
                onCopy={projectBindedActions.copy}
                onCut={projectBindedActions.cut}
                onPaste={projectBindedActions.paste}
              />
            </div>
            <div className="c-editor__console">Console:</div>
          </SplitPane>
        </SplitPane>
      </>
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

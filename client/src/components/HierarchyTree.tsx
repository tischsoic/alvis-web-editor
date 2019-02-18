import * as React from 'react';
import {
  IAgentRecord,
  agentRecordFactory,
  IPortRecord,
  portRecordFactory,
  IConnectionRecord,
  connectionRecordFactory,
  IIdentifiableElement,
  IAlvisPageElement,
  ConnectionDirection,
  IPageRecord,
} from '../models/alvisProject';
import { List, Map } from 'immutable';
import { Button, Glyphicon } from 'react-bootstrap';
import { IPartialModification } from '../models/project';

export interface HierarchyTreeProps {
  pages: Map<string, IPageRecord>;
  agents: Map<string, IAgentRecord>;
  onPageClick: (page: IPageRecord) => void;

  onProjectModify: (modification: IPartialModification) => any;
}

export interface HierarchyTreeState {}

export class HierarchyTree extends React.Component<
  HierarchyTreeProps,
  HierarchyTreeState
> {
  constructor(props: HierarchyTreeProps) {
    super(props);
  }

  getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean) {
    const elementIndex = elements.findIndex(fn);
    const element = elementIndex !== -1 ? elements.get(elementIndex) : null;

    return element;
  }

  // TODO: start using strict-null
  getPageByInternalId(internalId: string): IPageRecord {
    const { pages } = this.props;

    return pages.get(internalId);
  }

  getSystemPage(): IPageRecord {
    const { pages } = this.props;

    return pages.find((page) => page.name === 'System');
  }

  getPageSupAgent(page: IPageRecord) {
    const { agents } = this.props;

    return agents.find((agent) => agent.internalId === page.supAgentInternalId);
  }

  private handlePageDelete = (pageId: string) => () => {
    this.props.onProjectModify({
      pages: { deleted: List([pageId]) },
    });
  };

  getPageTree(page: IPageRecord) {
    const { onPageClick, onProjectModify } = this.props;
    const subPages = page.subPagesInternalIds.map((pageInternalId) =>
      this.getPageByInternalId(pageInternalId),
    );
    const subPagesTrees = subPages.map((subPage) => this.getPageTree(subPage));
    const supAgent = this.getPageSupAgent(page);
    const pageInternalId = page.internalId;

    return (
      <li key={pageInternalId}>
        <Button bsStyle="link" bsSize="small" onClick={() => onPageClick(page)}>
          {page.name + (supAgent ? ' < ' + supAgent.name : '')}
        </Button>
        {page.name !== 'System' && (
          <Button
            bsStyle="danger"
            bsSize="xsmall"
            onClick={this.handlePageDelete(pageInternalId)}
          >
            <Glyphicon glyph="remove" />
          </Button>
        )}{' '}
        {/* TO DO: store 'System' name in some config! */}
        {subPagesTrees.size !== 0 ? <ul> {subPagesTrees} </ul> : null}
      </li>
    );
  }

  render() {
    const systemPage = this.getSystemPage();

    return <ul className={'hierarchy-tree'}>{this.getPageTree(systemPage)}</ul>;
  }
}

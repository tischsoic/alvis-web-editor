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
import { List } from 'immutable';
import { Button, Glyphicon } from 'react-bootstrap';

export interface HierarchyTreeProps {
  pages: List<IPageRecord>;
  agents: List<IAgentRecord>;
  onPageClick: (page: IPageRecord) => void;

  onMxGraphPageDeleted: (pageInternalId: string) => any;
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

  getPageByInternalId(internalId: string) {
    const { pages } = this.props;
    return this.getElementByFn(pages, (page) => page.internalId === internalId);
  }

  getSystemPage() {
    const { pages } = this.props;
    return this.getElementByFn(pages, (page) => page.name === 'System'); // TO DO: extract "System" as constant in some config
  }

  getPageSupAgent(page: IPageRecord) {
    const { agents } = this.props;
    return this.getElementByFn(
      agents,
      (agent) => agent.internalId === page.supAgentInternalId,
    );
  }

  getPageTree(page: IPageRecord) {
    const { onPageClick, onMxGraphPageDeleted } = this.props;
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
            onClick={() => onMxGraphPageDeleted(pageInternalId)}
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

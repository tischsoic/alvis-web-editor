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

export interface HierarchyTreeProps {
    pages: List<IPageRecord>,
    agents: List<IAgentRecord>,
    onPageClick: (page: IPageRecord) => void,
};

export interface HierarchyTreeState { };

export class HierarchyTree extends React.Component<HierarchyTreeProps, HierarchyTreeState> {
    constructor(props: HierarchyTreeProps) {
        super(props);

    }

    getElementByFn<T>(elements: List<T>, fn: (element: T) => boolean) {
        const elementIndex = elements.findIndex(fn),
            element = elementIndex !== -1 ? elements.get(elementIndex) : null;

        return element;
    }

    getPageByInternalId(internalId: string) {
        const { pages } = this.props;
        return this.getElementByFn(pages, (page) => page.internalId === internalId);
    }

    getSystemPage() {
        const { pages } = this.props;
        return this.getElementByFn(pages, (page) => page.name === 'System');
    }

    getPageSupAgent(page: IPageRecord) {
        const { agents } = this.props;
        return this.getElementByFn(agents, (agent) => agent.internalId === page.supAgentInternalId);
    }

    getPageTree(page: IPageRecord) {
        const { onPageClick } = this.props;
        const subPages = page.subPagesInternalIds.map((pageInternalId) => this.getPageByInternalId(pageInternalId)),
            subPagesTrees = subPages.map((subPage) => this.getPageTree(subPage)),
            supAgent = this.getPageSupAgent(page);

        return (
            <li key={page.internalId}>
                <a href='#' onClick={() => onPageClick(page)}>{page.name + (supAgent ? ' < ' + supAgent.name : '')}</a>
                {subPagesTrees.size !== 0
                    ? <ul> {subPagesTrees} </ul>
                    : null
                }
            </li>
        );
    }

    render() {
        const systemPage = this.getSystemPage();

        return (
            <ul className={'hierarchy-tree'}>
                {this.getPageTree(systemPage)}
            </ul>
        );
    }

}
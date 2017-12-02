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
import { Button, Glyphicon, Tabs, Tab } from 'react-bootstrap';

export interface OpenProjectPanelProps {

};

export interface OpenProjectPanelState { };

export class OpenProjectPanel extends React.Component<OpenProjectPanelProps, OpenProjectPanelState> {
    constructor(props: OpenProjectPanelProps) {
        super(props);

    }

    render() {
        return (
            <div>
                {/* <Tabs activeKey={} onSelect={} id='alvis-graph-panel'>
                    <Tab eventKey={pageInternalId} title='Projects' key={pageInternalId}>

                    </Tab>
                    <Tab eventKey={pageInternalId} title='New Project' key={pageInternalId}>

                    </Tab>
                </Tabs> */}
            </div>
        );
    }

}




// open/upload/empty
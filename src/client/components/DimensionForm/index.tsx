import * as React from 'react';
import {List} from 'immutable';

import {
    IAgentRecord,
    IPortRecord,
    IConnectionRecord,
    agentRecordFactory,
} from "../../models/alvisProject";

// TO DO
// should not be "=> any", probably
export interface DimensionFormProps {
    xDim: number, onXDimChange: (newXDim: number) => any, getYDim: () => any,
    addActiveAgent: (agent) => any
};
export interface DimensionFormState { };

export class DimensionForm extends React.Component<DimensionFormProps, DimensionFormState> {
    constructor(props: DimensionFormProps) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event: React.SyntheticEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement;
        console.log(this.props.onXDimChange);
        console.log(this.props.getYDim);
        this.props.onXDimChange(parseInt(target.value) || 0);
    }
    render() {
        console.log(this.props.getYDim)
        // console.log('asdfasdfasdf3')
        return (
            <div>
                Wymiar jakiś  asdfasfd x: <input type="text" value={this.props.xDim} onChange={this.handleInputChange} /><br />
                Pobranie wymiaru y: <button onClick={this.props.getYDim}>Pobierz!</button><br />
                <button onClick={() => {
                    this.props.addActiveAgent(agentRecordFactory({
                        internalId: null,
                        name: 'A',
                        portsInternalIds: List<string>([]),
                        index: null,
                        active: 1, // TO DO: maybe boolean
                        running: null, // TO DO: maybe boolean
                        height: 100,
                        width: 100,
                        x: 0,
                        y: 0,
                        color: 'white',
                        pageInternalId: '0',
                    }));
                }
                }>Dodaj agenta!</button>
            </div>
        )
    }
}
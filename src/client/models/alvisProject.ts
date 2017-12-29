import { Record, List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface IInternalRecord {
    readonly internalId: string,
}

export type IAlvisPageElement = IAgentRecord | IPortRecord | IConnectionRecord;

export interface IPort extends IInternalRecord {
    readonly agentInternalId: string,
    readonly name: string,
    readonly x: number,
    readonly y: number,
    readonly color: string,
    // readonly connectionsInternalIds: List<string>,
};
export interface IPortRecord
    extends TypedRecord<IPortRecord>, IPort { };
const defaultPortRecord: IPort = {
    internalId: null,
    agentInternalId: null,
    name: null,
    x: null,
    y: null,
    color: null,
    // connectionsInternalIds: List<string>(),
};
export const portRecordFactory
    = makeTypedFactory<IPort, IPortRecord>(defaultPortRecord);


export interface IAgent extends IInternalRecord {
    readonly internalId: string, // TO DO: if it extends IInternalRecord it is not necessary to redefne internalId field here.
    readonly pageInternalId: string,
    readonly subPageInternalId: string,
    readonly name: string,
    readonly portsInternalIds: List<string>,
    readonly index: string,
    readonly active: number, // TO DO: maybe boolean
    readonly running: number, // TO DO: maybe boolean
    readonly height: number,
    readonly width: number,
    readonly x: number,
    readonly y: number,
    readonly color: string,
}
export interface IAgentRecord
    extends TypedRecord<IAgentRecord>, IAgent { };
const defaultAgentRecord: IAgent = {
    internalId: null,
    pageInternalId: null,
    subPageInternalId: null,
    name: null,
    portsInternalIds: List<string>([]),
    index: null,
    active: null, // TO DO: maybe boolean
    running: null, // TO DO: maybe boolean
    height: null,
    width: null,
    x: 0,
    y: 0,
    color: null,
}
export const agentRecordFactory
    = makeTypedFactory<IAgent, IAgentRecord>(defaultAgentRecord);


export type ConnectionDirection = 'target' | 'source' | 'none'; // TO DO: that is all?
export interface IConnection extends IInternalRecord {
    readonly internalId: string,
    readonly direction: ConnectionDirection,
    readonly sourcePortInternalId: string,
    readonly targetPortInternalId: string,
    readonly style: string,
}
export interface IConnectionRecord
    extends TypedRecord<IConnectionRecord>, IConnection { };
const defaultConnectionRecord: IConnection = {
    internalId: null,
    direction: null,
    sourcePortInternalId: null,
    targetPortInternalId: null,
    style: null,
}
export const connectionRecordFactory
    = makeTypedFactory<IConnection, IConnectionRecord>(defaultConnectionRecord);


export interface IPage extends IInternalRecord {
    readonly internalId: string,
    readonly name: string,
    readonly agentsInternalIds: List<string>,
    readonly subPagesInternalIds: List<string>,
    readonly supAgentInternalId: string,
    // readonly connectionsInternalIds: List<string>,
}
export interface IPageRecord
    extends TypedRecord<IPageRecord>, IPage { };
const defaultPageRecord: IPage = {
    internalId: null,
    name: null,
    agentsInternalIds: List<string>(),
    subPagesInternalIds: List<string>(),
    supAgentInternalId: null,
    // connectionsInternalIds: List<string>([]),
}
export const pageRecordFactory
    = makeTypedFactory<IPage, IPageRecord>(defaultPageRecord);


export interface IAlvisCode {
    readonly text: string
}
export interface IAlvisCodeRecord
    extends TypedRecord<IAlvisCodeRecord>, IAlvisCode { };
const defaultAlvisCodeRecord: IAlvisCode = {
    text: "",
}
export const alvisCodeRecordFactory
    = makeTypedFactory<IAlvisCode, IAlvisCodeRecord>(defaultAlvisCodeRecord);


export interface IAlvisProject {
    readonly pages: List<IPageRecord>,
    readonly agents: List<IAgentRecord>,
    readonly ports: List<IPortRecord>,
    readonly connections: List<IConnectionRecord>,
    readonly code: IAlvisCodeRecord,
}
export interface IAlvisProjectRecord
    extends TypedRecord<IAlvisProjectRecord>, IAlvisProject { };
const defaultAlvisProjectRecord: IAlvisProject = {
    pages: List<IPageRecord>([]),
    agents: List<IAgentRecord>([]),
    ports: List<IPortRecord>([]),
    connections: List<IConnectionRecord>([]),
    code: null,
}
export const alvisProjectRecordFactory
    = makeTypedFactory<IAlvisProject, IAlvisProjectRecord>(defaultAlvisProjectRecord);

// https://spin.atomicobject.com/2016/11/30/immutable-js-records-in-typescript/
// export class PortRecord extends Record({}) {

//     constructor(params: Port) {
//         params ? super(params) : super();
//     }

//     with(values: Port) {
//         return this.merge(values) as this;
//     }
// }

import { Record, List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface IPort {
    readonly internalId: string,
    readonly mxGraphId: string,
    readonly name: string,
    readonly x: number,
    readonly y: number,
    readonly color: string,
};
export interface IPortRecord
    extends TypedRecord<IPortRecord>, IPort { };
const defaultPortRecord = {
    internalId: null,
    mxGraphId: null,
    name: null,
    x: null,
    y: null,
    color: null,
};
export const portRecordFactory
    = makeTypedFactory<IPort, IPortRecord>(defaultPortRecord);


export interface IAgent {
    readonly internalId: string,
    readonly mxGraphId: string, // Only to know which agent is which in mxGraph
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
    mxGraphId: null,
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
export interface IConnection {
    readonly internalId: string,
    readonly mxGraphId: string, // Only to know which agent is which in mxGraph
    readonly direction: ConnectionDirection,
    readonly sourcePortInternalId: string,
    readonly targetPortInternalId: string,
    readonly style: string,
}
export interface IConnectionRecord
    extends TypedRecord<IConnectionRecord>, IConnection { };
const defaultConnectionRecord: IConnection = {
    internalId: null,
    mxGraphId: null,
    direction: null,
    sourcePortInternalId: null,
    targetPortInternalId: null,
    style: null,
}
export const connectionRecordFactory
    = makeTypedFactory<IConnection, IConnectionRecord>(defaultConnectionRecord);


export interface IPage {
    readonly internalId: string,
    readonly name: string,
    readonly agentsInternalIds: List<string>,
    // readonly connectionsInternalIds: List<string>,
}
export interface IPageRecord
    extends TypedRecord<IPageRecord>, IPage { };
const defaultPageRecord: IPage = {
    internalId: null,
    name: null,
    agentsInternalIds: List<string>([]),
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


export interface IHierarchyNode {
    readonly internalId: string,
    readonly name: string,
    readonly agent: string,
    readonly subNodesInternalIds: List<string>,
}
export interface IHierarchyNodeRecord
    extends TypedRecord<IHierarchyNodeRecord>, IHierarchyNode { };
const defaultHierarchyNodeRecord: IHierarchyNode = {
    internalId: null,
    name: null,
    agent: null,
    subNodesInternalIds: List<string>([]),
}
export const hierarchyNodeRecordFactory
    = makeTypedFactory<IHierarchyNode, IHierarchyNodeRecord>(defaultHierarchyNodeRecord);


// export interface IHierarchy {
//     readonly hierarchyNodes: List<IHierarchyNodeRecord>,
//     // readonly nodesNames: List<string>,
// }
// export interface IHierarchyRecord
//     extends TypedRecord<IHierarchyRecord>, IHierarchy { };
// const defaultHierarchyRecord: IHierarchy = {
//     hierarchyNodes: List<IHierarchyNodeRecord>([]),
//     // nodesNames: List<string>([]),
// }
// export const hierarchyRecordFactory
//     = makeTypedFactory<IHierarchy, IHierarchyRecord>(defaultHierarchyRecord);


export interface IAlvisProject {
    readonly hierarchyNodes: List<IHierarchyNodeRecord>,
    readonly pages: List<IPageRecord>,
    readonly agents: List<IAgentRecord>,
    readonly ports: List<IPortRecord>,
    readonly connections: List<IConnectionRecord>,
    readonly code: IAlvisCodeRecord,
}
export interface IAlvisProjectRecord
    extends TypedRecord<IAlvisProjectRecord>, IAlvisProject { };
const defaultAlvisProjectRecord: IAlvisProject = {
    hierarchyNodes: List<IHierarchyNodeRecord>([]),
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

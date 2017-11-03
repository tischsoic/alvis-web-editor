import { Record, List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface IPort {
    readonly id: string,
    readonly name: string,
    readonly x: number,
    readonly y: number,
    readonly color: string,
};
export interface IPortRecord
    extends TypedRecord<IPortRecord>, IPort { };
const defaultPortRecord = {
    id: null,
    name: null,
    x: null,
    y: null,
    color: null,
};
export const portRecordFactory
    = makeTypedFactory<IPort, IPortRecord>(defaultPortRecord);


export interface IAgent {
    readonly phantomId: string, // Only to know which agent is which in mxGraph
    readonly name: string,
    readonly portsIds: List<string>,
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
    phantomId: null,
    name: null,
    portsIds: List<string>([]),
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
    readonly phantomId: string, // Only to know which agent is which in mxGraph
    readonly direction: ConnectionDirection,
    readonly sourcePortId: string,
    readonly targetPortId: string,
    readonly style: string,
}
export interface IConnectionRecord
    extends TypedRecord<IConnectionRecord>, IConnection { };
const defaultConnectionRecord: IConnection = {
    phantomId: null,
    direction: null,
    sourcePortId: null,
    targetPortId: null,
    style: null,
}
export const connectionRecordFactory
    = makeTypedFactory<IConnection, IConnectionRecord>(defaultConnectionRecord);


export interface IPage {
    readonly name: string,
    readonly ports: List<IPortRecord>,
    readonly agents: List<IAgentRecord>,
    readonly connections: List<IConnectionRecord>,
}
export interface IPageRecord
    extends TypedRecord<IPageRecord>, IPage { };
const defaultPageRecord: IPage = {
    name: null,
    ports: List<IPortRecord>([]),
    agents: List<IAgentRecord>([]),
    connections: List<IConnectionRecord>([]),
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
    readonly name: string,
    readonly agent: string,
    readonly subNodesNames: List<string>,
}
export interface IHierarchyNodeRecord
    extends TypedRecord<IHierarchyNodeRecord>, IHierarchyNode { };
const defaultHierarchyNodeRecord: IHierarchyNode = {
    name: null,
    agent: null,
    subNodesNames: List<string>([]),
}
export const hierarchyNodeRecordFactory
    = makeTypedFactory<IHierarchyNode, IHierarchyNodeRecord>(defaultHierarchyNodeRecord);


export interface IHierarchy {
    readonly hierarchyNodes: List<IHierarchyNodeRecord>,
    // readonly nodesNames: List<string>,
}
export interface IHierarchyRecord
    extends TypedRecord<IHierarchyRecord>, IHierarchy { };
const defaultHierarchyRecord: IHierarchy = {
    hierarchyNodes: List<IHierarchyNodeRecord>([]),
    // nodesNames: List<string>([]),
}
export const hierarchyRecordFactory
    = makeTypedFactory<IHierarchy, IHierarchyRecord>(defaultHierarchyRecord);


export interface IAlvisProject {
    readonly hierarchy: IHierarchyRecord,
    readonly pages: List<IPageRecord>,
    readonly code: IAlvisCodeRecord,
}
export interface IAlvisProjectRecord
    extends TypedRecord<IAlvisProjectRecord>, IAlvisProject { };
const defaultAlvisProjectRecord: IAlvisProject = {
    hierarchy: null,
    pages: List<IPageRecord>([]),
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

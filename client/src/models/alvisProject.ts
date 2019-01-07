import { Record, List } from 'immutable';
import { IProjectModification } from './project';

export type IInternalId = string;

// TODO: rename internalId to just id. There is no need to call it internalId because mxGraph id is stored in AlvisGraph component
export interface IIdentifiableElement {
  internalId: IInternalId;
}
export type IInternalRecord = ReturnType<Record.Factory<IIdentifiableElement>>;

// TODO: it is a bit stupid to call one thing IAlvisPageElement and IAgent another
// better call it IPageElement!
// TODO: should we use some namespace Alvis for it, or module (I mean this file) is enough?
export type IAlvisPageElement = IAgent | IPort | IConnection;
export type IAlvisPageElementTag = 'agents' | 'ports' | 'connections';
export type IAlvisPageElementRecord =
  | IAgentRecord
  | IPortRecord
  | IConnectionRecord;

export type IAlvisElement = IPage | IAlvisPageElement;
export type IAlvisElementTag = 'pages' | IAlvisPageElementTag;
export type IAlvisElementRecord = IPageRecord | IAlvisPageElementRecord;

// TO DO: what about creating another interface with properties which can be modified? -> e.g. agentInternalId should not be changed in port modification.
export interface IPort extends IIdentifiableElement {
  agentInternalId: string;
  name: string;
  x: number;
  y: number;
  color: string;
  //  connectionsInternalIds: List<string>,
}
export type IPortRecord = ReturnType<Record.Factory<IPort>>;
const defaultPortRecord: IPort = {
  internalId: null, // TODO: change it to id
  agentInternalId: null,
  name: null,
  x: null,
  y: null,
  color: null,
  // connectionsInternalIds: List<string>(),
};
export const portRecordFactory = Record<IPort>(defaultPortRecord);

export interface IAgent extends IIdentifiableElement {
  internalId: string; // TODO: if it extends IInternalRecord it is not necessary to redefne internalId field here.
  pageInternalId: string; // TODO: change it to pageId
  subPageInternalId: string;
  name: string;
  portsInternalIds: List<string>; // TODO: change it to Set
  index: string;
  active: number; // TO DO: maybe boolean
  running: number; // TO DO: maybe boolean
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
}
export type IAgentRecord = ReturnType<Record.Factory<IAgent>>;
const defaultAgentRecord: IAgent = {
  internalId: null,
  pageInternalId: null,
  subPageInternalId: null,
  name: null,
  portsInternalIds: List<string>([]), // TODO: It should be Set - https://www.quora.com/When-should-I-use-Lists-vs-Sets-in-Java
  index: null,
  active: null, // TO DO: maybe boolean
  running: null, // TO DO: maybe boolean
  height: null,
  width: null,
  x: 0,
  y: 0,
  color: null,
};
export const agentRecordFactory = Record<IAgent>(defaultAgentRecord);

export type ConnectionDirection = 'target' | 'source' | 'none'; // TO DO: that is all?
export interface IConnection extends IIdentifiableElement {
  internalId: string; // TODO: should we remove ''? Record.Factory does not need this, but wouldnt it be good
  // to let it be in order to make this interface more practical?
  direction: ConnectionDirection;
  sourcePortInternalId: string;
  targetPortInternalId: string;
  style: string;
}
export type IConnectionRecord = ReturnType<Record.Factory<IConnection>>;
const defaultConnectionRecord: IConnection = {
  internalId: null,
  direction: null,
  sourcePortInternalId: null,
  targetPortInternalId: null,
  style: null,
};
export const connectionRecordFactory = Record<IConnection>(
  defaultConnectionRecord,
);

export interface IPage extends IIdentifiableElement {
  internalId: string;
  name: string;
  agentsInternalIds: List<string>;
  subPagesInternalIds: List<string>;
  supAgentInternalId: string; // For first page it is set to `null`
  //  connectionsInternalIds: List<string>,
}
export type IPageRecord = ReturnType<Record.Factory<IPage>>;
const defaultPageRecord: IPage = {
  internalId: null,
  name: null,
  agentsInternalIds: List<string>(),
  subPagesInternalIds: List<string>(),
  supAgentInternalId: null,
  // connectionsInternalIds: List<string>([]),
};
export const pageRecordFactory = Record<IPage>(defaultPageRecord);

export interface IAlvisCode {
  text: string;
}
export type IAlvisCodeRecord = ReturnType<Record.Factory<IAlvisCode>>;
const defaultAlvisCodeRecord: IAlvisCode = {
  text: '',
};
export const alvisCodeRecordFactory = Record<IAlvisCode>(
  defaultAlvisCodeRecord,
);

export interface IAlvisProject {
  pages: List<IPageRecord>;
  agents: List<IAgentRecord>;
  ports: List<IPortRecord>;
  connections: List<IConnectionRecord>;
  code: IAlvisCodeRecord;
}
export type IAlvisProjectRecord = ReturnType<Record.Factory<IAlvisProject>>;
const defaultAlvisProjectRecord: IAlvisProject = {
  pages: List<IPageRecord>([]), // TODO: it should be Map or Set - map would be great when it comes to getting element by id
  agents: List<IAgentRecord>([]),
  ports: List<IPortRecord>([]),
  connections: List<IConnectionRecord>([]),
  code: null, // TODO: removing `code` from this record might simplify code
};
export const alvisProjectRecordFactory = Record<IAlvisProject>(
  defaultAlvisProjectRecord,
);

// https://spin.atomicobject.com/2016/11/30/immutable-js-records-in-typescript/
// export class PortRecord extends Record({}) {

//     constructor(params: Port) {
//         params ? super(params) : super();
//     }

//     with(values: Port) {
//         return this.merge(values) as this;
//     }
// }

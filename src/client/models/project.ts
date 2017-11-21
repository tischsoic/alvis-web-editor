import { Record, List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';
import {
    IAlvisProjectRecord
} from './alvisProject';

export interface IProject {
    readonly xml: string | null,
    readonly alvisProject: IAlvisProjectRecord | null,
    readonly lastInternalId: number,
};
export interface IProjectRecord
    extends TypedRecord<IProjectRecord>, IProject { };
const defaultPortRecord = {
    xml: null,
    alvisProject: null,
    lastInternalId: -1,
};
export const projectRecordFactory
    = makeTypedFactory<IProject, IProjectRecord>(defaultPortRecord);
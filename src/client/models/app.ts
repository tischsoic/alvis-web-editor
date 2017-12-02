import { Record, List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

export interface IApp {
    readonly appOpened: boolean,
    readonly duringSigningIn: boolean,
    readonly duringRegistration: boolean,
    readonly bearerToken: string | null,
};

export interface IAppRecord
    extends TypedRecord<IAppRecord>, IApp { };

const defaultAppRecord = {
    appOpened: false,
    duringSigningIn: false,
    duringRegistration: false,
    bearerToken: null,
};

export const appRecordFactory
    = makeTypedFactory<IApp, IAppRecord>(defaultAppRecord);

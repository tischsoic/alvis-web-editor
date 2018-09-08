import { Record, List } from 'immutable';
import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';
import {
  IAlvisProjectRecord,
  IAlvisElement,
  IInternalRecord,
  IConnection,
  IPort,
  IAgent,
  IPage,
  IPageRecord,
  IAgentRecord,
  IPortRecord,
  IConnectionRecord,
} from './alvisProject';

export interface IProject {
  readonly xml: string | null;
  readonly alvisProject: IAlvisProjectRecord | null;
  readonly lastInternalId: number;
  readonly oppositeModifications: List<IOppositeModificationsRecord>;
  readonly oppositeModificationCurrentIdx: number | null;
}

export interface IProjectRecord extends TypedRecord<IProjectRecord>, IProject {}

const defaultPorjectRecord = {
  xml: null,
  alvisProject: null,
  lastInternalId: -1,
  oppositeModifications: List<IOppositeModificationsRecord>(),
  oppositeModificationCurrentIdx: -1, // TODO: do we want -1, maybe 0/null would be better?
};

export const projectRecordFactory = makeTypedFactory<IProject, IProjectRecord>(
  defaultPorjectRecord,
);

type PartialPartial<T> = { [P in keyof T]?: Partial<T[P]> };

export interface IProjectElementModification<Element> {
  readonly added: List<Element>;
  readonly modified: List<Element>;
  readonly deleted: List<string>;
}

export interface IProjectElementModificationRecord<Element>
  extends TypedRecord<IProjectElementModificationRecord<Element>>,
    IProjectElementModification<Element> {}

export const projectElementModificationFactory = function<Element>() {
  const defaultProjectElemetModificationRecord = {
    added: List<Element>(),
    modified: List<Element>(),
    deleted: List<string>(),
  };

  return makeTypedFactory<
    IProjectElementModification<Element>,
    IProjectElementModificationRecord<Element>
  >(defaultProjectElemetModificationRecord);
};

export interface IProjectModification {
  pages: IProjectElementModificationRecord<IPageRecord>;
  agents: IProjectElementModificationRecord<IAgentRecord>;
  ports: IProjectElementModificationRecord<IPortRecord>;
  connections: IProjectElementModificationRecord<IConnectionRecord>;
}

export interface IProjectModificationRecord
  extends TypedRecord<IProjectModificationRecord>,
    Readonly<IProjectModification> {}

const defaultProjectModificationRecord = {
  pages: projectElementModificationFactory<IPageRecord>()(),
  agents: projectElementModificationFactory<IAgentRecord>()(),
  ports: projectElementModificationFactory<IPortRecord>()(),
  connections: projectElementModificationFactory<IConnectionRecord>()(),
};

export const projectModificationRecordFactory = makeTypedFactory<
  Readonly<IProjectModification>,
  IProjectModificationRecord
>(defaultProjectModificationRecord);

export const projectModificationRecordFactoryPartial = (
  data: PartialPartial<IProjectModification>,
): IProjectModificationRecord => {
  const defaultRecord = projectModificationRecordFactory();

  let modifiedRecord = defaultRecord;
  // TODO: after upgrade of Immutable.JS to v4 change code so that it won't use this helper function for of should suffice
  const iterate = function*<T>(iterator: Iterator<T>) {
    let next = iterator.next();
    while (!next.done) {
      yield next.value;
      next = iterator.next();
    }
  };

  for (const elementKey of iterate(defaultRecord.keys())) {
    let elementSubrecord: IProjectElementModificationRecord<any> =
      modifiedRecord[elementKey];
    const dataSubrecord = data[elementKey];

    if (dataSubrecord == null) {
      continue;
    }

    for (const key of iterate(elementSubrecord.keys())) {
      const value =
        dataSubrecord[key] != null ? dataSubrecord[key] : elementSubrecord[key];
      elementSubrecord = elementSubrecord.set(key, value);
    }

    modifiedRecord = modifiedRecord.set(elementKey, elementSubrecord);
  }

  return modifiedRecord;
};

export interface IOppositeModifications {
  readonly modification: IProjectModificationRecord;
  readonly antiModification: IProjectModificationRecord;
}

export interface IOppositeModificationsRecord
  extends TypedRecord<IOppositeModificationsRecord>,
    IOppositeModifications {}

const defaultOppositeModificationsRecord: IOppositeModifications = {
  modification: projectModificationRecordFactoryPartial({}),
  antiModification: projectModificationRecordFactoryPartial({}),
};

export const oppositeModificationsFactory = makeTypedFactory<
  IOppositeModifications,
  IOppositeModificationsRecord
>(defaultOppositeModificationsRecord);

import { Record, List } from 'immutable';
import {
  IAlvisProjectRecord,
  IAlvisElement,
  IIdentifiableElement,
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
  xml: string | null;
  alvisProject: IAlvisProjectRecord | null;
  oppositeModifications: List<IOppositeModificationsRecord>;
  oppositeModificationCurrentIdx: number | null;
  copyModification: IProjectModificationRecord | null;
}
export type IProjectRecord = ReturnType<Record.Factory<IProject>>;
const defaultProjectRecord = {
  xml: null,
  alvisProject: null,
  oppositeModifications: List<IOppositeModificationsRecord>(),
  oppositeModificationCurrentIdx: -1, // TODO: do we want -1, maybe 0/null would be better?
  copyModification: null,
};
export const projectRecordFactory = Record<IProject>(defaultProjectRecord);

export type PartialPartial<T> = { [P in keyof T]?: Partial<T[P]> };

export interface IProjectElementModification<Element> {
  added: List<Element>;
  modified: List<Element>;
  deleted: List<string>;
}
export type IProjectElementModificationRecord<Element> = ReturnType<
  Record.Factory<IProjectElementModification<Element>>
>;
// TODO: should it take as input object Partial<IProjectElementModificationRecord> ?
// do we need this?
// TODO: name is misleading, in fact it is FactoryOfFactory
// this is why we need: `()()` in `pages: projectElementModificationFactory<IPageRecord>()(),`
export const projectElementModificationFactory = function<Element>() {
  const defaultProjectElementModificationRecord = {
    added: List<Element>(),
    modified: List<Element>(),
    deleted: List<string>(),
  };

  return Record<IProjectElementModification<Element>>(
    defaultProjectElementModificationRecord,
  );
};

export interface IProjectModification {
  pages: IProjectElementModificationRecord<IPageRecord>;
  agents: IProjectElementModificationRecord<IAgentRecord>;
  ports: IProjectElementModificationRecord<IPortRecord>;
  connections: IProjectElementModificationRecord<IConnectionRecord>;
}
export type IProjectModificationRecord = ReturnType<
  Record.Factory<IProjectModification>
>;
const defaultProjectModificationRecord = {
  pages: projectElementModificationFactory<IPageRecord>()(),
  agents: projectElementModificationFactory<IAgentRecord>()(),
  ports: projectElementModificationFactory<IPortRecord>()(),
  connections: projectElementModificationFactory<IConnectionRecord>()(),
};
export const projectModificationRecordFactory = Record<IProjectModification>(
  defaultProjectModificationRecord,
);
export const projectModificationRecordFactoryPartial = (
  data: PartialPartial<IProjectModification>,
): IProjectModificationRecord => {
  const defaultRecord = projectModificationRecordFactory();

  let modifiedRecord = defaultRecord;

  // TODO: simplify logic:
  for (const [elementKey, element] of defaultRecord) {
    let elementSubrecord: IProjectElementModificationRecord<any> =
      modifiedRecord[elementKey];
    const dataSubrecord = data[elementKey];

    if (dataSubrecord == null) {
      continue;
    }

    for (const [key, value] of elementSubrecord) {
      const value =
        dataSubrecord[key] != null ? dataSubrecord[key] : elementSubrecord[key];
      elementSubrecord = elementSubrecord.set(key, value);
    }

    modifiedRecord = modifiedRecord.set(elementKey, elementSubrecord);
  }

  return modifiedRecord;
};

export interface IOppositeModifications {
  modification: IProjectModificationRecord;
  antiModification: IProjectModificationRecord;
}
export type IOppositeModificationsRecord = ReturnType<
  Record.Factory<IOppositeModifications>
>;
const defaultOppositeModificationsRecord: IOppositeModifications = {
  modification: projectModificationRecordFactoryPartial({}),
  antiModification: projectModificationRecordFactoryPartial({}),
};
export const oppositeModificationsFactory = Record(
  defaultOppositeModificationsRecord,
);

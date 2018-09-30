import {
  IProjectModificationRecord,
  projectModificationRecordFactoryPartial,
} from '../../models/project';

export function sortProjectModification(
  semiModification: IProjectModificationRecord,
): IProjectModificationRecord {
  return projectModificationRecordFactoryPartial({
    pages: {
      added: semiModification.pages.added.sort(),
      modified: semiModification.pages.modified.sort(),
      deleted: semiModification.pages.deleted.sort(),
    },
    agents: {
      added: semiModification.agents.added.sort(),
      modified: semiModification.agents.modified.sort(),
      deleted: semiModification.agents.deleted.sort(),
    },
    ports: {
      added: semiModification.ports.added.sort(),
      modified: semiModification.ports.modified.sort(),
      deleted: semiModification.ports.deleted.sort(),
    },
    connections: {
      added: semiModification.connections.added.sort(),
      modified: semiModification.connections.modified.sort(),
      deleted: semiModification.connections.deleted.sort(),
    },
  });
}

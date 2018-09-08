import {
  IProjectModificationRecord,
  projectModificationRecordFactoryPartial,
} from '../../models/project';

export function sortProjectModification(
  semiModification: IProjectModificationRecord,
): IProjectModificationRecord {
  return projectModificationRecordFactoryPartial({
    pages: {
      added: semiModification.pages.added.sort().toList(),
      modified: semiModification.pages.modified.sort().toList(),
      deleted: semiModification.pages.deleted.sort().toList(),
    },
    agents: {
      added: semiModification.agents.added.sort().toList(),
      modified: semiModification.agents.modified.sort().toList(),
      deleted: semiModification.agents.deleted.sort().toList(),
    },
    ports: {
      added: semiModification.ports.added.sort().toList(),
      modified: semiModification.ports.modified.sort().toList(),
      deleted: semiModification.ports.deleted.sort().toList(),
    },
    connections: {
      added: semiModification.connections.added.sort().toList(),
      modified: semiModification.connections.modified.sort().toList(),
      deleted: semiModification.connections.deleted.sort().toList(),
    },
  });
}

import mxgraph = require('mxgraph');
import * as mxClasses from 'mxgraphAllClasses';
import { AlvisGraph } from '../components/AlvisGraph';
import { ConnectionDirection } from '../models/alvisProject';
import { List } from 'immutable';
import { projectModificationRecordFactoryPartial } from '../models/project';

export function addPopupMenu(
  mx: mxgraph.allClasses,
  graph: mxClasses.mxGraph,
  alvisGraph: AlvisGraph,
) {
  // Disables built-in context menu
  (mx as any).mxEvent.disableContextMenu(document.body);

  // Configures automatic expand on mouseover
  graph.popupMenuHandler.autoExpand = true;

  // Installs context menu
  graph.popupMenuHandler.factoryMethod = function(
    menu,
    cell,
    evt: PointerEvent,
  ) {
    const { onProjectModify, agents } = alvisGraph.props;

    if (cell == null) {
      const addAgent = (active: boolean) => {
        const agent = alvisGraph.createAgent({
          x: evt.offsetX,
          y: evt.offsetY,
          name: 'Agent_' + agents.size,
          active: active ? 1 : 0,
          color: 'white',
        });

        onProjectModify({
          agents: { added: List([agent]) },
        });
      };
      menu.addItem('Add active agent.', null, () => addAgent(true));
      menu.addItem('Add passive agent.', null, () => addAgent(false));
      return;
    }

    if (cell.isEdge()) {
      const modifyConnection = (direction: ConnectionDirection) => {
        const modifiedConnection = alvisGraph.createConnection({
          direction,
          internalId: cell.getId(),
        });

        onProjectModify({
          connections: { modified: List([modifiedConnection]) },
        });
      };
      menu.addItem('Direct to source', null, () => {
        modifyConnection('source');
      });
      menu.addItem('Direct to target', null, () => {
        modifyConnection('target');
      });
      menu.addItem('Undirect', null, () => {
        modifyConnection('none');
      });
      return;
    }

    if (graph.isPort(cell)) {
      const portId = cell.getId();

      menu.addItem('Delete', null, () => {
        onProjectModify({
          ports: { deleted: List([portId]) },
        });
      });
      // menu.addItem('Edit', null, () => { });
      // menu.addItem('Color', null, () => { });
      return;
    }

    menu.addItem('Add port', null, () => {
      const { ports } = alvisGraph.props;
      const portsCount = ports.size;
      const portName = 'port_' + portsCount;

      graph.getModel().beginUpdate();
      try {
        const portVertex = graph.insertVertex(
          cell,
          null,
          portName,
          1,
          1,
          20,
          20,
          'PORT_STYLE',
          true,
        );
        portVertex.geometry.offset = new mx.mxPoint(-10, -10);
      } finally {
        graph.getModel().endUpdate();
      }
    });

    const agentId = cell.getId();
    const agent = alvisGraph.props.agents.get(agentId); // TODO: reading from props here is not a good idea - refactor later
    const agentHasSubpage = !!agent.subPageInternalId;

    if (agentHasSubpage) {
      const { onHierarchyRemove } = alvisGraph.props;

      menu.addItem('Remove hierarchy', null, () => {
        onHierarchyRemove(agentId);
      });
    } else {
      menu.addItem('Add page', null, () => {
        const { getNameFromUser } = alvisGraph.props;
        const agentInternalId = cell.getId();

        getNameFromUser((chosenName: string) => {
          if (chosenName === null) {
            return;
          }

          const page = alvisGraph.createPage(chosenName, agentInternalId);

          onProjectModify({
            pages: { added: List([page]) },
          });
        });
      });
    }

    const alignSubmenu = menu.addItem('Align', null, null);
    const getAlignFn = (align: string): (() => void) => {
      return () => {
        graph.alignCells(align, graph.getSelectionCells());
      };
    };
    menu.addItem(
      'Top',
      null,
      getAlignFn(mx.mxConstants.ALIGN_TOP),
      alignSubmenu,
    );
    menu.addItem(
      'Bottom',
      null,
      getAlignFn(mx.mxConstants.ALIGN_BOTTOM),
      alignSubmenu,
    );
    menu.addItem(
      'Left',
      null,
      getAlignFn(mx.mxConstants.ALIGN_LEFT),
      alignSubmenu,
    );
    menu.addItem(
      'Right',
      null,
      getAlignFn(mx.mxConstants.ALIGN_RIGHT),
      alignSubmenu,
    );
    menu.addItem(
      'Center',
      null,
      getAlignFn(mx.mxConstants.ALIGN_MIDDLE),
      alignSubmenu,
    );
    menu.addItem(
      'Middle',
      null,
      getAlignFn(mx.mxConstants.ALIGN_CENTER),
      alignSubmenu,
    );
  };
}

// import mxgraph = require('mxgraph');
import * as mxClasses from 'mxgraphAllClasses';
import { mx } from '../utils/mx';

// import { AlvisGraph } from '../components/AlvisGraph';
// import { ConnectionDirection } from '../models/alvisProject';
// import { List } from 'immutable';

export const createPopupMenu = ({
  addAgent,
  handleElementsAlign,
  onGetGraphImage,
  handleConnectionModify,
  handleConnectionDelete,
  handlePortModify,
  handlePortDelete,
  handlePageAdd,
  handlePortAdd,
  handleAgentModify,
  handleHierarchyRemove,
  handleAgentDelete,
  getSelectedColor,
}) => (
  menu: mxClasses.mxPopupMenuHandler,
  cell: mxClasses.mxCell,
  evt: PointerEvent,
) => {
  const nothingSelected = cell === null;

  if (nothingSelected) {
    menu.addItem(
      'Add active agent',
      null,
      addAgent({
        active: 1,
        x: evt.offsetX,
        y: evt.offsetY,
      }),
    );
    menu.addItem(
      'Add passive agent',
      null,
      addAgent({
        active: 0,
        x: evt.offsetX,
        y: evt.offsetY,
      }),
    );
    menu.addItem('Download as image', null, onGetGraphImage);

    return;
  }

  const selectedCells = menu.graph.getSelectionCells();
  const manyCellsSelected = selectedCells && selectedCells.length > 1;

  if (manyCellsSelected) {
    const {
      ALIGN_LEFT,
      ALIGN_CENTER,
      ALIGN_RIGHT,
      ALIGN_BOTTOM,
      ALIGN_MIDDLE,
      ALIGN_TOP,
    } = mx.mxConstants;
    const alignSubmenu = menu.addItem('Align', null, null);

    menu.addItem('Left', null, handleElementsAlign(ALIGN_LEFT), alignSubmenu);
    menu.addItem(
      'Center',
      null,
      handleElementsAlign(ALIGN_CENTER),
      alignSubmenu,
    );
    menu.addItem('Right', null, handleElementsAlign(ALIGN_RIGHT), alignSubmenu);

    menu.addItem(
      'Bottom',
      null,
      handleElementsAlign(ALIGN_BOTTOM),
      alignSubmenu,
    );
    menu.addItem(
      'Middle',
      null,
      handleElementsAlign(ALIGN_MIDDLE),
      alignSubmenu,
    );
    menu.addItem('Top', null, handleElementsAlign(ALIGN_TOP), alignSubmenu);

    return;
  }

  const cellId = cell.getId();

  if (cell.isEdge()) {
    menu.addItem(
      'Direct to source',
      null,
      handleConnectionModify(cellId)({
        direction: 'source',
      }),
    );
    menu.addItem(
      'Undirect',
      null,
      handleConnectionModify(cellId)({
        direction: 'none',
      }),
    );
    menu.addItem(
      'Direct to target',
      null,
      handleConnectionModify(cellId)({
        direction: 'target',
      }),
    );
    menu.addItem(
      'Straight style',
      null,
      handleConnectionModify(cellId)({
        style: 'straight',
      }),
    );
    menu.addItem(
      'Relational style',
      null,
      handleConnectionModify(cellId)({
        style: 'relational',
      }),
    );
    menu.addItem('Delete', null, handleConnectionDelete(cellId));

    return;
  }

  if (menu.graph.isPort(cell)) {
    menu.addItem(
      'Color',
      null,
      handlePortModify(cellId)({ color: getSelectedColor() }),
    );
    menu.addItem('Delete', null, handlePortDelete(cellId));
    // menu.addItem('Edit', null, () => { });

    return;
  }

  // it must be an agent - everything else checked
  menu.addItem('Add page', null, handlePageAdd(cellId));
  menu.addItem('Add port', null, handlePortAdd(cellId));
  menu.addItem(
    'Start in Initial State',
    null,
    handleAgentModify(cellId)({
      running: 0,
    }),
  );
  menu.addItem(
    'Start in Running State',
    null,
    handleAgentModify(cellId)({
      running: 1,
    }),
  );
  menu.addItem('Remove hierarchy', null, handleHierarchyRemove(cellId));
  menu.addItem(
    'Color',
    null,
    handleAgentModify(cellId)({ color: getSelectedColor() }),
  );
  menu.addItem('Delete', null, handleAgentDelete(cellId));
};

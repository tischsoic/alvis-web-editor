import mxgraph = require('mxgraph');
import * as mxClasses from "mxgraphAllClasses";

export default function modifyMxGraph(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    addPopupMenu(mx, graph);
}

function addPopupMenu(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    // Disables built-in context menu
    mx.mxEvent.disableContextMenu(document.body);

    // Configures automatic expand on mouseover
    graph.popupMenuHandler.autoExpand = true;

    // Installs context menu
    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
        console.log(cell);

        if (cell == null) {
            menu.addItem('Add active agent.', null, function () { });
            menu.addItem('Add passive agent.', null, function () { });
            return;
        }

        if (cell.isEdge()) {
            menu.addItem('Direct to source', null, () => { });
            menu.addItem('Ditect to target', null, () => { });
            menu.addItem('Undirect', null, () => { });
            return;
        }

        if (graph.isPort(cell)) {
            menu.addItem('Delete', null, () => { });
            menu.addItem('Edit', null, () => { });
            menu.addItem('Color', null, () => { });
            return;
        }

        menu.addItem('Add port', null, () => { });
        menu.addItem('Change to passive/active agent', null, () => { });
        menu.addSeparator();
        menu.addItem('Delete', null, () => { });
        menu.addItem('Edit', null, () => { });
        menu.addItem('Color', null, () => { });


        // var submenu1 = menu.addItem('Submenu 1', null, null);

        // menu.addItem('Subitem 1', null, function () {
        //     alert('Subitem 1');
        // }, submenu1);
        // menu.addItem('Subitem 1', null, function () {
        //     alert('Subitem 2');
        // }, submenu1);
    };
}
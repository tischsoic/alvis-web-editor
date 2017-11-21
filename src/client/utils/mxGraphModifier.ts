import mxgraph = require('mxgraph');
import * as mxClasses from "mxgraphAllClasses";
import { AlvisGraph } from '../components/AlvisGraph';

export function modifyMx(mx: mxgraph.allClasses) {
}

export default function modifyMxGraph(mx: mxgraph.allClasses, graph: mxClasses.mxGraph, alvisGraph: AlvisGraph,
    onProcessChange: (change: any, callback: (change: any) => any) => any) {
    manageProcessChangeFn(mx, graph, onProcessChange);
    addPortValidation(mx, graph);
    addCellStyles(mx, graph);
    removeFoldingIcon(mx, graph);
    preparePortsSettings(mx, graph);
    makePortsTerminalsForConnections(mx, graph);
    disableDirectConnectingAgents(mx, graph);
    enableRubberbandSelection(mx, graph);
    enableDelete(mx, graph);
    addPopupMenu(mx, graph, alvisGraph);
    enablePanning(mx, graph);
}

function enablePanning(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    graph.setPanning(true);
    graph.centerZoom = false;
    graph.panningHandler.useLeftButtonForPanning = true;
}

// function injectCustomModel(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {


//     mx.mxGraphModel

// }

function manageProcessChangeFn(mx: mxgraph.allClasses, graph: mxClasses.mxGraph,
    onProcessChange: (change: any, callback: (change: any) => any) => any) {

    const oldProcessChange = graph.processChange;
    graph.processChange = function (change) {
        const args = arguments;
        const me = this;
        onProcessChange(change, (change) => {
            oldProcessChange.apply(this, args);
        });
    }
}

function addPortValidation(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    class PortsConnectionsMultiplicity extends mx.mxMultiplicity {
        constructor(source: boolean) {
            super(source, null);
        }

        check(graph: mxClasses.mxGraph, edge: mxClasses.mxCell, source: mxClasses.mxCell, target: mxClasses.mxCell, sourceOut: number, targetIn: number): string | null {
            if (source.getParent() === target.getParent()) {
                return 'You cannot connect ports which belong to the same agent!';
            }

            let edgesBetweenParents = graph.getEdgesBetween(source.getParent(), target.getParent(), false);

            for (let edgeBetweenParents of edgesBetweenParents) {
                if (this.edgeIsBetweenTwoPorts(graph, edgeBetweenParents, source, target)) {
                    return 'You cannot connect two ports twice!';
                }
            }

            return null;
        }

        private edgeIsBetweenTwoPorts(graph: mxClasses.mxGraph, edge: mxClasses.mxCell, source: mxClasses.mxCell, target: mxClasses.mxCell): boolean {
            if (!graph.isPort(source) || !graph.isPort(target) || edge == null) {
                return false;
            }

            let sourceId = source.getId(),
                targetId = target.getId(),
                edgeStyle = graph.getCellStyle(edge),
                edgeSourcePortId = edgeStyle[mx.mxConstants.STYLE_SOURCE_PORT],
                edgeTargetPortId = edgeStyle[mx.mxConstants.STYLE_TARGET_PORT];

            return (sourceId == edgeSourcePortId && targetId == edgeTargetPortId)
                || (targetId == edgeSourcePortId && sourceId == edgeTargetPortId);
        }

        checkNeighbors(graph: mxClasses.mxGraph, edge: mxClasses.mxCell, source: mxClasses.mxCell, target: mxClasses.mxCell): boolean {
            console.log(arguments);
            // TO DO: Check what should be returned.
            return false;
        }

        checkTerminal(graph: mxClasses.mxGraph, terminal: mxClasses.mxCell, edge: mxClasses.mxCell): boolean {
            console.log(arguments);
            // TO DO: Check what should be returned.
            return false;
        }

        checkType(graph: mxClasses.mxGraph, value, type, attr, attrValue): boolean {
            console.log(arguments);
            // TO DO: Check what should be returned.
            return false;
        }
    }

    graph.multiplicities.push(new PortsConnectionsMultiplicity(true));
    graph.setAllowDanglingEdges(false);
    graph.setMultigraph(false);
}

function addCellStyles(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    const activeAgentStyle = new Object();
    activeAgentStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RECTANGLE;
    activeAgentStyle[mx.mxConstants.STYLE_FILLCOLOR] = 'white';
    activeAgentStyle[mx.mxConstants.STYLE_STROKECOLOR] = 'black';
    activeAgentStyle[mx.mxConstants.STYLE_FONTCOLOR] = 'black';
    activeAgentStyle[mx.mxConstants.STYLE_ROUNDED] = '1'
    graph.getStylesheet().putCellStyle('ACTIVE_AGENT', activeAgentStyle);

    const passiveAgentStyle = new Object();
    passiveAgentStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RECTANGLE;
    passiveAgentStyle[mx.mxConstants.STYLE_FILLCOLOR] = 'white';
    passiveAgentStyle[mx.mxConstants.STYLE_STROKECOLOR] = 'black';
    passiveAgentStyle[mx.mxConstants.STYLE_FONTCOLOR] = 'black';
    passiveAgentStyle[mx.mxConstants.STYLE_ROUNDED] = '0'
    graph.getStylesheet().putCellStyle('PASSIVE_AGENT', passiveAgentStyle);

    const portStyle = new Object();
    portStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_ELLIPSE;
    portStyle[mx.mxConstants.STYLE_FILLCOLOR] = 'white';
    portStyle[mx.mxConstants.STYLE_STROKECOLOR] = 'black';
    portStyle[mx.mxConstants.STYLE_FONTCOLOR] = 'black';
    portStyle[mx.mxConstants.STYLE_ROUNDED] = '1'
    portStyle[mx.mxConstants.STYLE_RESIZABLE] = '0'
    portStyle[mx.mxConstants.STYLE_LABEL_POSITION] = 'left'
    portStyle[mx.mxConstants.STYLE_ALIGN] = 'right'
    graph.getStylesheet().putCellStyle('PORT_STYLE', portStyle);

    const runningStyle = new Object();
    runningStyle[mx.mxConstants.STYLE_FONTSTYLE] = mx.mxConstants.FONT_UNDERLINE;
    graph.getStylesheet().putCellStyle('RUNNING', runningStyle);
}

function removeFoldingIcon(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    graph.isCellFoldable = function (cell, collapse) {
        var childCount = this.model.getChildCount(cell);

        for (var i = 0; i < childCount; i++) {
            var child = this.model.getChildAt(cell, i);
            var geo = this.getCellGeometry(child);

            if (geo != null && geo.relative) {
                return false;
            }
        }

        return childCount > 0;
    };
}

function preparePortsSettings(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    // Returns the relative position of the given child
    function getRelativePosition(state, dx, dy) {
        if (state != null) {
            var model = graph.getModel();
            var geo = model.getGeometry(state.cell);

            if (geo != null && geo.relative && !model.isEdge(state.cell)) {
                var parent = model.getParent(state.cell);

                if (model.isVertex(parent)) {
                    var pstate = graph.view.getState(parent);

                    if (pstate != null) {
                        var scale = graph.view.scale;
                        var x = state.x + dx;
                        var y = state.y + dy;

                        if (geo.offset != null) {
                            x -= geo.offset.x * scale;
                            y -= geo.offset.y * scale;
                        }

                        x = (x - pstate.x) / pstate.width;
                        y = (y - pstate.y) / pstate.height;

                        if (Math.abs(y - 0.5) <= Math.abs((x - 0.5) / 2)) {
                            x = (x > 0.5) ? 1 : 0;
                            y = Math.min(1, Math.max(0, y));
                        }
                        else {
                            x = Math.min(1, Math.max(0, x));
                            y = (y > 0.5) ? 1 : 0;
                        }

                        return new mx.mxPoint(x, y);
                    }
                }
            }
        }

        return null;
    };

    // Replaces translation for relative children
    graph.translateCell = function (cell, dx, dy) {
        var rel = getRelativePosition(this.view.getState(cell), dx * graph.view.scale, dy * graph.view.scale);

        if (rel != null) {
            var geo = this.model.getGeometry(cell);

            if (geo != null && geo.relative) {
                geo = geo.clone();
                geo.x = rel.x;
                geo.y = rel.y;

                this.model.setGeometry(cell, geo);
            }
        }
        else {
            mx.mxGraph.prototype.translateCell.apply(this, arguments);
        }
    };

    // Replaces move preview for relative children
    graph.graphHandler.getDelta = function (me) {
        var point = mx.mxUtils.convertPoint(this.graph.container, me.getX(), me.getY());
        var delta = new mx.mxPoint(point.x - this.first.x, point.y - this.first.y);

        if (this.cells != null && this.cells.length > 0 && this.cells[0] != null) {
            var state = this.graph.view.getState(this.cells[0]);
            var rel = getRelativePosition(state, delta.x, delta.y);

            if (rel != null) {
                var pstate = this.graph.view.getState(this.graph.model.getParent(state.cell));

                if (pstate != null) {
                    delta = new mx.mxPoint(pstate.x + pstate.width * rel.x - state.getCenterX(),
                        pstate.y + pstate.height * rel.y - state.getCenterY());
                }
            }
        }

        return delta;
    };

    // Relative children cannot be removed from parent
    graph.graphHandler.shouldRemoveCellsFromParent = function (parent, cells, evt) {
        return cells.length == 0 && !cells[0].geometry.relative && (mx.mxGraphHandler as any).prototype.shouldRemoveCellsFromParent.apply(this, arguments);
    };

    // Enables moving of relative children (ports)
    graph.isCellLocked = function (cell) {
        return false;
    };

    // After port was changed, parent will be invalidated 
    // so it will be rerendered with its edges (which should change their positions after port position was changed)
    const oldProcessChange = graph.processChange;
    graph.processChange = function (change) {
        oldProcessChange.apply(this, arguments);

        let changeConstructorName = change.constructor.name;
        if (changeConstructorName === "mxTerminalChange" || changeConstructorName === "mxGeometryChange") {
            // Checks if the geometry has changed to avoid unnessecary revalidation
            if (changeConstructorName === "mxTerminalChange" || ((change.previous == null && change.geometry != null) ||
                (change.previous != null && !change.previous.equals(change.geometry)))) {
                if (graph.isPort(change.cell)) {
                    this.view.invalidate(change.cell.getParent())
                }
            }
        }
    }
}

function makePortsTerminalsForConnections(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    // Ports are not used as terminals for edges, they are
    // only used to compute the graphical connection point
    graph.isPort = function (cell) {
        const geo = this.getCellGeometry(cell),
            isEdge = graph.getModel().isEdge(cell);

        return (geo != null) ? geo.relative && !isEdge : false;
    };
}

function disableDirectConnectingAgents(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    graph.setConnectable(true);
}

function enableRubberbandSelection(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    new mx.mxRubberband(graph);
}

function enableDelete(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    const keyHandler = new mx.mxKeyHandler(graph);
    keyHandler.bindKey(46, function (evt) {
        if (graph.isEnabled()) {
            graph.removeCells();
        }
    });
}

function addPopupMenu(mx: mxgraph.allClasses, graph: mxClasses.mxGraph, alvisGraph: AlvisGraph) {
    // Disables built-in context menu
    mx.mxEvent.disableContextMenu(document.body);

    // Configures automatic expand on mouseover
    graph.popupMenuHandler.autoExpand = true;

    // Installs context menu
    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt: PointerEvent) {
        console.log(cell);

        if (cell == null) {
            const addAgent = (active: boolean) => {
                const { onMxGraphAgentAdded, agents } = alvisGraph.props;

                onMxGraphAgentAdded(alvisGraph.createAgent({
                    x: evt.offsetX, y: evt.offsetY,
                    name: 'Agent_' + agents.size,
                    active: active ? 1 : 0, color: 'white'
                }));
            };
            menu.addItem('Add active agent.', null, () => addAgent(true));
            menu.addItem('Add passive agent.', null, () => addAgent(false));
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

        menu.addItem('Add port', null, () => {
            graph.getModel().beginUpdate();
            try {
                var portVertex = graph.insertVertex(cell, null, '', 1, 1, 20, 20, 'PORT_STYLE', true);
                portVertex.geometry.offset = new mx.mxPoint(-10, -10);
            }
            finally {
                graph.getModel().endUpdate();
            }
        });
        menu.addItem('aligh top', null, () => { });
        const alignSubmenu = menu.addItem('Align', null, null);
        const getAlignFn = (align: string): () => void => {
            return () => {
                graph.alignCells(align, graph.getSelectionCells())
            };
        }
        menu.addItem('Top', null, getAlignFn(mx.mxConstants.ALIGN_TOP), alignSubmenu);
        menu.addItem('Bottom', null, getAlignFn(mx.mxConstants.ALIGN_BOTTOM), alignSubmenu);
        menu.addItem('Left', null, getAlignFn(mx.mxConstants.ALIGN_LEFT), alignSubmenu);
        menu.addItem('Right', null, getAlignFn(mx.mxConstants.ALIGN_RIGHT), alignSubmenu);
        menu.addItem('Center', null, getAlignFn(mx.mxConstants.ALIGN_MIDDLE), alignSubmenu);
        menu.addItem('Middle', null, getAlignFn(mx.mxConstants.ALIGN_CENTER), alignSubmenu);

    };
}




//--------------------------------------------






export function modifyMxGraph2(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
    addPopupMenu2(mx, graph);
}


function addPopupMenu2(mx: mxgraph.allClasses, graph: mxClasses.mxGraph) {
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
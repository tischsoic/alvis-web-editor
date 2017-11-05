import * as React from 'react';
// import * as mxGraph from 'mxgraph';
import mxgraph = require('mxgraph');
// import {default as mx, mxCell} from 'mxgraph';

import * as mxClasses from "mxgraphAllClasses";

import parseAlvisProjectXML from '../../utils/alvisXmlParser';
import AlvisGraphManager from '../../utils/AlvisGraphManager';
import {modifyMxGraph2} from '../../utils/mxGraphModifier';
// TO DO
// should not be "=> any", probably
export interface GraphDisplayProps {
    xml: string
};
export interface GraphDisplayState { };

export class GraphDisplay extends React.Component<GraphDisplayProps, GraphDisplayState> {
    constructor(props: GraphDisplayProps) {
        super(props);
    }

    componentDidMount() {
        this.createAlvisGraphFromXML();
    }

    componentDidUpdate() {
        this.createAlvisGraphFromXML();
    }

    shouldComponentUpdate() {
        return false;
        // return true;
    }

    createAlvisGraphFromXML() {
        const { xml } = this.props;
        if (!xml) {
            return;
        }
        const mx = mxgraph({
            mxImageBasePath: "./mxgraph/images",
            mxBasePath: "./mxgraph"
        });



        const xmlDocument = mx.mxUtils.parseXml(xml),
            decoder = new mx.mxCodec(xmlDocument),
            graphDiv = document.getElementById('graph-container'),
            graph = new mx.mxGraph(graphDiv);


        // --------------------------------------------------------------------------------------------------

        // VALIDATION!

        class PortsConnectionsMultiplicity extends mx.mxMultiplicity {
            constructor(source: boolean) {
                super(source, null);
            }

            // TO DO: disable possibility of connecting ports of the same agent
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

            private
        }

        graph.multiplicities.push(new PortsConnectionsMultiplicity(true));
        graph.setAllowDanglingEdges(false);
        graph.setMultigraph(false);

        // --------------------------------------------------------------------------------------------------

        console.log(mx);
        console.log(parseAlvisProjectXML(xmlDocument));

        console.log(xmlDocument);
        console.log(graphDiv);
        console.log(graph)

        var style = new Object();
        style[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RECTANGLE;
        style[mx.mxConstants.STYLE_OPACITY] = 50;
        style[mx.mxConstants.STYLE_FILLCOLOR] = 'white';
        style[mx.mxConstants.STYLE_STROKECOLOR] = 'black';
        style[mx.mxConstants.STYLE_FONTCOLOR] = 'black';
        // style[mx.mxConstants.STYLE_FOLDABLE] = '0';
        style[mx.mxConstants.STYLE_ROUNDED] = '1'
        graph.getStylesheet().putCellStyle('ROUNDED', style);

        var portStyle = new Object();
        portStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_ELLIPSE;
        portStyle[mx.mxConstants.STYLE_FILLCOLOR] = 'white';
        portStyle[mx.mxConstants.STYLE_STROKECOLOR] = 'black';
        portStyle[mx.mxConstants.STYLE_FONTCOLOR] = 'black';
        portStyle[mx.mxConstants.STYLE_ROUNDED] = '1'
        portStyle[mx.mxConstants.STYLE_RESIZABLE] = '0'
        portStyle[mx.mxConstants.STYLE_LABEL_POSITION] = 'left'
        portStyle[mx.mxConstants.STYLE_ALIGN] = 'right'
        graph.getStylesheet().putCellStyle('PORT_STYLE', portStyle);

        // --------------------------------------------------------------------------------------------------

        // Removes folding icon for relative children
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

        // Enables moving of relative children
        graph.isCellLocked = function (cell) {
            return false;
        };

        // --------------------------------------------------------------------------------------------------
        graph.setConnectable(true);

        // Ports are not used as terminals for edges, they are
        // only used to compute the graphical connection point
        graph.isPort = function (cell) {
            var geo = this.getCellGeometry(cell);

            return (geo != null) ? geo.relative : false;
        };

        // --------------------------------------------------------------------------------------------------

        // zrobienie tak by krawedzie przesowaly sie razem z portami:

        graph.processChange = function (change) {
            mx.mxGraph.prototype.processChange.apply(this, arguments);

            // if (change instanceof mxClasses.mxTerminalChange) {
            //     console.log(arguments)
            // }

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

        // --------------------------------------------------------------------------------------------------

        new mx.mxRubberband(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        const parent = graph.getDefaultParent();

        modifyMxGraph2(mx, graph);

        // new AlvisGraphManager(mx, graph, parseAlvisProjectXML(xmlDocument).pages.get(1));

        // Adds cells to the model in a single step
            // graph.getModel().beginUpdate();
            // try {
            //     var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 100, 100, 'ROUNDED');
            //     var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30, 'ROUNDED');
            //     // var e1 = graph.insertEdge(parent, null, '', v1, v2);

            //     v1.setConnectable(false);
            //     v2.setConnectable(false);

            //     var v11 = graph.insertVertex(v1, null, 'P1', 1, 1, 20, 20, 'PORT_STYLE');
            //     v11.geometry.offset = new mx.mxPoint(-10, -10);
            //     v11.geometry.relative = true;


            //     var v12 = graph.insertVertex(v2, null, 'P2', 1, 1, 20, 20, 'PORT_STYLE');
            //     v12.geometry.offset = new mx.mxPoint(-10, -10);
            //     v12.geometry.relative = true;
            // }
            // finally {
            //     // Updates the display
            //     graph.getModel().endUpdate();
            // }

        // let ut = m.mxUtils.addStylename("sdf", "asd");
        // console.log(mx)
        // let w = mxGraph();
        // console.log(mxG);
        console.log(mx)
        // let g = new mxGraph.mxGraph();
        // let b:mxCell = mx().a;
        // let x = b.edge;
        let v = 1;
        let s: string;
        s = null;
        // mxgraph. 

        // if(mxClient.isBrowserSupported()) {

        // }
    }

    render() {
        console.log(this.props)
        console.log('asdfasdfasdf2')
        return (
            <div id="graph-div">
                {"graph div"}
                <div id="graph-container"></div>
            </div>
        )
    }
}
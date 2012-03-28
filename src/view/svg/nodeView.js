var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


/**
 * <code>nodeView</code> is an rectangular area and provides following services:
 * - It publishes drag events.
 * - It has active border which can be used for node resizing - it publishes resize events.
 *
 * <code>nodeView</code> is not responsible for its content - content is rendered by <code>nodeRenderer</code>.
 *
 * @param diagramView
 */
WIKIDIA.view.svg.nodeView = function (diagramView, node) {
    "use strict";

    var CORNER_SIZE = 15;
    var PADDING = 5;

    var parent = WIKIDIA.view.svg.view;
    var utils = WIKIDIA.utils;
    var svgHelper = WIKIDIA.view.svg.svgHelper;
    var dragEventHandler = WIKIDIA.view.svg.dragEventHandler;

    var element = diagramView.addElement("g", {class: "node"});
    var that = parent(element);

    var onDragStart, onDragMove, onDragEnd;
    var onResizeDragStart, onResizeDragMove, onResizeDragEnd;
    var isResizing = false;
    var content, resizeBorder;

    function init() {
        var dragHandler = dragEventHandler(element);
        dragHandler.dragStart(function (e) {
            if (!isResizing && onDragStart) {
                onDragStart(that);
            }
        });
        dragHandler.dragMove(function (e, dx, dy) {
            if (!isResizing && onDragMove) {
                onDragMove(that, dx, dy);
            }
        });
        dragHandler.dragEnd(function (e, dx, dy) {
            if (!isResizing && onDragEnd) {
                onDragEnd(that, dx, dy);
            }
        });
        element.attr("cursor", "move");

        content = that.addElement("g", {class: "content"});

        // create border with resize handles
        resizeBorder = that.addElement("g", {class: "resize-border"});
        hideResizeBorder();
        updateResizeBorder();
        // resize border is visible only when mouse is on the node
        element.mouseenter(function (e) {
            showResizeBorder();
        });
        element.mouseleave(function (e) {
            hideResizeBorder();
        });

        node.change(onNodeChanged);
    }

    function onNodeChanged() {
        updateResizeBorder();
    }

    function updateResizeBorder() {
        resizeBorder.empty();
        resizeBorder.append(svgHelper.createSvgElement("rect", {x: node.x - 2, y: node.y - 2, width: node.width + 4, height: node.height + 4, fill: "none", stroke: "black", 'stroke-dasharray': "4,4"}));

        // TODO: just one resize corner for now
        var resizeHandle = svgHelper.pathBuilder().moveTo(node.x + node.width, node.y + node.height - CORNER_SIZE)
            .lineTo(node.x + node.width, node.y + node.height)
            .lineTo(node.x + node.width - CORNER_SIZE, node.y + node.height)
            .attr({
                "stroke-width": 7,
                stroke: "red",
                opacity: 0,
                fill: "none",
                cursor: "se-resize"
            }).create();
        resizeBorder.append(resizeHandle);

        var resizeDragHandler = dragEventHandler(resizeHandle);
        resizeDragHandler.dragStart(function (e) {
            // TODO: move dragStart and moveDragMove are fired once before isResizing is set, hopefully it won't do any damage
            isResizing = true;
            if (onResizeDragStart) {
                onResizeDragStart(that);
            }
        });
        resizeDragHandler.dragMove(function (e, dx, dy) {
            if (onResizeDragMove) {
                onResizeDragMove(that, dx, dy);
            }
        });
        resizeDragHandler.dragEnd(function (e, dx, dy) {
            isResizing = false;
            if (onResizeDragEnd) {
                onResizeDragEnd(that, dx, dy);
                // TODO: IMHO problem dragHandleru, podivat se na to?
                // we might end out of node when resizing. in such case mouseleave is not fired, make sure
                // that we hide resize border
                hideResizeBorder();
            }
        });
    }

    function showResizeBorder() {
        resizeBorder.attr("opacity", 1);
    }

    function hideResizeBorder() {
        resizeBorder.attr("opacity", 0);
    }


    that.dragStart = function(handler) {
        onDragStart = handler;
    };

    that.dragMove = function(handler) {
        onDragMove = handler;
    };

    that.dragEnd = function(handler) {
        onDragEnd = handler;
    };

    that.resizeDragStart = function(handler) {
        onResizeDragStart = handler;
    };

    that.resizeDragMove = function(handler) {
        onResizeDragMove = handler;
    };

    that.resizeDragEnd = function(handler) {
        onResizeDragEnd = handler;
    };

    // TODO: sam preview neudela IMHO, kdo bude soupat se sipkama?
    that.previewMove = function (dx, dy) {
        if (dx !== 0 && dy !== 0) {
            element.attr("transform", "translate({dx},{dy})".supplant({dx: dx, dy: dy}));
        } else {
            element.removeAttr("transform");
        }
    };

    /**
     * Clears content of the node. It's typically called as the first thing by renderer when it's going to update
     * node contents.
     */
    that.clear = function () {
        content.empty();
    };

    /**
     * Draws rectangle specified by x, y, width and height. X and y are relative to the left upper edge
     * of the node, which is considered to be [0, 0].
     *
     * @param spec
     */
    that.rect = function (spec) {
        // TODO: validate spec
        var el = svgHelper.createSvgElement("rect", spec);
        content.append(el);
    };

    /**
     * Adds text to node's content. If text coordinates are not set, text is added right after the last
     * rendered element.
     *
     * @param spec
     */
    that.text = function (spec) {
        var x = spec.x || PADDING;
        var y = spec.y || PADDING;
        var text = spec.text || spec;
        var el = svgHelper.createSvgElement("text", {
            x: node.x + x,
            y: node.y + y,
            'alignment-baseline': 'text-before-edge'
        });
        el.text(text);
        content.append(el);
    };

    that.PADDING = PADDING;

    that._test = {
        contentSvg: function () {
            var svg = "", i;
            var el = content[0]; // unwrap from jQuery

            for (i = 0; i < el.childNodes.length; i++) {
                svg += svgHelper.printSvg(el.childNodes[i]);
            }

            return svg;
        }
    };

    //TODO:


    init();

    return that;
};
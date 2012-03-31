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
    var svgHelper = WIKIDIA.view.svg.svgHelper;
    var dragEventHandler = WIKIDIA.view.svg.dragEventHandler;

    var element = diagramView.createElement("g", {class: "node"});
    var that = parent(element);

    var content, eventBox, resizeBorder, connectPoints;
    var onDragStart, onDragMove, onDragEnd;
    var onResizeDragStart, onResizeDragMove, onResizeDragEnd;
    // TODO: join nebo joint?
    var onConnectPointDragStart, onConnectPointDragMove, onConnectPointDragEnd;
    var onConnectPointMouseUp;
    var onMouseEnter, onMouseLeave, onMouseMove;
    // TODO: why do I need to do this? I should be able to avoid this simply by e.stopPropagation() in event handlers.
    var isResizing = false, isConnectPointDragging = false;

    function init() {
        element.attr("cursor", "move");
        content = that.createElement("g", {class: "content"});
        eventBox = that.createElement("rect", {class: "eventBox", opacity: 0});
        resizeBorder = that.createElement("g", {class: "resize-border", opacity: 0});
        connectPoints = that.createElement("g", {class: "connect-points"});
        connectPoints.attr("cursor", "default");

        var dragHandler = dragEventHandler(element);
        dragHandler.dragStart(function (e) {
            if (!isResizing && !isConnectPointDragging && onDragStart) {
                onDragStart(that);
            }
        });
        dragHandler.dragMove(function (e, dx, dy) {
            if (!isResizing && !isConnectPointDragging && onDragMove) {
                onDragMove(that, dx, dy);
            }
        });
        dragHandler.dragEnd(function (e, dx, dy) {
            if (!isResizing && !isConnectPointDragging && onDragEnd) {
                onDragEnd(that, dx, dy);
            }
        });

        var connectPointDragHandler = dragEventHandler(connectPoints);
        connectPointDragHandler.dragStart(function (e) {
            isConnectPointDragging = true;
            if (onConnectPointDragStart) {
                // TODO: read somehting about baseVal.value
                var connectPointX = e.target.cx.baseVal.value;
                var connectPointY = e.target.cy.baseVal.value;
                onConnectPointDragStart(that, connectPointX, connectPointY);
            }
        });
        connectPointDragHandler.dragMove(function (e, dx, dy) {
            if (onConnectPointDragMove) {
                onConnectPointDragMove(that, dx, dy);
            }
        });
        connectPointDragHandler.dragEnd(function (e, dx, dy) {
            isConnectPointDragging = false;
            if (onConnectPointDragEnd) {
                onConnectPointDragEnd(that, dx, dy);
            }
        });

        connectPoints.mouseup(function (e) {
            if (onConnectPointMouseUp) {
                var connectPointX = e.target.cx.baseVal.value;
                var connectPointY = e.target.cy.baseVal.value;
                onConnectPointMouseUp(that, connectPointX, connectPointY);
            }
        });

        // TODO: I should have some event box, this doesn't work well for non-rect shapes
        element.mouseenter(function (e) {
            if (!isResizing && !isConnectPointDragging && onMouseEnter) {
                onMouseEnter(that);
            }
        });
        element.mouseleave(function (e) {
            if (!isResizing && !isConnectPointDragging && onMouseLeave) {
                onMouseLeave(that);
            }
        });
        element.mousemove(function (e) {
            if (!isResizing && !isConnectPointDragging && onMouseMove) {
                onMouseMove(that, e.clientX, e.clientY);
            }
        });

    }

    that.showResizeBorder = function () {
        resizeBorder.attr("opacity", 1);
    };

    that.hideResizeBorder = function () {
        resizeBorder.attr("opacity", 0);
    };

    function updateResizeBorder(rect) {
        resizeBorder.empty();
        resizeBorder.append(svgHelper.createSvgElement("rect", {x: rect.x - 2, y: rect.y - 2, width: rect.width + 4, height: rect.height + 4, fill: "none", stroke: "black", 'stroke-dasharray': "4,4"}));

        // TODO: just one resize corner for now
        var resizeHandle = svgHelper.pathBuilder().moveTo(rect.x + rect.width, rect.y + rect.height - CORNER_SIZE)
            .lineTo(rect.x + rect.width, rect.y + rect.height)
            .lineTo(rect.x + rect.width - CORNER_SIZE, rect.y + rect.height)
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
            }
        });
    }

    that.dragStart = function (handler) {
        onDragStart = handler;
    };

    that.dragMove = function (handler) {
        onDragMove = handler;
    };

    that.dragEnd = function (handler) {
        onDragEnd = handler;
    };

    that.resizeDragStart = function (handler) {
        onResizeDragStart = handler;
    };

    that.resizeDragMove = function (handler) {
        onResizeDragMove = handler;
    };

    that.resizeDragEnd = function (handler) {
        onResizeDragEnd = handler;
    };

    that.connectPointDragStart = function (handler) {
        onConnectPointDragStart = handler;
    };

    that.connectPointDragMove = function (handler) {
        onConnectPointDragMove = handler;
    };

    that.connectPointDragEnd = function (handler) {
        onConnectPointDragEnd = handler;
    };

    /**
     * TODO: This event must be invoked BEFORE connectPointDragEnd, otherwise you won't be able to connect
     * two nodes in one drag.
     *
     * @param handler
     */
    that.connectPointMouseUp = function (handler) {
        onConnectPointMouseUp = handler;
    };

    that.mouseEnter = function (handler) {
        onMouseEnter = handler;
    };

    that.mouseLeave = function (handler) {
        onMouseLeave = handler;
    };

    that.mouseMove = function (handler) {
        onMouseMove = handler;
    };


    // TODO: bude treba tahle optimalizace?
    that.previewMove = function (dx, dy) {
        if (dx !== 0 && dy !== 0) {
            element.attr("transform", "translate({dx},{dy})".supplant({dx: dx, dy: dy}));
        } else {
            element.removeAttr("transform");
        }
    };

    // TODO: stejne jako u lineView, zajimave
    that.showConnectionPoints = function (points) {
        points.forEach(function (point) {
            var p = svgHelper.createSvgElement("circle", {cx: point.x, cy: point.y, r: 6, fill: "red", stroke:"blue"});
            connectPoints.append(p);
        });
    };

    that.hideConnectionPoints = function () {
        connectPoints.empty();
    };

    that.updateView = function (spec) {
        updateResizeBorder(spec);
        eventBox.attr(spec);
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

    that.ellipse = function (spec) {
        // TODO: validate spec
        var el = svgHelper.createSvgElement("ellipse", spec);
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
        // TODO: I still need node here, but tohle stejne nebude fungovat pro elipsu, renderer je ten, kdo
        // muze rozhodnout, kde defaultne zacina text
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
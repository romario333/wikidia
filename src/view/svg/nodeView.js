/*global define*/
define(function(require) {
    "use strict";
    /**
     * <code>nodeView</code> is an rectangular area and provides following services:
     * - It publishes drag events.
     * - It has active border which can be used for node resizing - it publishes resize events.
     *
     * <code>nodeView</code> is not responsible for its content - content is rendered by <code>nodeRenderer</code>.
     *
     * @param diagramView
     */
    return function (diagramView) {
        var CORNER_SIZE = 15;

        var parent = require("./viewBase");
        var svgHelper = require("./svgHelper");
        var dragEventHandler = require("./dragEventHandler");

        var element = diagramView.createElement("g", {class: "node"});
        var that = parent(element);

        var content, eventBox, resizeBorder, connectPoint;
        var onDragStart, onDragMove, onDragEnd;
        var onResizeDragStart, onResizeDragMove, onResizeDragEnd;
        var onConnectPointDragStart, onConnectPointDragMove, onConnectPointDragEnd;
        var onConnectPointMouseUp;
        var onMouseEnter, onMouseLeave, onMouseMove;
        // TODO: why do I need to do this? I should be able to avoid this simply by e.stopPropagation() in event handlers.
        var isResizing = false, isConnectPointDragging = false;

        function init() {
            element.attr("cursor", "move");
            content = that.createElement("g", {class: "content"});
            eventBox = that.createElement("rect", {class: "eventBox", opacity: 0, fill: "blue"});
            resizeBorder = that.createElement("g", {class: "resize-border", display: "none"});
            connectPoint = that.createElement("circle", {class: "connect-point", cx: 0, cy: 0, r: 6, fill: "red", stroke:"blue", display: "none"});
            connectPoint.attr("cursor", "default");

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

            var connectPointDragHandler = dragEventHandler(connectPoint);
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

            connectPoint.mouseup(function (e) {
                if (onConnectPointMouseUp) {
                    var connectPointX = e.target.cx.baseVal.value;
                    var connectPointY = e.target.cy.baseVal.value;
                    onConnectPointMouseUp(that, connectPointX, connectPointY);
                }
            });

            element.mouseenter(function (e) {
                if (!isResizing && onMouseEnter) {
                    onMouseEnter(that);
                }
            });
            element.mouseleave(function (e) {
                if (!isResizing && onMouseLeave) {
                    onMouseLeave(that);
                }
            });
            element.mousemove(function (e) {
                if (!isResizing && onMouseMove) {
                    // TODO: kde beru jistotu, ze je tohle spravne? offset vuci cemu?
                    onMouseMove(that, e.offsetX, e.offsetY);
                }
            });

        }

        that.showResizeBorder = function () {
            resizeBorder.attr("display", "block");
        };

        that.hideResizeBorder = function () {
            resizeBorder.attr("display", "none");
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
         * TODO: should be called drop
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

        // TODO: stejne jako u lineView, zajimave
        that.showConnectionPoint = function (point) {
            connectPoint.attr({cx: point.x, cy: point.y, display: "block"});
        };

        that.hideConnectionPoints = function () {
            connectPoint.attr({display: "none"});
        };

        that.updateBounds = function (spec) {
            updateResizeBorder(spec);
            // TODO: should be derived from GRID_STEP (let's say 1/3 of it)
            eventBox.attr({x: spec.x - 5, y: spec.y - 5, width: spec.width + 10, height: spec.height + 10});
        };

        that.isSelected = function(selected) {
            eventBox.attr("opacity", selected ? 0.5 : 0);
        };

        /* RENDERING OPERATIONS - called by renderers from renderers.js */

        /**
         * Clears content of the node. It's typically called as the first thing by renderer when it's going to update
         * node contents.
         */
        that.clear = function () {
            content.empty();
        };

        /**
         * Draws a rectangle.
         *
         * @param spec.x        The x-axis coordinate of the upper left corner of the rectangle.
         * @param spec.y        The y-axis coordinate of the upper left corner of the rectangle.
         * @param spec.width
         * @param spec.height
         * @param spec.rx       For rounded rectangles, the x-axis radius of the ellipse used to round off the corners of the rectangle.
         * @param spec.ry       For rounded rectangles, the y-axis radius of the ellipse used to round off the corners of the rectangle.
         * @param spec.fill     Fill color.
         * @param spec.stroke   Stroke color.
         */
        that.rect = function (spec) {
            // TODO: validate spec
            var el = svgHelper.createSvgElement("rect", spec);
            content.append(el);
        };

        /**
         * Draws a line.
         *
         * @param spec.x1
         * @param spec.y1
         * @param spec.x2
         * @param spec.y2
         * @param spec.stroke   Stroke color.
         */
        that.line = function (spec) {
            var el = svgHelper.createSvgElement("line", spec);
            content.append(el);
        };

        /**
         * Draws an ellipse
         *
         * @param spec.cx       The x-axis coordinate of the center of the ellipse.
         * @param spec.cy       The y-axis coordinate of the center of the ellipse.
         * @param spec.rx       The x-axis radius of the ellipse.
         * @param spec.ry       The y-axis radius of the ellipse.
         * @param spec.fill     Fill color.
         * @param spec.stroke   Stroke color.
         */
        that.ellipse = function (spec) {
            var el = svgHelper.createSvgElement("ellipse", spec);
            content.append(el);
        };

        /**
         * Draws a text. Only single line text is supported, any `\n` will be ignored.
         *
         * @param spec.x        The x-axis coordinate of the upper left corner of the text.
         * @param spec.y        The y-axis coordinate of the upper left corner of the text.
         * @param spec.text     The text to render.
         * @return {Object}     Size of the rendered text.
         */
        that.text = function (spec) {
            var textElement = createTextElement(spec);
            content.append(textElement);
            return {
                width: textElement.width(),
                height: textElement.height()
            };
        };

        /**
         * Measures a text without rendering.
         *
         * @param spec.x        The x-axis coordinate of the upper left corner of the text.
         * @param spec.y        The y-axis coordinate of the upper left corner of the text.
         * @param spec.text     The text to render.
         * @return {Object}     Size of the rendered text.
         */
        that.measureText = function (spec) {
            var textElement = createTextElement(spec);
            // add text temporarily to the document so we can get its size
            content.append(textElement);
            var textSize = {
                width: textElement.width(),
                height: textElement.height()
            };
            textElement.remove();
            return textSize;
        };

        function createTextElement(spec) {
            var textElement = svgHelper.createSvgElement("text", {
                x: spec.x || 0,
                y: spec.y || 0,
                'alignment-baseline': 'text-before-edge'
            });
            textElement.text(spec.text);
            return textElement;
        }

        that._test = {};
        that._test.contentSvg = function () {
            var svg = "", i;
            var el = content[0]; // unwrap from jQuery

            for (i = 0; i < el.childNodes.length; i++) {
                svg += svgHelper.printSvg(el.childNodes[i]);
            }

            return svg;
        };

        init();

        return that;
    };
});
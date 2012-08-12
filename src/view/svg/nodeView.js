/*global define*/
define(function(require) {
    "use strict";

    /**
     * `nodeView` is a rectangular area which provides following services:
     * - It publishes drag events.
     * - It has active border which can be used for node resizing. It does not handle resizing on itself though, it
     * just publishes resize events.
     * - It can display connection points and handle events for them.
     *
     * `nodeView` is not responsible for its content - content is rendered by `nodeRenderer` from presenter layer.
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

        var content, eventBox, resizeBorder, connectPoint, connectPointLocked;
        var onDragStart, onDragMove, onDragEnd;
        var onResizeDragStart, onResizeDragMove, onResizeDragEnd;
        var onConnectPointDragStart, onConnectPointDragMove, onConnectPointDragEnd;
        var onConnectPointDrop;
        var onMouseEnter, onMouseLeave, onMouseMove;
        var isResizing = false, isConnectPointDragging = false;

        function init() {
            element.attr("cursor", "move");
            content = that.createElement("g", {class: "content"});
            eventBox = that.createElement("rect", {class: "eventBox", opacity: 0, fill: "blue"});
            resizeBorder = that.createElement("g", {class: "resize-border", display: "none"});
            connectPoint = that.createElement("circle", {class: "connect-point", cx: 0, cy: 0, r: 0, fill: "red", stroke:"blue", display: "none"});
            connectPoint.attr("cursor", "default");
            // circle which shows in animation when a line is locked to a node
            connectPointLocked = that.createElement("circle", {class: "connect-point-locked", cx: 0, cy: 0, r: 0, fill: "none", stroke:"black", "stroke-width": 2, display: "none"});



            var dragHandler = dragEventHandler(element);
            dragHandler.dragStart(function (e, dragInfo) {
                if (!isResizing && !isConnectPointDragging && onDragStart) {
                    onDragStart(that);
                }
            });
            dragHandler.dragMove(function (e, dragInfo) {
                if (!isResizing && !isConnectPointDragging && onDragMove) {
                    onDragMove(that, dragInfo.dx, dragInfo.dy);
                }
            });
            dragHandler.dragEnd(function (e, dragInfo) {
                if (!isResizing && !isConnectPointDragging && onDragEnd) {
                    onDragEnd(that, dragInfo.dx, dragInfo.dy);
                }
            });

            var connectPointDragHandler = dragEventHandler(connectPoint);
            connectPointDragHandler.dragStart(function (e, dragInfo) {
                isConnectPointDragging = true;
                if (onConnectPointDragStart) {
                    var connectPointX = e.target.cx.animVal.value;
                    var connectPointY = e.target.cy.animVal.value;
                    onConnectPointDragStart(that, connectPointX, connectPointY);
                }
            });
            connectPointDragHandler.dragMove(function (e, dragInfo) {
                if (onConnectPointDragMove) {
                    onConnectPointDragMove(that, dragInfo.dx, dragInfo.dy);
                }
            });
            connectPointDragHandler.dragEnd(function (e, dragInfo) {
                isConnectPointDragging = false;
                if (onConnectPointDragEnd) {
                    onConnectPointDragEnd(that, dragInfo.dx, dragInfo.dy);
                }
            });

            // FIXME: drop event should be part of drag handler
            connectPoint.mouseup(function (e) {
                if (onConnectPointDrop) {
                    var connectPointX = e.target.cx.animVal.value;
                    var connectPointY = e.target.cy.animVal.value;
                    onConnectPointDrop(that, connectPointX, connectPointY);
                }
            });

            connectPoint.mouseenter(function (e) {
                connectPoint.attr("fill", "black");
            });

            connectPoint.mouseleave(function (e) {
                connectPoint.attr("fill", "red");
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
                    var diagramOffset = diagramView.offset();
                    onMouseMove(that, e.pageX - diagramOffset.left, e.pageY - diagramOffset.top);
                }
            });

        }

        /**
         * Binds an event handler to the `dragStart` event. This event occurs when user starts dragging the node.
         *
         * @param handler
         */
        that.dragStart = function (handler) {
            onDragStart = handler;
        };

        /**
         * Binds an event handler to the `dragMove` event. This event occurs when user drags the node around.
         *
         * @param handler
         */
        that.dragMove = function (handler) {
            onDragMove = handler;
        };

        /**
         * Binds an event handler to the `dragEnd` event. This event occurs when user stops dragging the node.
         *
         * @param handler
         */
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

        /**
         * Binds and event handler to the `connectPointDragStart` event. This event occurs when user starts
         * dragging at the connection point.
         *
         * @param handler
         */
        that.connectPointDragStart = function (handler) {
            onConnectPointDragStart = handler;
        };

        that.connectPointDragMove = function (handler) {
            onConnectPointDragMove = handler;
        };

        that.connectPointDragEnd = function (handler) {
            onConnectPointDragEnd = handler;
        };

        that.connectPointDrop = function (handler) {
            onConnectPointDrop = handler;
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

        /**
         * Shows resize border - this border is used by user to resizing of node.
         */
        that.showResizeBorder = function () {
            resizeBorder.attr("display", "block");
        };

        /**
         * Hides resize border.
         */
        that.hideResizeBorder = function () {
            resizeBorder.attr("display", "none");
        };

        that.showConnectionPoint = function (point) {
            /*jshint eqeqeq:false*/
            if (connectPoint.attr("cx") == point.x && connectPoint.attr("cy") == point.y && connectPoint.attr("display") === "block") {
                // connection point already visible, do nothing
                return;
            }

            connectPoint.attr({cx: point.x, cy: point.y, display: "block"});

            $(connectPoint[0].r.baseVal).animate({value: 10},{
                duration: "fast"
            });
        };

        that.hideConnectionPoints = function () {
            connectPoint.attr({display: "none"});

            connectPoint.delay(500).queue(function () {
                connectPoint.attr({r: 0});
            });
        };

        /**
         * Animation which is run when user locks a line to a node.
         */
        that.animateLock = function () {
            connectPointLocked.attr({cx: connectPoint.attr("cx"), cy: connectPoint.attr("cy"), r: 40, display: "block"});

            $(connectPointLocked[0].r.baseVal).animate({value: 0},{
                duration: "fast"
            });
        };

        that.previewMove = function (dx, dy) {
            element.attr("transform", "translate({dx},{dy})".supplant({dx: dx, dy: dy}));
        };

        that.cancelPreviewMove = function () {
            element.attr("transform", "");
        };

        /**
         * Updates size of node's area.
         *
         * @param spec - [x, y] coordinates of the node's left upper corner and its width and height.
         */
        that.updateBounds = function (spec) {
            updateResizeBorder(spec);
            // make eventBox slightly wider than node
            var tolerance = diagramView.gridStep ? diagramView.gridStep / 3 : 5;
            eventBox.attr({
                x: spec.x - tolerance,
                y: spec.y - tolerance,
                width: spec.width + 2 * tolerance,
                height: spec.height + 2 * tolerance});
        };

        that.isSelected = function(selected) {
            eventBox.attr("opacity", selected ? 0.5 : 0);
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
            resizeDragHandler.dragStart(function (e, dragInfo) {
                isResizing = true;
                if (onResizeDragStart) {
                    onResizeDragStart(that);
                }
            });
            resizeDragHandler.dragMove(function (e, dragInfo) {
                if (onResizeDragMove) {
                    onResizeDragMove(that, dragInfo.dx, dragInfo.dy);
                }
            });
            resizeDragHandler.dragEnd(function (e, dragInfo) {
                isResizing = false;
                if (onResizeDragEnd) {
                    onResizeDragEnd(that, dragInfo.dx, dragInfo.dy);
                }
            });
        }

        // TODO: put these in other object?
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
                'dominant-baseline': 'text-before-edge'
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
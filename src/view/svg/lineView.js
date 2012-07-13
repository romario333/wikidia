define(function(require) {
    "use strict";

    return function (diagramView) {

        var parent = require("./viewBase");
        var svgHelper = require("./svgHelper");
        var dragEventHandler = require("./dragEventHandler");

        var element = diagramView.createElement("g", {class: "line"});
        var that = parent(element);

        var content, eventBox, connectPoints;
        var onConnectPointDragStart, onConnectPointDragMove, onConnectPointDragEnd;
        var isConnectPointDragging = false;
        var onConnectPointDrop;
        var onMouseEnter, onMouseLeave, onMouseMove;

        function init() {
            content = that.createElement("g", {class: "content"});
            eventBox = that.createElement("line", {class: "eventBox", stroke: 'blue', opacity: 0, 'stroke-width': (diagramView.gridStep / 3) * 2});
            connectPoints = that.createElement("g", {class: "connect-points"});
            connectPoints.attr("cursor", "default");

            element.mouseenter(function (e) {
                if (!isConnectPointDragging && onMouseEnter) {
                    onMouseEnter(that);
                }
            });
            element.mouseleave(function (e) {
                if (!isConnectPointDragging && onMouseLeave) {
                    onMouseLeave(that);
                }
            });
            element.mousemove(function (e) {
                if (!isConnectPointDragging && onMouseMove) {
                    var diagramOffset = diagramView.offset();
                    onMouseMove(that, e.pageX - diagramOffset.left, e.pageY - diagramOffset.top);
                }
            });

            var connectPointDragHandler = dragEventHandler(connectPoints);
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

            connectPoints.mouseup(function (e) {
                if (onConnectPointDrop) {
                    var connectPointX = e.target.cx.animVal.value;
                    var connectPointY = e.target.cy.animVal.value;
                    onConnectPointDrop(that, connectPointX, connectPointY);
                }
            });
        }

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

        that.updateBounds = function (spec) {
            eventBox.attr(spec);
        };

        that.isSelected = function(selected) {
            eventBox.attr("opacity", selected ? 0.5 : 0);
        };

        that.showConnectionPoints = function (points) {
            points.forEach(function (point) {
                var p = svgHelper.createSvgElement("circle", {cx: point.x, cy: point.y, r: 6, fill: "red", stroke:"blue"});
                connectPoints.append(p);
            });
        };

        that.hideConnectionPoints = function () {
            connectPoints.empty();
        };

        // TODO: temp verze
        that.clear = function () {
            content.empty();
        };

        that.line = function(spec) {
            var el = svgHelper.createSvgElement("line", spec);
            content.append(el);
        };

        init();

        return that;
    };
});
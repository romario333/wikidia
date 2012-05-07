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
        var onConnectPointMouseUp;
        var onMouseEnter, onMouseLeave, onMouseMove;

        function init() {
            content = that.createElement("g", {class: "content"});
            eventBox = that.createElement("line", {class: "eventBox", stroke: 'blue', opacity: 0, 'stroke-width': 7});
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
                    // TODO: kde beru jistotu, ze je tohle spravne? offset vuci cemu?
                    onMouseMove(that, e.offsetX, e.offsetY);
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


        }

        that.updateBounds = function (spec) {
            eventBox.attr(spec);
        };

        that.isSelected = function(selected) {
            eventBox.attr("opacity", selected ? 0.5 : 0);
        };


        // TODO: temp verze
        that.clear = function () {
            content.empty();
        };

        that.line = function(spec) {
            var el = svgHelper.createSvgElement("line", spec);
            content.append(el);
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

        that.connectPointDragStart = function (handler) {
            onConnectPointDragStart = handler;
        };

        that.connectPointDragMove = function (handler) {
            onConnectPointDragMove = handler;
        };

        that.connectPointDragEnd = function (handler) {
            onConnectPointDragEnd = handler;
        };

        // TODO: drop would be better name
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

        init();

        return that;
    };
});
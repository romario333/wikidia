var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};

WIKIDIA.view.svg.lineView = function (diagramView, node) {
    "use strict";

    var parent = WIKIDIA.view.svg.view;
    var svgHelper = WIKIDIA.view.svg.svgHelper;
    var dragEventHandler = WIKIDIA.view.svg.dragEventHandler;

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
                onMouseMove(that, e.clientX, e.clientY);
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

    that.updateView = function (spec) {
        eventBox.attr(spec);
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
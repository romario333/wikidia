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
WIKIDIA.view.svg.nodeView = function (diagramView) {
    "use strict";

    var parent = WIKIDIA.view.svg.view;
    var svgHelper = WIKIDIA.view.svg.svgHelper;
    var dragEventHandler = WIKIDIA.view.svg.dragEventHandler;

    var element = diagramView.addDiagramElement("g", {class: "node"});
    var that = parent(element);

    var onDragStart, onDragMove, onDragEnd;

    function init() {
        var dragHandler = dragEventHandler(element);
        dragHandler.dragStart(function (e) {
            if (onDragStart) {
                onDragStart(that);
            }
        });
        dragHandler.dragMove(function (e, dx, dy) {
            if (onDragMove) {
                onDragMove(that, dx, dy);
            }
        });
        dragHandler.dragEnd(function (e, dx, dy) {
            if (onDragEnd) {
                onDragEnd(that, dx, dy);
            }
        });
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
        element.empty();
    };

    that.rect = function (spec) {
        // TODO: validate spec
        that.addElement("rect", spec);
    };



    that._test = {
        svg: function () {
            return svgHelper.printSvg(element);
        }
    };

    init();

    return that;
};
var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


WIKIDIA.view.svg.nodeView = function (diagramView, node, nodeBuilder) {
    "use strict";

    var parent = WIKIDIA.view.svg.view;
    var svgHelper = WIKIDIA.view.svg.svgHelper;
    var dragEventHandler = WIKIDIA.view.svg.dragEventHandler;

    var element = diagramView.addDiagramElement("g", {class: "node"});
    var that = parent(element);

    var onDragStart, onDragMove, onDragEnd;

    function init() {
        // TODO: I'm not sure that view should have ref to nodeBuilder
        nodeBuilder.nodeView = that;

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

    that.node = function () {
        return node;
    };

    that.dragStart = function(handler) {
        onDragStart = handler;
    };

    that.dragMove = function(handler) {
        onDragMove = handler;
    };

    that.dragEnd = function(handler) {
        onDragEnd = handler;
    };

    that.rect = function (spec) {
        // TODO: validate spec
        that.addElement("rect", spec);
    };

    that.update = function () {
        // clear contents of node
        element.empty();

        // let node to update us
        node.update(nodeBuilder);
    };

    that.previewMove = function (dx, dy) {
        if (dx !== 0 && dy !== 0) {
            element.attr("transform", "translate({dx},{dy})".supplant({dx: dx, dy: dy}));
        } else {
            element.removeAttr("transform");
        }
    };




    that._test = {
        svg: function () {
            return svgHelper.printSvg(element);
        }
    };

    init();

    return that;
};
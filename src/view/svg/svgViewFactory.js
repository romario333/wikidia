var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


WIKIDIA.view.svg.svgViewFactory = function (element) {
    "use strict";

    var that = {};

    that.rootView = WIKIDIA.view.svg.rootView;
    that.diagramView = WIKIDIA.view.svg.diagramView;
    that.nodeView = WIKIDIA.view.svg.nodeView;
    that.lineView = WIKIDIA.view.svg.lineView;

    return that;
};
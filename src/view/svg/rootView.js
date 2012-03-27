var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


WIKIDIA.view.svg.rootView = function (container) {
    "use strict";

    var parent = WIKIDIA.view.svg.view;
    var svgHelper = WIKIDIA.view.svg.svgHelper;

    var element = $(svgHelper.createSvgElement("svg"));
    var that = parent(element);

    container.append(element);

    that._test = {
        svg: function () {
            return svgHelper.printSvg(element);
        }
    };

    return that;
};
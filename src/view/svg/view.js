var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


WIKIDIA.view.svg.view = function (element) {
    "use strict";

    var svgHelper = WIKIDIA.view.svg.svgHelper;

    var that = {};

    that.element = function () {
        return element;
    };

    that.addElement = function (tagName, attributes) {
        var el = svgHelper.createSvgElement(tagName, attributes);
        element.append(el);
        return el;
    };

    return that;
};
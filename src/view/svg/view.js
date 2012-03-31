var WIKIDIA = WIKIDIA || {};
WIKIDIA.view = WIKIDIA.view || {};
WIKIDIA.view.svg = WIKIDIA.view.svg || {};


WIKIDIA.view.svg.view = function (element) {
    "use strict";

    var svgHelper = WIKIDIA.view.svg.svgHelper;

    var that = {};

    var onClick, onDoubleClick;
    var onMouseDown, onMouseUp;

    element.click(function (e) {
        // TODO: decide about which events should bubble and which not
        //e.stopPropagation();
        if (onClick) {
            onClick(that);
        }
    });
    element.dblclick(function (e) {
        //e.stopPropagation();
        if (onDoubleClick) {
            onDoubleClick(that);
        }
    });
    element.mousedown(function (e) {
        //e.stopPropagation();
        if (onMouseDown) {
            onMouseDown(that);
        }
    });
    element.mouseup(function (e) {
        //e.stopPropagation();
        if (onMouseUp) {
            onMouseUp(that);
        }
    });

    that.click = function (handler) {
        onClick = handler;
    };

    that.doubleClick = function (handler) {
        onDoubleClick = handler;
    };

    that.mouseDown = function (handler) {
        onMouseDown = handler;
    };

    that.mouseUp = function (handler) {
        onMouseUp = handler;
    };

    that.element = function () {
        return element;
    };

    that.createElement = function (tagName, attributes) {
        var el = svgHelper.createSvgElement(tagName, attributes);
        element.append(el);
        return el;
    };

    return that;
};
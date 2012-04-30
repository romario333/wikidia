define(function(require) {
    "use strict";

    return function (element) {
        var svgHelper = require("./svgHelper");

        var that = {};

        var onClick, onDoubleClick, onMouseDown, onMouseUp;

        element.click(function (e) {
            e.stopPropagation();
            if (onClick) {
                onClick(that);
            }
        });
        element.dblclick(function (e) {
            e.stopPropagation();
            if (onDoubleClick) {
                onDoubleClick(that);
            }
        });
        element.mousedown(function (e) {
            e.stopPropagation();
            if (onMouseDown) {
                onMouseDown(that);
            }
        });
        element.mouseup(function (e) {
            // TODO: I have to let mouseup propagate or drag won't work
            //e.stopPropagation();
            if (onMouseUp) {
                onMouseUp(that);
            }
        });

        // TODO: only one handler can be registered right now + DRY
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
});
define(function (require) {
    "use strict";

    var item = require("model/item");
    var utils = require("utils");

    return function (spec) {
        var DEFAULT_SIZE = 90;

        var that = item();

        spec = spec || {};

        utils.addObservableProperty(that, "text", spec.text || "");
        utils.addObservableProperty(that, "x", spec.x || 0);
        utils.addObservableProperty(that, "y", spec.y || 0);
        utils.addObservableProperty(that, "width", spec.width || DEFAULT_SIZE);
        utils.addObservableProperty(that, "height", spec.height || DEFAULT_SIZE);
        utils.addObservableProperty(that, "kind", spec.kind || "node");

        /**
         * Moves node to the specified position. Position of connected items is updated.
         *
         * @param x
         * @param y
         */
        that.moveTo = function (x, y) {
            that.changeEventsEnabled(false);

            that.connections().forEach(function (c) {
                if (c.isLinePoint) {
                    c.line.changeEventsEnabled(true);
                    c.x = c.x - that.x + x;
                    c.y = c.y - that.y + y;
                    c.line.changeEventsEnabled(false);
                    c.line.fireChange();
                } else {
                    throw new Error("Don't know how to handle item.");
                }
            });

            that.x = x;
            that.y = y;

            that.changeEventsEnabled(true);
            that.fireChange();
        };

        /**
         * Resizes node to the specified dimensions. Position of connected items is updated if necessary.
         *
         * @param width
         * @param height
         */
        that.resizeTo = function (width, height) {
            that.changeEventsEnabled(false);

            that.connections().forEach(function (c) {
                if (c.isLinePoint) {
                    var lineChanged = false;
                    c.line.changeEventsEnabled(true);

                    if (c.x === that.x + that.width) {
                        c.x = that.x + width;
                        lineChanged = true;
                    }
                    if (c.y === that.y + that.height) {
                        c.y = that.y + height;
                        lineChanged = true;
                    }

                    c.line.changeEventsEnabled(false);
                    if (lineChanged) {
                        c.line.fireChange();
                    }
                } else {
                    throw new Error("Don't know how to handle item.");
                }
            });

            that.width = width;
            that.height = height;

            that.changeEventsEnabled(true);
            that.fireChange();
        };

        that.isNode = true;

        return that;
    };
});

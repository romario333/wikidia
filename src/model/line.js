define(function (require) {
    "use strict";

    var item = require("model/item");
    var utils = require("utils");

    /**
     * @constructor
     *
     * This object represents a line in a diagram. Line has `text`, `kind == "line"` and it contains
     * points.
     *
     * You cannot connect directly to the line, you have to connect to one of its points instead.
     *
     * @param spec  Line's specification, e.g.: `{x1: 0, y1: 0, x2: 10, y2: 10}` creates line with two points -
     *              [0, 0] and [10, 10].
     */
    return function (spec) {
        var that = item(),
            points = [];

        spec = spec || {};

        // line has always two points right now, in the future it should be possible to add or remove arbitrary
        // number of points
        points.push(linePoint({x: spec.x1 || 0, y: spec.y1 || 0}, that));
        points.push(linePoint({x: spec.x2 || 0, y: spec.y2 || 0}, that));

        utils.addObservableProperty(that, "text", spec.text || "");
        utils.addObservableProperty(that, "kind", spec.kind || "line");

        that.points = function (i) {
            if (arguments.length === 0) {
                return points.slice();
            } else {
                return points[i];
            }
        };

        /**
         * Returns line point at the specified coordinates. Fails if no such point exists.
         *
         * @param x
         * @param y
         */
        that.pointAt = function (x, y) {
            for (var i = 0; i < points.length; i++) {
                var p = points[i];
                if (p.x === x && p.y === y) {
                    return p;
                }
            }
            throw new Error("Point [{x}, {y}] not found on line with id '{line}'.".supplant({x: x, y: y, line: that.id}));
        };

        // TODO: this defies the whole concept of capability testing
        that.addConnection = function (item) {
            throw new Error("You can't connect to line directly, use function on its point instead.");
        };

        that.removeConnection = function (item) {
            throw new Error("You can't disconnect from line directly, use function on its point instead.");
        };

        that.connections = function () {
            throw new Error("You can't get list of line connections directly, use function on its point instead.");
        };

        that.disconnect = function () {
            that.points().forEach(function (point) {
                point.connections().forEach(function (connection) {
                    point.removeConnection(connection);
                });
            });
        };

        that.isLine = true;

        // TODO: make linePoint completely independent on line, it will be just point
        /**
         * @constructor
         *
         * This object represents a line on a point. It cannot exist on itself, it is always a part of the line.
         *
         * @param spec  Point's specification (coordinates)
         * @param line  Line to which this point belongs.
         */
        function linePoint(spec, line) {
            var that = item();

            utils.addObservableProperty(that, "x", spec.x || 0);
            utils.addObservableProperty(that, "y", spec.y || 0);

            that.isLinePoint = true;
            that.line = line;

            // remove change event related functions from point's interface, I want my clients to use line's interface
            that.change = function () { throw new Error("You can't use change observing properties on point, use properties on line instead."); };
            that.fireChange = line.fireChange;
            that.changeEventsEnabled = function () {
                if (arguments.length !== 0) {
                    throw new Error("You can't use change observing properties on point, use properties on line instead.");
                }
                return line.changeEventsEnabled();
            };

            return that;
        }

        return that;
    };
});

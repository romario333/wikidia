define(function (require) {
    "use strict";

    var item = require("model/item");

    return function (spec) {
        var that = item(),
            points = [];

        spec = spec || {};

        // line has always two points right now, in the future it should be possible to add or remove arbitrary
        // number of points
        points.push(point({x: spec.x1 || 0, y: spec.y1 || 0}, that));
        points.push(point({x: spec.x2 || 0, y: spec.y2 || 0}, that));

        // TODO: quick, not very effective implementation
        // rebroadcast point change events as line change events
        points.forEach(function (point) {
            point.change(function () {
                if (that.changeEventsEnabled()) {
                    that.fireChange();
                }
            });

            // remove change event related functions from point's interface, I want my clients to use line's interface
            point.change = function () { throw new Error("You can't use change observing properties on point, use properties on line instead."); };
            point.fireChange = function () { throw new Error("You can't use change observing properties on point, use properties on line instead."); };
            point.changeEventsEnabled = function () { throw new Error("You can't use change observing properties on point, use properties on line instead."); };
        });


        that._addObservableProperty("text", spec.text || "");
        that._addObservableProperty("kind", spec.kind || "line");

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

        that.addConnection = function (item) {
            throw new Error("You can't connect to line directly, use function on its point instead.");
        };

        that.removeConnection = function (item) {
            throw new Error("You can't disconnect from line directly, use function on its point instead.");
        };

        that.connections = function () {
            throw new Error("You can't get list of line connections directly, use function on its point instead.");
        };

        that.isLine = true;

        /**
         * Point cannot exist on itself, it is always a part of the line.
         *
         * @param spec
         */
        function point(spec, line) {
            var that = item();

            that._addObservableProperty("x", spec.x || 0);
            that._addObservableProperty("y", spec.y || 0);

            that.isLinePoint = true;
            that.line = line;

            return that;
        }


        return that;
    };
});

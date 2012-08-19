define(function(require) {
    "use strict";

    var utils = require("utils");

    return {

        renderFilterChain: function (view, filters) {

            // connect each filter to the filter following it
            var i;
            for (i = 1; i < filters.length; i++) {
                filters[i - 1]._next = filters[i];
            }
            // connect last filter to the view
            filters[i - 1]._next = view;

            return {
                rect: function (spec) {
                    spec = spec ? utils.copyShallow(spec) : {};
                    filters[0].rect(spec);
                },
                line: function (spec) {
                    spec = spec ? utils.copyShallow(spec) : {};
                    filters[0].line(spec);
                },
                text: function (spec) {
                    spec = spec ? utils.copyShallow(spec) : {};
                    return filters[0].text(spec);
                },
                measureText: function (spec) {
                    return filters[0].measureText(spec);
                },
                circle: function (spec) {
                    spec = spec ? utils.copyShallow(spec) : {};
                    filters[0].circle(spec);
                }
            };
        },

        // relative must go always last (because it has to set properties which would otherwise not be set,
        // e.g. if y is not set, it has to set dy there)
        /**
         * Translates all [x, y] coordinates by (dx, dy).
         *
         * @param dx
         * @param dy
         * @return {Object}
         */
        relative: function (dx, dy) {
            return {
                _next: null,
                rect: function (spec) {
                    spec = utils.copyShallow(spec);
                    spec.x = spec.x ? spec.x + dx : dx;
                    spec.y = spec.y ? spec.y + dy : dy;
                    return this._next.rect(spec);
                },
                line: function (spec) {
                    spec = utils.copyShallow(spec);
                    spec.x1 = spec.x1 ? spec.x1 + dx : dx;
                    spec.y1 = spec.y1 ? spec.y1 + dy : dy;
                    spec.x2 = spec.x2 ? spec.x2 + dx : dx;
                    spec.y2 = spec.y2 ? spec.y2 + dy : dy;
                    return this._next.line(spec);
                },
                text: function (spec) {
                    spec = utils.copyShallow(spec);
                    spec.x = spec.x ? spec.x + dx : dx;
                    spec.y = spec.y ? spec.y + dy : dy;
                    return this._next.text(spec);
                },
                measureText: function (spec) {
                    spec = utils.copyShallow(spec);
                    return this._next.measureText(spec);
                },
                circle: function (spec) {
                    spec = utils.copyShallow(spec);
                    spec.x = spec.x ? spec.x + dx : dx;
                    spec.y = spec.y ? spec.y + dy : dy;
                    return this._next.circle(spec);
                }
            };
        },

        verticalFlow: function (width) {
            var PADDING = 3; // vertical padding after the rendered element
            var lastY = PADDING;

            return {
                _next: null,
                rect: function (spec) {
                    spec = utils.copyShallow(spec);
                    throw new Error("Not implemented yet.");
                },
                line: function (spec) {
                    spec = utils.copyShallow(spec);
                    if (!spec.y1) {
                        spec.y1 = lastY;
                    }
                    if (!spec.y2) {
                        spec.y2 = lastY;
                    }
                    this._next.line(spec);
                    lastY = Math.max(spec.y1, spec.y2) + PADDING;
                },
                text: function (spec) {
                    spec = utils.copyShallow(spec);
                    if (!spec.y) {
                        spec.y = lastY;
                    }

                    var align = spec.align || "left";
                    var textSize;
                    if (align === "center") {
                        textSize = this._next.measureText({text: spec.text});
                        spec.x = 0;
                        if (width > textSize.width) {
                            spec.x = (width - textSize.width) / 2;
                        }
                    } else if (align === "right") {
                        throw new Error("TODO: not implemented yet.");
                    } else {
                        // left align by default
                        spec.x = spec.x ? spec.x + PADDING : PADDING;
                    }

                    textSize = this._next.text(spec);
                    lastY = spec.y + textSize.height + PADDING;
                    return textSize;
                },
                measureText: function (spec) {
                    spec = utils.copyShallow(spec);
                    return this._next.measureText(spec);
                },
                circle: function (spec) {
                    // TODO:
                    spec = utils.copyShallow(spec);
                    return this._next.circle(spec);
                }
            };
        }

    };
});

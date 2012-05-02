define(function(require) {
    "use strict";

    var utils = require("utils");


    // note that chain should always start with renderChain
    function renderChain(next) {
        return {
            rect: function (spec) {
                spec = spec ? utils.copyShallow(spec) : {};
                next.rect(spec);
            },
            line: function (spec) {
                spec = spec ? utils.copyShallow(spec) : {};
                next.line(spec);
            },
            text: function (spec) {
                spec = spec ? utils.copyShallow(spec) : {};
                return next.text(spec);
            }
        };
    }

    function verticalFlow(next) {
        var lastY = 0;
        var PADDING = 4; // padding is applied from the top and the left

        return {
            rect: function (spec) {
                throw new Error("Not supported right now.");
            },
            line: function (spec) {
                if (!spec.y1) {
                    spec.y1 = lastY;
                }
                if (!spec.y2) {
                    spec.y2 = lastY;
                }
                spec.y1 += PADDING;
                spec.y2 += PADDING;
                next.line(spec);
            },
            text: function (spec) {
                if (!spec.y) {
                    spec.y = lastY;
                }
                spec.x = spec.x ? spec.x + PADDING : PADDING;
                spec.y += PADDING;
                var textSize = next.text(spec);
                lastY += textSize.height + PADDING;
                return textSize;
            }
        };
    }

    function relative(next, dx, dy) {
        return {
            rect: function (spec) {
                spec.x = spec.x ? spec.x + dx : dx;
                spec.y = spec.y ? spec.y + dy : dy;
                return next.rect(spec);
            },
            line: function (spec) {
                spec.x1 = spec.x1 ? spec.x1 + dx : dx;
                spec.y1 = spec.y1 ? spec.y1 + dy : dy;
                spec.x2 = spec.x2 ? spec.x2 + dx : dx;
                spec.y2 = spec.y2 ? spec.y2 + dy : dy;
                return next.line(spec);
            },
            text: function (spec) {
                spec.x = spec.x ? spec.x + dx : dx;
                spec.y = spec.y ? spec.y + dy : dy;
                return next.text(spec);
            }
        };
    }

    /**
     * Parses text and returns:
     * 1) Object with properties set via {{property=value}}.
     * 2) Array of text lines (minus properties from point 1).
     *
     * @param text
     */
    function parseRenderText(text) {
        var res = {
            lines: [],
            properties: {}
        };

        var lines = text.split("\n");
        lines.forEach(function (line) {
            // TODO: I should allow escaping of {{
            var m = line.match(/^\{\{([^=]+)=([^}]+)\}\}$/);
            if (m === null) {
                // just ordinary line with text
                res.lines.push(line);
            } else {
                // line with property, add it to properties
                res.properties[m[1]] = m[2];
            }
        });

        return res;
    }


    return {

        /**
         * <code>nodeRendered</code> is responsible for rendering of the content of a node.
         * TODO: zacina to vypadat spis jako controller
         */
        nodeRenderer: function () {
            var that = {};

            that.TEXT_PADDING = 5;

            /**
             * You should always call this function before render. It returns <code>renderInfo</code>
             * object, which contains parsed properties ({{property=value}}) and lines of text. You can
             * freely modify this object.
             *
             * @param itemInfo
             * @return {Object}
             * @private
             */
            that._render = function(itemInfo) {
                var node = itemInfo.item;
                var nodeView = itemInfo.view;

                nodeView.clear();
                nodeView.updateView({x: node.x, y: node.y, width: node.width, height: node.height});
                nodeView.isSelected(itemInfo.isSelected);

                var parsedText = parseRenderText(node.text);
                var fillColor = parsedText.properties.fill || "white";
                var strokeColor = parsedText.properties.stroke || "black";

                return {
                    lines: parsedText.lines,
                    properties: parsedText.properties,
                    fillColor: fillColor,
                    strokeColor: strokeColor
                };
            };

            that.render = function (itemInfo) {
                var renderInfo = that._render(itemInfo);

                var node = itemInfo.item;
                var nodeView = itemInfo.view;

                nodeView.rect({x: node.x, y: node.y, width: node.width, height: node.height, rx: 3, ry: 3, fill: renderInfo.fillColor, stroke: renderInfo.strokeColor});

                var render = renderChain(verticalFlow(relative(nodeView, node.x, node.y)));
                render.text({lines: renderInfo.lines});
            };

            that.showNearbyConnectionPoint = function (node, nodeView, x, y, gridStep) {
                var nearestPoint;

                var cx1, cx2, cy1, cy2;

                var candidates = [];

                if (Math.abs(x - node.x) < gridStep) {
                    cy1 = Math.floor(y / gridStep) * gridStep;
                    cy2 = cy1 + gridStep;
                    candidates.push({x: node.x, y: cy1});
                    candidates.push({x: node.x, y: cy2});
                }
                if (Math.abs(x - (node.x + node.width)) < gridStep) {
                    cy1 = Math.floor(y / gridStep) * gridStep;
                    cy2 = cy1 + gridStep;
                    candidates.push({x: node.x + node.width, y: cy1});
                    candidates.push({x: node.x + node.width, y: cy2});
                }
                if (Math.abs(y - node.y) < gridStep) {
                    cx1 = Math.floor(x / gridStep) * gridStep;
                    cx2 = cx1 + gridStep;
                    candidates.push({x: cx1, y: node.y});
                    candidates.push({x: cx2, y: node.y});
                }
                if (Math.abs(y - (node.y + node.height)) < gridStep) {
                    cx1 = Math.floor(x / gridStep) * gridStep;
                    cx2 = cx1 + gridStep;
                    candidates.push({x: cx1, y: node.y + node.height});
                    candidates.push({x: cx2, y: node.y + node.height});
                }

                var minDistanceSquared = Infinity;
                candidates.forEach(function (c) {
                    var distanceSquared = Math.pow(Math.abs(c.x - x), 2) + Math.pow(Math.abs(c.y - y), 2);
                    if (distanceSquared < minDistanceSquared) {
                        nearestPoint = c;
                        minDistanceSquared = distanceSquared;
                    }
                });

                nodeView.hideConnectionPoints();
                if (nearestPoint) {
                    nodeView.showConnectionPoint(nearestPoint);
                }
            };

            return that;
        },

        classNodeRenderer: function () {
            var that = this.nodeRenderer();

            that.render = function (itemInfo) {
                var renderInfo = that._render(itemInfo);

                var node = itemInfo.item;
                var nodeView = itemInfo.view;

                nodeView.rect({x: node.x, y: node.y, width: node.width, height: node.height, rx: 3, ry: 3, fill: renderInfo.fillColor, stroke: renderInfo.strokeColor});

                var render = renderChain(verticalFlow(relative(nodeView, node.x, node.y)));

                renderInfo.lines.forEach(function (line) {
                    if (line === "--") {
                        render.line({x1: 0, x2: node.width, stroke: renderInfo.strokeColor});
                    } else {
                        render.text({text: line});
                    }
                });
            };

            return that;
        },

        useCaseNodeRenderer: function () {
            var that = this.nodeRenderer();

            that.render = function (itemInfo) {
                var renderInfo = that._render(itemInfo);

                var node = itemInfo.item;
                var nodeView = itemInfo.view;

                var halfWidth = node.width / 2;
                var halfHeight = node.height / 2;

                nodeView.ellipse({
                    cx: node.x + halfWidth,
                    cy: node.y + halfHeight,
                    rx: halfWidth,
                    ry: halfHeight,
                    fill: renderInfo.fillColor,
                    stroke: renderInfo.strokeColor
                });

                var render = renderChain(verticalFlow(relative(nodeView, node.x, node.y)));

                // TODO: center multi-line text correctly
                var textSize = nodeView.measureText({lines: renderInfo.lines});
                var textX = 0;
                if (node.width > textSize.width) {
                    textX = (node.width - textSize.width) / 2;
                }
                var textY = 0;
                if (node.height > textSize.height) {
                    textY = ((node.height - textSize.height) / 2);
                }


                render.text({x: textX, y: textY, lines: renderInfo.lines});
            };

            return that;
        },

        lineRenderer: function () {
            var that = {};

            that.render = function (itemInfo) {
                var line = itemInfo.item;
                var lineView = itemInfo.view;

                lineView.clear();
                lineView.updateView({x1: line.points(0).x, y1: line.points(0).y, x2: line.points(1).x, y2: line.points(1).y});
                lineView.isSelected(itemInfo.isSelected);

                lineView.line({x1: line.points(0).x, y1: line.points(0).y, x2: line.points(1).x, y2: line.points(1).y, stroke: "black"});
                // TODO: text
            };

            return that;
        }
    };
});
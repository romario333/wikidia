define(function(require) {
    "use strict";

    var renderFilters = require("presenter/renderFilters");

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

    var renderersMap;

    return {

        /**
         * Returns renderer for the specified item. Note that renderers are shared between items and thus
         * should not have any state.
         *
         * @param item
         */
        rendererForItem: function (item) {
            if (!renderersMap) {
                renderersMap = {
                    node: this.nodeRenderer(),
                    class: this.classNodeRenderer(),
                    useCase: this.useCaseNodeRenderer(),
                    line: this.lineRenderer(),
                    actor: this.actorRenderer(),
                    note: this.noteRenderer()
                };
                if (!renderersMap[item.kind]) {
                    throw new Error("I don't have renderer for item with kind '{kind}'".supplant({kind: item.kind}));
                }
            }
            return renderersMap[item.kind];
        },

        /**
         * `nodeRendered` is responsible for rendering of the content of a node.
         */
        nodeRenderer: function () {
            var that = {};

            that.TEXT_PADDING = 5;

            /**
             * You should always call this function before render. It returns <code>renderInfo</code>
             * object, which contains parsed properties ({{property=value}}) and lines of text. You are
             * free to further modify this object.
             *
             * @param itemInfo
             * @return {Object}
             * @private
             */
            that._render = function(itemInfo) {
                // TODO: proc se tak strasne branim stavu tady?
                var node = itemInfo.item;
                var nodeView = itemInfo.view;

                nodeView.clear();
                nodeView.updateBounds({x: node.x, y: node.y, width: node.width, height: node.height});
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

                var render = renderFilters.renderFilterChain(nodeView, [
                    renderFilters.verticalFlow(node.width),
                    renderFilters.relative(node.x, node.y)
                ]);

                renderInfo.lines.forEach(function (line) {
                    render.text({text: line});
                });
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

                if (nearestPoint) {
                    nodeView.showConnectionPoint(nearestPoint);
                } else {
                    nodeView.hideConnectionPoints();
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

                var render = renderFilters.renderFilterChain(nodeView, [
                    renderFilters.verticalFlow(node.width),
                    renderFilters.relative(node.x, node.y)
                ]);

                var isFirstSection = true;
                renderInfo.lines.forEach(function (line) {
                    if (line === "--") {
                        render.line({x1: 0, x2: node.width, stroke: renderInfo.strokeColor});
                        isFirstSection = false;
                    } else {
                        render.text({text: line, align: isFirstSection ? "center" : "left"});
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
                    stroke: renderInfo.strokeColor,
                    "stroke-width": 1.5
                });

                var render = renderFilters.renderFilterChain(nodeView, [
                    renderFilters.verticalFlow(node.width),
                    renderFilters.relative(node.x, node.y)
                ]);

                var textHeight = 0, textStartY = 0;
                renderInfo.lines.forEach(function (line) {
                    textHeight += nodeView.measureText({text: line}).height;
                });
                if (node.height > textHeight) {
                    textStartY = ((node.height - textHeight) / 2);
                }

                renderInfo.lines.forEach(function (line, index) {
                    if (index === 0) {
                        // text is centered vertically, offset first line
                        render.text({y: textStartY, text: line, align: "center"});
                    } else {
                        render.text({text: line, align: "center"});
                    }
                });
            };

            return that;
        },

        actorRenderer: function () {
            var that = this.nodeRenderer();

            that.render = function (itemInfo) {
                var renderInfo = that._render(itemInfo);

                var node = itemInfo.item;
                var nodeView = itemInfo.view;

                var textHeight = 0;
                renderInfo.lines.forEach(function (line) {
                    textHeight += nodeView.measureText({text: line}).height;
                });

                var actorHeight = Math.min(node.height - textHeight, node.height);

                var x = node.x, y = node.y;

                nodeView.circle({
                    cx: x + node.width / 2,
                    cy: y + actorHeight / 6,
                    r: Math.min(node.width / 2, actorHeight / 6),
                    stroke: renderInfo.strokeColor,
                    fill: renderInfo.fillColor,
                    "stroke-width": 1.5
                });
                var path = nodeView.path({stroke: renderInfo.strokeColor, "stroke-width": 1.5});
                // spine
                path.moveTo(x + node.width / 2, y + actorHeight / 3)
                    .lineTo(x + node.width / 2, y + 2 * actorHeight / 3)
                // legs
                    .moveTo(x + node.width / 2, y + 2 * actorHeight / 3)
                    .lineTo(x, y + actorHeight)
                    .moveTo(x + node.width / 2, y + 2 * actorHeight / 3)
                    .lineTo(x + node.width, y + actorHeight)
//                // arms
                    .moveTo(x, y + actorHeight / 2.5)
                    .lineTo(x + node.width, y + actorHeight / 2.5)
                    .done();


                var render = renderFilters.renderFilterChain(nodeView, [
                    renderFilters.verticalFlow(node.width),
                    renderFilters.relative(x, y + actorHeight)
                ]);

                renderInfo.lines.forEach(function (line) {
                    render.text({text: line, align: "center"});
                });
            };

            return that;
        },

        noteRenderer: function () {
            var that = this.nodeRenderer();

            that.render = function (itemInfo) {
                var renderInfo = that._render(itemInfo);

                var node = itemInfo.item;
                var nodeView = itemInfo.view;

                var edgeSize = 20;

                var x = node.x, y = node.y, width = node.width, height = node.height;

                var path = nodeView.path({stroke: renderInfo.strokeColor, "stroke-width": 1.5, fill: renderInfo.fillColor});

                // note edge
                path.moveTo(x + width - edgeSize, y)
                    .lineTo(x + width - edgeSize, y + edgeSize)
                    .lineTo(x + width, y + edgeSize)
                    .lineTo(x + width - edgeSize, y)
                    // draw the rest of the note
                    .lineTo(x, y)
                    .lineTo(x, y + height)
                    .lineTo(x + width, y + height)
                    .lineTo(x + width, y + edgeSize)
                    .done();

                var render = renderFilters.renderFilterChain(nodeView, [
                    renderFilters.verticalFlow(node.width),
                    renderFilters.relative(x, y)
                ]);

                renderInfo.lines.forEach(function (line) {
                    render.text({text: line});
                });
            };

            return that;
        },

        lineRenderer: function () {
            var that = {};

            that.render = function (itemInfo) {
                var x, y;

                var line = itemInfo.item;
                var lineView = itemInfo.view;

                var parsedText = parseRenderText(line.text);

                var lineTypeString = parsedText.properties.lineType || "->";

                var renderInfo = {
                    x1: line.points(0).x,
                    y1: line.points(0).y,
                    x2: line.points(1).x,
                    y2: line.points(1).y,
                    strokeColor: parsedText.properties.stroke || "black",
                    fillColor: parsedText.properties.fill || "white",
                    lineType: lineTypeString.substr(0, 1),
                    headType: lineTypeString.substr(1),
                    lines: parsedText.lines
                };

                if (renderInfo.headType == "<<>>") {
                    // full diamond
                    renderInfo.fillColor = renderInfo.strokeColor;
                }


                lineView.clear();
                lineView.updateBounds(renderInfo);
                lineView.isSelected(itemInfo.isSelected);

                var lineSpec = {
                    x1: renderInfo.x1,
                    y1: renderInfo.y1,
                    x2: renderInfo.x2,
                    y2: renderInfo.y2,
                    stroke: renderInfo.strokeColor,
                    "stroke-width": 1.5,
                    fill: renderInfo.fillColor
                };
                if (renderInfo.lineType == ".") {
                    lineSpec["stroke-dasharray"] = "8 5";
                }
                lineView.line(lineSpec);

                if (renderInfo.headType !== "") {
                    // draw arrow head
                    var headLength = 20;
                    var angle = Math.atan2(renderInfo.y2 - renderInfo.y1, renderInfo.x2 - renderInfo.x1);
                    var path = lineView.path({stroke: renderInfo.strokeColor, "stroke-width": 1.5, fill: renderInfo.fillColor});

                    if (renderInfo.headType === ">") {
                        // simple arrow head
                        path.moveTo(renderInfo.x2, renderInfo.y2)
                            .lineTo(renderInfo.x2 - headLength * Math.cos(angle - Math.PI / 6), renderInfo.y2 - headLength * Math.sin(angle - Math.PI / 6))
                            .moveTo(renderInfo.x2, renderInfo.y2)
                            .lineTo(renderInfo.x2 - headLength * Math.cos(angle + Math.PI / 6), renderInfo.y2 - headLength * Math.sin(angle + Math.PI / 6))
                            .moveTo(renderInfo.x2, renderInfo.y2);
                    } else if (renderInfo.headType === ">>") {
                        // triangle arrow head
                        path.moveTo(renderInfo.x2, renderInfo.y2)
                            .lineTo(renderInfo.x2 - headLength * Math.cos(angle - Math.PI / 6), renderInfo.y2 - headLength * Math.sin(angle - Math.PI / 6))
                            .lineTo(renderInfo.x2 - headLength * Math.cos(angle + Math.PI / 6), renderInfo.y2 - headLength * Math.sin(angle + Math.PI / 6))
                            .closePath();
                    } else if (renderInfo.headType === "<>" || renderInfo.headType === "<<>>") {
                        // diamond arrow head
                       x = renderInfo.x2;
                       y = renderInfo.y2;
                       path.moveTo(x, y);
                       x = x - headLength * Math.cos(angle - Math.PI / 6);
                       y = y - headLength * Math.sin(angle - Math.PI / 6);
                       path.lineTo(x ,y);
                       x = x - headLength * Math.cos(angle + Math.PI / 6);
                       y = y - headLength * Math.sin(angle + Math.PI / 6);
                       path.lineTo(x ,y);
                       x = x + headLength * Math.cos(angle - Math.PI / 6)
                       y = y + headLength * Math.sin(angle - Math.PI / 6)
                       path.lineTo(x ,y);
                       path.closePath();
                    }

                    path.done();
                }

                // render text (identical logic as for use-case)
                if (renderInfo.lines.length > 0) {
                    x = Math.min(renderInfo.x1, renderInfo.x2);
                    y = Math.min(renderInfo.y1, renderInfo.y2);
                    var width = Math.max(renderInfo.x1, renderInfo.x2) - x;
                    var height = Math.max(renderInfo.y1, renderInfo.y2) - y;

                    var render = renderFilters.renderFilterChain(lineView, [
                        renderFilters.verticalFlow(width),
                        renderFilters.relative(x, y)
                    ]);

                    var textHeight = 0, textStartY = 0;
                    renderInfo.lines.forEach(function (line) {
                        textHeight += lineView.measureText({text: line}).height;
                    });
                    if (height > textHeight) {
                        textStartY = ((height - textHeight) / 2);
                    }

                    renderInfo.lines.forEach(function (line, index) {
                        if (index === 0) {
                            // text is centered vertically, offset first line
                            render.text({y: textStartY, text: line, align: "center"});
                        } else {
                            render.text({text: line, align: "center"});
                        }
                    });
                }
            };

            return that;
        }
    };
});
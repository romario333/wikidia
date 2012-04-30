define(function(require) {
    "use strict";

    return {

        /**
         * <code>nodeRendered</code> is responsible for rendering of the content of a node.
         * TODO: zacina to vypadat spis jako controller
         */
        nodeRenderer: function () {
            var that = {};

            that.render = function (item) {
                var node = item.data;
                var nodeView = item.view;

                nodeView.clear();
                nodeView.updateView({x: node.x, y: node.y, width: node.width, height: node.height});
                nodeView.isSelected(item.isSelected);

                nodeView.rect({x: node.x, y: node.y, width: node.width, height: node.height, rx: 3, ry: 3, fill: "#A1BF36", stroke: "black"});
                nodeView.text(node.text);
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

        useCaseNodeRenderer: function () {
            var that = this.nodeRenderer();

            that.render = function (item) {
                var node = item.data;
                var nodeView = item.view;

                nodeView.clear();
                nodeView.updateView({x: node.x, y: node.y, width: node.width, height: node.height});
                nodeView.isSelected(item.isSelected);

                var halfWidth = node.width / 2;
                var halfHeight = node.height / 2;

                nodeView.ellipse({
                    cx: node.x + halfWidth,
                    cy: node.y + halfHeight,
                    rx: halfWidth,
                    ry: halfHeight,
                    fill: "#A1BF36",
                    stroke: "black"
                });
                nodeView.text(node.text);
            };

            return that;
        },

        lineRenderer: function () {
            var that = {};

            that.render = function (item) {
                var line = item.data;
                var lineView = item.view;

                lineView.clear();
                lineView.updateView({x1: line.points(0).x, y1: line.points(0).y, x2: line.points(1).x, y2: line.points(1).y});
                lineView.isSelected(item.isSelected);

                lineView.line({x1: line.points(0).x, y1: line.points(0).y, x2: line.points(1).x, y2: line.points(1).y, stroke: "black"});
                // TODO: text
            };

            return that;
        }
    };
});
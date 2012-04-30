/*global describe, beforeEach, it, expect, spyOn*/
define(function(require, exports, module) {
    "use strict";

    var model = require("model");

    describe("item", function () {
        var handler;
        var diagram;

        beforeEach(function () {
            handler = {change: function () {}};
            spyOn(handler, "change");
            diagram = model.diagram();
        });

        function createNode(spec) {
            var node = model.node(spec);
            diagram.addItem(node);
            return node;
        }

        function createLine(spec) {
            var line = model.line(spec);
            diagram.addItem(line);
            return line;
        }

        it("connection to item without id cannot be added", function () {
            var node1 = model.node();
            var node2 = model.node();

            node1.id = 1;
            node2.id = null;
            expect(function () {
                node1.addConnection(node2);
            }).toThrow("Cannot add connection to item, it has no id set.");

            node1.id = null;
            node2.id = 1;
            expect(function () {
                node1.addConnection(node2);
            }).toThrow("Cannot add connection to item, it has no id set.");
        });

        it("connections are added on both sides of connection", function () {
            var node = createNode();
            var line = createLine();
            var nodeHandler = {change: function () {}};
            spyOn(nodeHandler, "change");
            var lineHandler = {change: function () {}};
            spyOn(lineHandler, "change");

            node.change(nodeHandler.change);
            line.change(lineHandler.change);

            node.addConnection(line.points(0));

            expect(nodeHandler.change).toHaveBeenCalledWith(node);
            expect(lineHandler.change).toHaveBeenCalledWith(line);

            expect(node.connections()).toContain(line.points(0));
            expect(line.points(0).connections()).toContain(node);
        });

        it("connections are removed on both sides of connection", function () {
            var node = createNode();
            var line = createLine();
            node.addConnection(line.points(0));

            var nodeHandler = {change: function () {}};
            spyOn(nodeHandler, "change");
            var lineHandler = {change: function () {}};
            spyOn(lineHandler, "change");

            node.change(nodeHandler.change);
            line.change(lineHandler.change);

            node.removeConnection(line.points(0));

            expect(nodeHandler.change).toHaveBeenCalledWith(node);
            expect(lineHandler.change).toHaveBeenCalledWith(line);

            expect(node.connections()).not.toContain(line);
            expect(line.points(0).connections()).not.toContain(node);
        });

        it("you can manipulate connections only via addConnection/removeConnection function", function () {
            var node = createNode();
            var line = createLine();

            node.connections().push(line.points(0));
            expect(node.connections()).not.toContain(line.points(0));
        });

        it("fails when you try to remove connection which is not in connections", function () {
            var node = createNode();
            var line = createLine();

            expect(function () {
                node.removeConnection(line.points(0));
            }).toThrow("Item '3' not found in connections of item '1'.");
        });
    });

});
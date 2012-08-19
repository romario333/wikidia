/*global describe, beforeEach, it, expect, spyOn*/
define(function(require, exports, module) {
    "use strict";

    var model = require("model");

    describe("node", function () {
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

        it("has sane defaults", function () {
            var node = createNode();
            expect(node.text).toEqual("");
            expect(node.x).toEqual(0);
            expect(node.y).toEqual(0);
        });

        it("fires change event when its property is changed", function () {
            var node = createNode({x: 10});
            node.change(handler.change);

            node.x = 10;
            // value hasn't changed, no change event should be fired
            expect(handler.change).not.toHaveBeenCalled();

            node.x = 20;
            expect(handler.change).toHaveBeenCalledWith(node);

            // when you manipulate connections, change event should be fired
            handler.change.reset();
            var line = createLine();
            node.addConnection(line);
            expect(handler.change).toHaveBeenCalledWith(node);
            node.removeConnection(line);
            expect(handler.change).toHaveBeenCalledWith(node);
        });

        it("doesn't fire change event when fireChange is false", function () {
            var node = createNode({x: 10});
            node.change(handler.change);

            node.changeEventsEnabled(false);
            node.x = 20;
            expect(handler.change).not.toHaveBeenCalled();

            var line = createLine();
            node.addConnection(line);
            expect(handler.change).not.toHaveBeenCalled();
            node.removeConnection(line);
            expect(handler.change).not.toHaveBeenCalled();
        });

        it("allows you to fire change event manually", function () {
            var node = createNode();
            node.change(handler.change);

            node.fireChange();
            expect(handler.change).toHaveBeenCalledWith(node);
        });

        it("allows you to add connection to line", function () {
            var node = createNode();
            var line1 = createLine();
            var line2 = createLine();

            node.addConnection(line1);
            node.addConnection(line2);

            var connections = node.connections();
            expect(connections.length).toEqual(2);
            expect(connections).toContain(line1);
            expect(connections).toContain(line2);
        });

        it("if you move node, connected lines are moved too", function () {
            var node = createNode({x: 10, y: 10, width: 100, height: 100});
            var line = createLine({x1: 110, y1:110, x2: 200, y2: 200});
            node.addConnection(line.points(0));

            node.moveTo(20, 30);

            expect(line.points(0).x).toEqual(120);
            expect(line.points(0).y).toEqual(130);
            expect(line.points(1).x).toEqual(200);
            expect(line.points(1).y).toEqual(200);
        });

        it("if you resize node, connected lines are moved (if necessary)", function () {
            var node = createNode({x: 10, y: 10, width: 100, height: 100});

            var lineN = createLine({x1: 50, y1:10, x2: 0, y2: 0});
            var lineS = createLine({x1: 50, y1:110, x2: 0, y2: 0});
            var lineW = createLine({x1: 10, y1:50, x2: 0, y2: 0});
            var lineE = createLine({x1: 110, y1:50, x2: 0, y2: 0});

            node.addConnection(lineN.points(0));
            node.addConnection(lineS.points(0));
            node.addConnection(lineW.points(0));
            node.addConnection(lineE.points(0));

            node.resizeTo(90, 80);

            // line connected to the north edge shouldn't move
            expect(lineN.points(0).x).toEqual(50);
            expect(lineN.points(0).y).toEqual(10);
            expect(lineN.points(1).x).toEqual(0);
            expect(lineN.points(1).y).toEqual(0);

            // south line have updated position
            expect(lineS.points(0).x).toEqual(50);
            expect(lineS.points(0).y).toEqual(90);
            expect(lineS.points(1).x).toEqual(0);
            expect(lineS.points(1).y).toEqual(0);

            // west line shouldn't move
            expect(lineW.points(0).x).toEqual(10);
            expect(lineW.points(0).y).toEqual(50);
            expect(lineW.points(1).x).toEqual(0);
            expect(lineW.points(1).y).toEqual(0);

            // east line have updated position
            expect(lineE.points(0).x).toEqual(100);
            expect(lineE.points(0).y).toEqual(50);
            expect(lineE.points(1).x).toEqual(0);
            expect(lineE.points(1).y).toEqual(0);

        });

//        it("can create copy of itself", function () {
//            var node = createNode({x: 1, y: 2, width: 3, height: 4, text: "original"});
//            var line1 = createLine();
//            var line2 = createLine();
//            node.addConnection(line1);
//            node.change(handler.change);
//
//            var nodeCopy = node.copyShallow();
//
//            nodeCopy.text = "copy";
//            expect(nodeCopy.text).toEqual("copy");
//            expect(node.text).toEqual("original");
//
//            nodeCopy.id = 100; // nodeCopy needs id, otherwise adding of connection would fail
//            nodeCopy.addConnection(line2);
//            expect(node.connections()[0]).toBe(nodeCopy.connections()[0]);
//            expect(node.connections().length).toEqual(1);
//            expect(nodeCopy.connections().length).toEqual(2);
//
//            nodeCopy.change(handler.change);
//            expect(node._test.onChangeHandlers.length).toEqual(1);
//            expect(nodeCopy._test.onChangeHandlers.length).toEqual(2);
//        });


    });

});
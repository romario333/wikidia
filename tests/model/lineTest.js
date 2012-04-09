/*global WIKIDIA, describe, beforeEach, it, expect, spyOn*/

describe("line", function () {
    "use strict";

    var handler;
    var diagram;

    beforeEach(function () {
        handler = {change: function () {}};
        spyOn(handler, "change");
        diagram = WIKIDIA.model.diagram();
    });

    function createNode(spec) {
        var node = WIKIDIA.model.node(spec);
        diagram.addItem(node);
        return node;
    }

    function createLine(spec) {
        var line = WIKIDIA.model.line(spec);
        diagram.addItem(line);
        return line;
    }

    it("has sane defaults", function () {
        var line = createLine();
        expect(line.text).toEqual("");
        expect(line.points().length).toEqual(2);
        line.points().forEach(function (point) {
            expect(point.x).toEqual(0);
            expect(point.y).toEqual(0);
            expect(point.line).toBe(line);
        });
    });

    it("can return point by its coordinates", function () {
        var line = createLine({x1: 1, y1: 2, x2: 3, y2: 4});
        var point1 = line.points(0);
        var point2 = line.points(1);

        expect(line.point(1, 2)).toBe(point1);
        expect(line.point(3, 4)).toBe(point2);

        expect(function () {
            line.point(-1, -2);
        }).toThrow("Point [-1, -2] not found on line with id '1'.");
    });

    it("fires change event when its property is changed", function () {
        var line = createLine({text: "test"});
        line.change(handler.change);

        line.text = "test";
        // value hasn't changed, no change event should be fired
        expect(handler.change).not.toHaveBeenCalled();

        line.text = "changed";
        expect(handler.change).toHaveBeenCalledWith(line);
    });

    it("fires change event for line when point is manipulated", function () {
        var line = createLine({text: "test"});
        line.change(handler.change);

        line.points(0).x = 10;
        expect(handler.change).toHaveBeenCalledWith(line);
    });

    it("doesn't fire change event when fireChange is false", function () {
        var line = createLine({text: "test"});
        line.change(handler.change);

        line.changeEventsEnabled(false);
        line.text = "changed";
        expect(handler.change).not.toHaveBeenCalled();

        var node = createNode();
        line.points(0).addConnection(node);
        expect(handler.change).not.toHaveBeenCalled();
        line.points(0).removeConnection(node);
        expect(handler.change).not.toHaveBeenCalled();

        line.points(0).x = 10;
        expect(handler.change).not.toHaveBeenCalled();
    });

    it("allows you to fire change event manually", function () {
        var line = createLine();
        line.change(handler.change);

        line.changeEventsEnabled(false);
        line.fireChange();
        expect(handler.change).toHaveBeenCalledWith(line);
    });

    it("point does not have change event related methods", function () {
        var line = createLine();
        expect(function () {
            line.points(0).change(function () {});
        }).toThrow("Object #<Object> has no method 'change'");

        expect(function () {
            line.points(0).fireChange();
        }).toThrow("Object #<Object> has no method 'fireChange'");

        expect(function () {
            line.points(0).changeEventsEnabled(false);
        }).toThrow("Object #<Object> has no method 'changeEventsEnabled'");

    });

    it("you can't connect directly to line", function () {
        var line = createLine();
        var node = createNode();

        expect(function () {
            line.addConnection(node);
        }).toThrow("You can't connect to line directly, use function on its point instead.");
    });

    it("allows you to add connection to other line point or node", function () {
        var line = createLine();
        var line1 = createLine();
        var node = createNode();

        line.points(0).addConnection(line1.points(0));
        line.points(0).addConnection(node);

        var connections = line.points(0).connections();
        expect(connections.length).toEqual(2);
        expect(connections).toContain(line1.points(0));
        expect(connections).toContain(node);
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

//    it("can create shallow copy of itself", function () {
//        var line = createLine({x1: 1, y1: 2, x2: 3, y2: 4, text: "original"});
//        var line1 = createLine();
//        var line2 = createLine();
//        line.addConnection(line1);
//        line.change(handler.change);
//
//        var lineCopy = line.copyShallow();
//
//        lineCopy.text = "copy";
//        expect(lineCopy.text).toEqual("copy");
//        expect(line.text).toEqual("original");
//
//        lineCopy.id = 100; // lineCopy needs id, otherwise adding of connection would fail
//        lineCopy.addConnection(line2);
//        expect(line.connections()[0]).toBe(lineCopy.connections()[0]);
//        expect(line.connections().length).toEqual(1);
//        expect(lineCopy.connections().length).toEqual(2);
//
//        lineCopy.change(handler.change);
//        expect(line._test.onChangeHandlers.length).toEqual(1);
//        expect(lineCopy._test.onChangeHandlers.length).toEqual(2);
//    });

    it("connection to item without id cannot be added", function () {
        var line1 = WIKIDIA.model.line();
        var line2 = WIKIDIA.model.line();

        line1.points(0).id = 1;
        line2.points(0).id = null;
        expect(function () {
            line1.points(0).addConnection(line2.points(0));
        }).toThrow("Cannot add connection to item, it has no id set.");

        line1.points(0).id = null;
        line2.points(0).id = 1;
        expect(function () {
            line1.points(0).addConnection(line2.points(0));
        }).toThrow("Cannot add connection to item, it has no id set.");
    });

});
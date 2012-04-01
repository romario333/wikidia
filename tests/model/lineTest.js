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
        expect(line.x1).toEqual(0);
        expect(line.y1).toEqual(0);
    });

    it("fires change event when its property is changed", function () {
        var line = createLine({x1: 10});
        line.change(handler.change);

        line.x1 = 10;
        // value hasn't changed, no change event should be fired
        expect(handler.change).not.toHaveBeenCalled();

        line.x1 = 20;
        expect(handler.change).toHaveBeenCalledWith(line);

        // when you manipulate connections, change event should be fired
        var node = createNode();
        line.addConnection(node);
        expect(handler.change).toHaveBeenCalledWith(line);
        line.removeConnection(node);
        expect(handler.change).toHaveBeenCalledWith(line);
    });

    it("doesn't fire change event when fireChange is false", function () {
        var line = createLine({x: 10});
        line.change(handler.change);

        line.changeEventsEnabled = false;
        line.x = 20;
        expect(handler.change).not.toHaveBeenCalled();

        var node = createNode();
        line.addConnection(node);
        expect(handler.change).not.toHaveBeenCalled();
        line.removeConnection(node);
        expect(handler.change).not.toHaveBeenCalled();
    });

    it("allows you to fire change event manually", function () {
        var line = createLine();
        line.change(handler.change);

        line.fireChange();
        expect(handler.change).toHaveBeenCalledWith(line);
    });

    it("allows you to add connection to a line or node", function () {
        var line = createLine();
        var line1 = createLine();
        var node = createNode();

        line.addConnection(line1);
        line.addConnection(node);

        var connections = line.connections();
        expect(connections.length).toEqual(2);
        expect(connections).toContain(line1);
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

        node.addConnection(line);

        expect(nodeHandler.change).toHaveBeenCalledWith(node);
        expect(lineHandler.change).toHaveBeenCalledWith(line);

        expect(node.connections()).toContain(line);
        expect(line.connections()).toContain(node);
    });

    it("connections are removed on both sides of connection", function () {
        var node = createNode();
        var line = createLine();
        node.addConnection(line);

        var nodeHandler = {change: function () {}};
        spyOn(nodeHandler, "change");
        var lineHandler = {change: function () {}};
        spyOn(lineHandler, "change");

        node.change(nodeHandler.change);
        line.change(lineHandler.change);

        node.removeConnection(line);

        expect(nodeHandler.change).toHaveBeenCalledWith(node);
        expect(lineHandler.change).toHaveBeenCalledWith(line);

        expect(node.connections()).not.toContain(line);
        expect(line.connections()).not.toContain(node);
    });

    it("can create shallow copy of itself", function () {
        var line = createLine({x1: 1, y1: 2, x2: 3, y2: 4, text: "original"});
        var line1 = createLine();
        var line2 = createLine();
        line.addConnection(line1);
        line.change(handler.change);

        var lineCopy = line.copyShallow();

        lineCopy.text = "copy";
        expect(lineCopy.text).toEqual("copy");
        expect(line.text).toEqual("original");

        lineCopy.id = 100; // lineCopy needs id, otherwise adding of connection would fail
        lineCopy.addConnection(line2);
        expect(line.connections()[0]).toBe(lineCopy.connections()[0]);
        expect(line.connections().length).toEqual(1);
        expect(lineCopy.connections().length).toEqual(2);

        lineCopy.change(handler.change);
        expect(line._test.onChangeHandlers.length).toEqual(1);
        expect(lineCopy._test.onChangeHandlers.length).toEqual(2);
    });

    it("connection to item without id cannot be added", function () {
        var line1 = WIKIDIA.model.line();
        var line2 = WIKIDIA.model.line();

        line1.id = 1;
        line2.id = null;
        expect(function () {
            line1.addConnection(line2);
        }).toThrow("Cannot add connection to item, it has no id set.");

        line1.id = null;
        line2.id = 1;
        expect(function () {
            line1.addConnection(line2);
        }).toThrow("Cannot add connection to item, it has no id set.");
    });


});
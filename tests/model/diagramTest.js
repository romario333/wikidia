/*global WIKIDIA, describe, beforeEach, it, expect, spyOn*/

describe("diagram", function () {
    "use strict";

    var diagram;
    var handler;

    beforeEach(function () {
        diagram = WIKIDIA.model.diagram();
        handler = {itemAdded: function () {}, itemRemoved: function () {}};
        spyOn(handler, "itemAdded");
        spyOn(handler, "itemRemoved");
    });

    it("can hold lines and nodes", function () {
        var node = WIKIDIA.model.node();
        var line = WIKIDIA.model.line();

        diagram.addItem(node);
        diagram.addItem(line);

        expect(diagram.items().length).toEqual(2);
        expect(diagram.items()).toContain(node);
        expect(diagram.items()).toContain(line);
    });

    it("can notify when item is added or removed", function () {
        var node = WIKIDIA.model.node();
        var line = WIKIDIA.model.line();
        diagram.itemAdded(handler.itemAdded);
        diagram.itemRemoved(handler.itemRemoved);

        diagram.addItem(node);
        expect(handler.itemAdded).toHaveBeenCalledWith(diagram, node);
        diagram.addItem(line);
        expect(handler.itemAdded).toHaveBeenCalledWith(diagram, line);

        diagram.removeItem(node);
        expect(handler.itemRemoved).toHaveBeenCalledWith(diagram, node);
        diagram.removeItem(line);
        expect(handler.itemRemoved).toHaveBeenCalledWith(diagram, line);
    });


    it("event notification can be disabled", function () {
        var node = WIKIDIA.model.node();
        var line = WIKIDIA.model.line();
        diagram.itemAdded(handler.itemAdded);
        diagram.itemRemoved(handler.itemRemoved);

        diagram.changeEventsEnabled(false);

        diagram.addItem(node);
        expect(handler.itemAdded).not.toHaveBeenCalled();
        diagram.removeItem(node);
        expect(handler.itemRemoved).not.toHaveBeenCalled();

        diagram.changeEventsEnabled(true);

        diagram.addItem(node);
        expect(handler.itemAdded).toHaveBeenCalledWith(diagram, node);
        diagram.removeItem(node);
        expect(handler.itemRemoved).toHaveBeenCalledWith(diagram, node);
    });

    it("every item is given unique id when it's added to diagram, and this id is unset when it is removed from diagram", function () {
        var node = WIKIDIA.model.node();
        var line = WIKIDIA.model.line();

        expect(node.id).toBeNull();
        expect(line.id).toBeNull();

        diagram.addItem(node);
        diagram.addItem(line);

        expect(node.id).not.toBeNull();
        expect(line.id).not.toBeNull();
        expect(node.id).not.toEqual(line.id);

        diagram.removeItem(node);
        diagram.removeItem(line);

        expect(node.id).toBeNull();
        expect(line.id).toBeNull();

        // TODO: test points
    });

});
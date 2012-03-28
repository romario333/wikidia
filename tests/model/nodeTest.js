/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("nodeTest", function () {
    "use strict";

    beforeEach(function () {
    });

    it("has sane defaults", function () {
        var node = WIKIDIA.model.node();
        expect(node.text).toEqual("");
        expect(node.x).toEqual(0);
        expect(node.y).toEqual(0);
    });

    it("fires change event when its property is changed", function () {
        var handler = {change: function () {}};
        spyOn(handler, "change");
        var node = WIKIDIA.model.node({x: 10});
        node.change(handler.change);

        node.x = 10;
        // value hasn't changed, no change event should be fired
        expect(handler.change).not.toHaveBeenCalled();

        node.x = 20;
        expect(handler.change).toHaveBeenCalledWith(node);
    });

    it("doesn't fire change event when fireChange is false", function () {
        var handler = {change: function () {}};
        spyOn(handler, "change");
        var node = WIKIDIA.model.node({x: 10});
        node.change(handler.change);

        node.changeEventEnabled = false;
        node.x = 20;
        expect(handler.change).not.toHaveBeenCalledWith(node);
    });

    it("allows you to fire change event manually", function () {
        var handler = {change: function () {}};
        spyOn(handler, "change");
        var node = WIKIDIA.model.node();
        node.change(handler.change);

        node.fireChange();
        expect(handler.change).toHaveBeenCalledWith(node);
    });
});
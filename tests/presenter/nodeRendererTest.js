/*global WIKIDIA, describe, beforeEach, it, expect, spyOn*/

describe("nodeRenderer", function () {
    "use strict";

    var nodeRenderer;
    var nodeView;

    beforeEach(function () {
        nodeRenderer = WIKIDIA.presenter.nodeRenderer();
        nodeView = {
            clear: function () {},
            rect: function () {}
        };

        spyOn(nodeView, "clear");
        spyOn(nodeView, "rect");
    });

    it("draws rectangle", function () {
        var node = WIKIDIA.model.node({x: 1, y: 2, width: 3, height: 4});

        nodeRenderer.render(node, nodeView);

        expect(nodeView.clear).toHaveBeenCalled();
        expect(nodeView.rect).toHaveBeenCalledWith({x: 1, y: 2, width: 3, height: 4, rx: 3, ry: 3});
    });
});
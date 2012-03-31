/*global WIKIDIA, describe, beforeEach, it, expect, spyOn*/

describe("nodeRenderer", function () {
    "use strict";

    var nodeRenderer;
    var nodeView;

    beforeEach(function () {
        nodeRenderer = WIKIDIA.presenter.nodeRenderer();
        nodeView = {
            clear: function () {},
            rect: function () {},
            text: function () {},
            updateView: function () {}
        };

        spyOn(nodeView, "clear");
        spyOn(nodeView, "rect");
        spyOn(nodeView, "text");
        spyOn(nodeView, "updateView");
    });

    it("draws rectangle and renders text", function () {
        var node = WIKIDIA.model.node({x: 1, y: 2, width: 3, height: 4});

        nodeRenderer.render(node, nodeView);

        // TODO: I don't know, this looks useless to me
        expect(nodeView.clear).toHaveBeenCalled();
        expect(nodeView.rect).toHaveBeenCalledWith({x: 1, y: 2, width: 3, height: 4, rx: 3, ry: 3, fill: '#A1BF36', stroke: 'black'});
        expect(nodeView.updateView).toHaveBeenCalledWith({x: 1, y: 2, width: 3, height: 4});
    });


});
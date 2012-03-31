/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("nodeView", function () {
    "use strict";

    var nodeView;

    beforeEach(function () {
        var rootView = WIKIDIA.view.svg.rootView($("<div></div>"));
        var diagramView = WIKIDIA.view.svg.diagramView(rootView);
        var node = WIKIDIA.model.node({x: 10, y: 20});

        nodeView = WIKIDIA.view.svg.nodeView(diagramView, node);
    });

    it("can draw rectangles", function () {
        nodeView.rect({x: 10, y: 20, width: 30, height: 40, rx: 1, ry: 2});
        expect(nodeView._test.contentSvg()).toEqual('<rect x="10" y="20" width="30" height="40" rx="1" ry="2"></rect>');
    });

    it("can draw text", function () {
        nodeView.text("test");
        //expect(nodeView._test.contentSvg()).toEqual('<text ')
    });




});
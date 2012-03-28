/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("nodeView", function () {
    "use strict";

    var nodeView;

    beforeEach(function () {
        var rootView = WIKIDIA.view.svg.rootView($("<div></div>"));
        var diagramView = WIKIDIA.view.svg.diagramView(rootView);

        nodeView = WIKIDIA.view.svg.nodeView(diagramView);
    });

    it("can draw rectangles", function () {
        nodeView.rect({x: 10, y: 20, width: 30, height: 40, rx: 1, ry: 2});
        expect(nodeView._test.svg()).toEqual('<g class="node"><rect x="10" y="20" width="30" height="40" rx="1" ry="2"></rect></g>');
    });


});
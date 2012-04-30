/*global WIKIDIA, describe, beforeEach, it, expect*/
define(function(require, exports, module) {
    "use strict";

    var view = require("view");
    var model = require("model");

    describe("nodeView", function () {
        var nodeView;

        beforeEach(function () {
            var rootView = view.rootView($("<div></div>"));
            var diagramView = view.diagramView(rootView);
            var node = model.node({x: 10, y: 20});

            nodeView = view.nodeView(diagramView);
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

});
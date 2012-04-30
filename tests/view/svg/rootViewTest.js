/*global describe, beforeEach, it, expect*/
define(function(require, exports, module) {
    "use strict";

    var view = require("view");

    describe("rootView", function () {

        var rootView;

        beforeEach(function () {
            rootView = view.rootView($("<div></div>"));
        });

        it("should create root SVG element", function () {
            expect(rootView._test.svg()).toEqual('<svg></svg>');
        });

        it("can create child element without attributes", function () {
            rootView.createElement("g");
            expect(rootView._test.svg()).toEqual('<svg><g></g></svg>');
        });

        it("can create child element with attributes", function () {
            rootView.createElement("text", {x: 10, y: 20, text: "test"});
            rootView.createElement("g", {id: "testGroup"});
            expect(rootView._test.svg()).toEqual('<svg><text x="10" y="20" text="test"></text><g id="testGroup"></g></svg>');
        });

    });

});
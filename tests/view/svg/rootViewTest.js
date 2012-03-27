/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("rootView", function () {
    "use strict";

    var rootView;

    beforeEach(function () {
        rootView = WIKIDIA.view.svg.rootView($("<div></div>"));
    });

    it("should create root SVG element", function () {
        expect(rootView._test.svg()).toEqual('<svg></svg>');
    });

    it("can create child element without attributes", function () {
        rootView.addElement("g");
        expect(rootView._test.svg()).toEqual('<svg><g></g></svg>');
    });

    it("can create child element with attributes", function () {
        rootView.addElement("text", {x: 10, y: 20, text: "test"});
        rootView.addElement("g", {id: "testGroup"});
        expect(rootView._test.svg()).toEqual('<svg><text x="10" y="20" text="test"></text><g id="testGroup"></g></svg>');
    });

});
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
});
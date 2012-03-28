/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("objectTest", function () {
    "use strict";

    beforeEach(function () {
    });

    it("provides each object with an unique id", function () {
        var o1 = WIKIDIA.utils.objectWithId();
        var o2 = WIKIDIA.utils.objectWithId();

        expect(o1.oid).toEqual(1);
        expect(o2.oid).toEqual(2);
    });
});
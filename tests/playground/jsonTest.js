/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("json", function () {
    "use strict";

    it("can stringify with property getters and setters", function () {
        function object() {
            var _value;

            return {
                get value() {
                    return _value;
                },
                set value(value) {
                    _value = value;
                }
            };
        }

        var o1 = object();
        o1.value = "test";
        var json = JSON.stringify(o1);
        expect(json).toEqual('{"value":"test"}');
    });

    it("CANNOT handle cycles", function () {
        var o1 = {id: "o1"};
        var o2 = {id: "o2"};
        o1.ref = o2;
        o2.ref = o1;

        expect(function () {
            JSON.stringify([o1, o2]);
        }).toThrow("Converting circular structure to JSON");
    });
});
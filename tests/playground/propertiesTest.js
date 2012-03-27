/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("propertiesTest", function () {
    "use strict";

    it("getters and setters with object literals", function () {
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

        var o = object();
        o.value = "test";
        expect(o.value).toEqual("test");
    });
});
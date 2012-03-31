/*global WIKIDIA, describe, beforeEach, it, expect*/

describe("utilsTest", function () {
    "use strict";

    beforeEach(function () {
    });

    it("provides each object with an unique id", function () {
        var o1 = WIKIDIA.utils.objectWithId();
        var o2 = WIKIDIA.utils.objectWithId();

        expect(o1.oid).toEqual(1);
        expect(o2.oid).toEqual(2);
    });

    // TODO: I'm not going to do this for now
//    it("specValidator - required property", function () {
//        var spec = {text: "test"};
//        var result = WIKIDIA.utils.specValidator(spec)
//            .required("text")
//            .validate();
//
//        expect(result.text).toEqual("test");
//
//        expect(function () {
//            WIKIDIA.utils.specValidator(spec)
//                        .required("other")
//                        .validate();
//        }).toThrow("Required property 'other' not set.");
//    });
//
//    it("specValidator - optional property", function () {
//        var spec = {text: "test"};
//        var result = WIKIDIA.utils.specValidator(spec)
//            .optional("text", "defaultVal")
//            .validate();
//        expect(result.text).toEqual("test");
//
//        spec = {text: "test"};
//        result = WIKIDIA.utils.specValidator(spec)
//            .optional("other", "defaultVal")
//            .validate();
//        expect(result.other).toEqual("defaultVal");
//    });
//
//    it("specValidator - default property", function () {
//        var spec = "test";
//        var result = WIKIDIA.utils.specValidator(spec)
//            .default("text");
//        expect(result.text).toEqual("test");
//
//        // spec don't have to contain required property if it is set as default
//        spec = "test";
//        result = WIKIDIA.utils.specValidator(spec)
//            .default("text")
//            .required("text")
//            .validate();
//        expect(result.text).toEqual("test");
//
//        // default property can end in optional property too
//        spec = "test"
//        result = WIKIDIA.utils.specValidator(spec)
//            .default("text")
//            .optional("text")
//            .validate();
//        expect(result.text).toEqual("test");
//    });

});
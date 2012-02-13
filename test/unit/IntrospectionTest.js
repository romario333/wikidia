"use strict";

JsHamcrest.Integration.JsTestDriver();

TestCase("IntrospectionTest", {
    setUp: function () {
    },
    "test I can iterate over object's functions" : function () {

        var obj = {
            fun1: function () {
            }
        };

        var members = [];
        for (var member in obj) {
            console.log("member=%s", member);
            console.dir(member);
            members.push(member);
        }
    }
});
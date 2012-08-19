$(document).ready(function () {

    // I have to keep this test in the standalone script as it causes syntax error in IE < 9
    test("Syntax and semantic differences - WITH SyntaxError", function () {

        // reserved word restriction on property names - removed in ES5
        var o = {function: "test"};
        equal(o.function, "test");

        // getters and setter
        o = {
            get test() {
                return "test";
            }
        };
        equal(o.test, "test");

        // TODO: note that this works in ES3 in IE, even though it's forbidden by ES3 (http://bclary.com/2004/11/07/#a-7.8.4, last paragraph)
        // multi-line string literals
        var s = "very long \
string";
        equal(s, "very long string");

    });
});

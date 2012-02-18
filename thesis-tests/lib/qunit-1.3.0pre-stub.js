// This is stub file to make IDEA happy

/**
 * QUnit v1.3.0pre - A JavaScript Unit Testing Framework
 *
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2011 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * or GPL (GPL-LICENSE.txt) licenses.
 */


// call on start of module test to prepend name to all tests
module = function(name, testEnvironment) {
};

asyncTest = function(testName, expected, callback) {
};

test = function(testName, expected, callback, async) {
};

/**
 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
 */
expect = function(asserts) {
};

/**
 * Asserts true.
 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
 */
ok = function(a, msg) {
};

/**
 * Checks that the first two arguments are equal, with an optional message.
 * Prints out both actual and expected values.
 *
 * Prefered to ok( actual == expected, message )
 *
 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
 *
 * @param Object actual
 * @param Object expected
 * @param String message (optional)
 */
equal = function(actual, expected, message) {
};

notEqual = function(actual, expected, message) {
};

deepEqual = function(actual, expected, message) {
};

notDeepEqual = function(actual, expected, message) {
};

strictEqual = function(actual, expected, message) {
};

notStrictEqual = function(actual, expected, message) {
};

raises = function(block, expected, message) {
};

start = function(count) {
};

stop = function(count) {
};

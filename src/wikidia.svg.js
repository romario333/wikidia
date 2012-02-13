var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    WIKIDIA.modules = WIKIDIA.modules || {};
    var module = WIKIDIA.modules.svg = {};

    var NS_SVG = "http://www.w3.org/2000/svg";

    function newSvgNode(element) {
        var that, // public interface
            mElement; // wrapped SVG element

        function init(rootElement) {
            if (rootElement) {
                mElement = rootElement;
            } else {
                mElement = newSvgTag("svg");
            }
        }

        init(element);

        that = {
            element: mElement,
            /**
             * Clears content of this node (that is all its children).
             */
            clear: function () {
                mElement.empty();
            },
            clearTransform: function () {
                mElement.removeAttr("transform");
            },
            transform: function(transform) {
                mElement.attr("transform", transform);
            }
        };

        return that;
    }

    function newSvgCompositeNode(element) {
        var that,
            mElement = element;

        that = newSvgNode(element);

        that.addNode = function (node) {
            // TODO: I should keep also tree of nodes
            mElement.append(node.element);
            return node;
        };

        // TODO: rename na new
        that.addGroup = function (attrs) {
            var el = newSvgTag("g", attrs);
            var node = newSvgCompositeNode(el);
            mElement.append(node.element);
            return node;
        };

        that.addLine = function (attrs) {
            var el = newSvgTag("line", attrs);
            mElement.append(el);
            return newSvgNode(el);
        };

        that.addRect = function (attrs)  {
            var el = newSvgTag("rect", attrs);
            mElement.append(el);
            return newSvgNode(el);
        };

        that.addEllipse = function (attrs)  {
            var el = newSvgTag("ellipse", attrs);
            mElement.append(el);
            return newSvgNode(el);
        };

        that.addPath = function (attrs)  {
            var el = newSvgTag("path", attrs);
            mElement.append(el);
            return newSvgNode(el);
        };

        that.addText = function (attrs) {
            var node = module.newSvgTextNode(attrs);
            mElement.append(node.element);
            return node;
        };

        return that;
    }

    module.newSvgRootNode = function (attrs) {
        var that,
            mElement;

        mElement = newSvgTag("svg", attrs);
        // TODO: can svg be really considered to be group?
        that = newSvgCompositeNode(mElement);
        return that;
    };

    module.newSvgGroupNode = function (attrs) {
        var that,
            mElement;

        mElement = newSvgTag("g", attrs);
        that = newSvgCompositeNode(mElement);
        return that;
    };

    module.newSvgTextNode = function (attrs) {

        var that;

        var mElement = newSvgTag("text", attrs);

        that = newSvgNode(mElement);


        var mNextLinePos = 0;
        // TODO: how can I get line height?
        var mLineHeight = 15;

        // some properties has to be propagated to child elements
        // TODO: really?
        var mAlignmentBaseline = attrs["alignment-baseline"];

        /* samples of possible aligns:

        top-left corner is [0,0]
        <text x="0" y="0" text-anchor="start" dominant-baseline="text-before-edge">

        [0,0] is in the middle
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central">
        TODO: mozna spis alignment-baseline?


        and more... http://www.w3.org/TR/SVG/text.html#AlignmentProperties

         */

        // TODO: mel bych si vyrobit taky neco jako extend, proste bych pak rekl that.extend(object literal)
        that.element = mElement;
        that.text = function (text) {
            if (arguments.length === 0) {
                throw "TODO";
            } else {
                // TODO: expect more types of input and write tests
                var lines;
                if (Array.isArray(text)) {
                    lines = text;
                } else {
                    lines = text.split("\n");
                }

                lines.forEach(function (line) {
                    that.addLine(line);
                });
            }
            // TODO: should also return text

        };
        that.addLine = function (text) {
            var span = newSvgTag("tspan", {
                x: (this.element).attr("x"),
                dy: mNextLinePos
            });

            if (mAlignmentBaseline) {
                span.attr("alignment-baseline", mAlignmentBaseline);
            }

            mNextLinePos += mLineHeight;

            span.text(text);
            mElement.append(span);
            return span;
        };

        return that;

    };

    function newSvgTag(tagName, attrs) {
        var element = $(document.createElementNS(NS_SVG, tagName));
        if (attrs) {
            element.attr(attrs);
        }
        return element;
    }



})(this);

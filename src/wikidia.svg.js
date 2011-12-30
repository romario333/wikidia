var WIKIDIA = WIKIDIA || {};

(function (global) {
    "use strict";

    WIKIDIA.modules = WIKIDIA.modules || {};
    var module = WIKIDIA.modules.svg = {};

    var NS_SVG = "http://www.w3.org/2000/svg";

    /**
     * Creates SVG builder. Each builder have one root, this doesn't have to
     * be svg root tag (e.g. individual nodes will probably work with builders
     * which have root set to group element).
     *
     * @param rootElement
     */
    module.newSvgBuilder = function (rootElement) {
        var that, // public interface
            mRootElement;

        function init(rootElement) {
            if (rootElement) {
                mRootElement = rootElement;
            } else {
                mRootElement = newSvgTag("svg");
            }
        }

        init(rootElement);

        function newSvgTag(tagName, attrs) {
            var element = $(document.createElementNS(NS_SVG, tagName));
            if (attrs) {
                element.attr(attrs);
            }
            return element;
        }

        that = {
            /**
             * Builder's root element. New elements are added to this element. Typically it will
             * be root <code>svg</code> element or group <code>g</code> element.
             */
            rootElement: mRootElement,
            addGroup: function (attrs) {
                var element = newSvgTag("g", attrs);
                mRootElement.append(element);
                return module.newSvgBuilder(element);
            },
            // TODO: check whether you can nest anything inside rect, if not, return just svg element
            addRect: function (attrs)  {
                var element = newSvgTag("rect", attrs);
                mRootElement.append(element);
                return module.newSvgBuilder(element);
            },
            // TODO: should return text builder
            addText: function (attrs) {
                /* samples of possible aligns:

                top-left corner is [0,0]
                <text x="0" y="0" text-anchor="start" dominant-baseline="text-before-edge">

                [0,0] is in the middle
                <text x="0" y="0" text-anchor="middle" dominant-baseline="central">
                TODO: mozna spis alignment-baseline?


                and more... http://www.w3.org/TR/SVG/text.html#AlignmentProperties

                 */

                var textContent = "";
                if (attrs.text) {
                    textContent = attrs.text;
                    delete attrs.text;
                }

                var element = newSvgTag("text", attrs);
                element.text(textContent);

                mRootElement.append(element);
                return module.newSvgBuilder(element);
            },
            clear: function () {
                mRootElement.empty();
            }
        };

        return that;
    };


})(this);

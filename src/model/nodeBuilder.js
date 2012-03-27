var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.nodeBuilder = function () {
    "use strict";

    var that = {};

    // 3 mody - contour, content, decorations



    that.nodeView;

    that.rect = function(spec) {
        // TODO: validovat, co je v spec, bude slouzit zaroven jako dokumentace toho, co je mozne (mozna pak ukazu i v GUI jako help)
        that.nodeView.rect(spec);
    };

    /**
     *
     *
     * @param spec
     */
    that.text = function(spec) {
        that.nodeView.text(spec);
    };

    return that;
};
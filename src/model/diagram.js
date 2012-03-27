var WIKIDIA = WIKIDIA || {};
WIKIDIA.model = WIKIDIA.model || {};

WIKIDIA.model.diagram = function () {
    "use strict";

    var that = {},
        nodes = [],
        arrows = []; // TODO: mozna jsou arrows to same co nodes, pak by to byly items

    that.addNode = function (node) {
        nodes.push(node);
    };

    that.nodes = function () {
        return nodes;
    };

    return that;
};
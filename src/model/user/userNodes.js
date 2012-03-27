var node = {

    drawContour: function (builder) {

    },

    drawContent: function (builder) {
        builder.richText(this.text);
        builder.jointPoint(10, 10);
    }
};

var useCaseNode = extend(node, {
    draw: function (painter) {
        node.draw();
        // + some of my custom logic
    }
});


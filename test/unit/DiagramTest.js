TestCase("DiagramTest", {
    setUp: function () {
        this.paper = document.createElement("div");
        this.editor = document.createElement("textarea");
        $(document.body).append(this.paper).append(this.editor);
        this.diagram = WIKIDIA.diagram(this.paper, this.editor);
    },
    "test Create diagram": function () {
        this.assertHasChild(this.paper, "svg");
    },
    "test Create two independent diagrams": function () {
        var paper1 = document.createElement("div");
        var editor1 = document.createElement("textarea");
        WIKIDIA.diagram(paper1, editor1);
        var svg1 = $(paper1).children("svg")[0];

        var paper2 = document.createElement("div");
        var editor2 = document.createElement("textarea");
        WIKIDIA.diagram(paper2, editor2);
        var svg2 = $(paper1).children("svg")[1];

        assertNotSame(svg1, svg2);
    },
    "test Create multiple nodes": function () {
        var node1 = this.diagram.node();
        var node2 = this.diagram.node();

        assertEquals(2, this.diagram.items().length);
        assertSame(node1, this.diagram.items()[0]);
        assertSame(node2, this.diagram.items()[1]);
    },
    "test Select item": function () {
        var node1 = this.diagram.node();
        var node2 = this.diagram.node();

        assertFalse(node1.isSelected());
        assertFalse(node2.isSelected());

        this.diagram.select(node1);

        assertTrue(node1.isSelected());
        assertFalse(node2.isSelected());

        this.diagram.select(node2);

        assertFalse(node1.isSelected());
        assertTrue(node2.isSelected());
    },

    // TODO: I need some DOM assertions
    assertHasChild: function (parentSelector, childSelector) {
        return $(parentSelector).children(childSelector).length > 0;
    }
});
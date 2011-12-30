TestCase("DiagramTest", {
    setUp: function () {
        this.paper = document.createElement("div");
        this.editor = document.createElement("textarea");
        $(document.body).append(this.paper).append(this.editor);
        this.newDiagram = WIKIDIA.newDiagram(this.paper, this.editor);
    },
    "test Create diagram": function () {
        this.assertHasChild(this.paper, "svg");
    },
    "test Create two independent diagrams": function () {
        var paper1 = document.createElement("div");
        var editor1 = document.createElement("textarea");
        WIKIDIA.newDiagram(paper1, editor1);
        var svg1 = $(paper1).children("svg")[0];

        var paper2 = document.createElement("div");
        var editor2 = document.createElement("textarea");
        WIKIDIA.newDiagram(paper2, editor2);
        var svg2 = $(paper1).children("svg")[1];

        assertNotSame(svg1, svg2);
    },
    "test Create multiple nodes": function () {
        var node1 = this.newDiagram.newNode();
        var node2 = this.newDiagram.newNode();

        assertEquals(2, this.newDiagram.items().length);
        assertSame(node1, this.newDiagram.items()[0]);
        assertSame(node2, this.newDiagram.items()[1]);
    },
    "test Select item": function () {
        var node1 = this.newDiagram.newNode();
        var node2 = this.newDiagram.newNode();

        assertFalse(node1.isSelected());
        assertFalse(node2.isSelected());

        this.newDiagram.select(node1);

        assertTrue(node1.isSelected());
        assertFalse(node2.isSelected());

        this.newDiagram.select(node2);

        assertFalse(node1.isSelected());
        assertTrue(node2.isSelected());
    },

    // TODO: I need some DOM assertions
    assertHasChild: function (parentSelector, childSelector) {
        return $(parentSelector).children(childSelector).length > 0;
    }
});
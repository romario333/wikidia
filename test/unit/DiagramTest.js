"use strict";

JsHamcrest.Integration.JsTestDriver();

TestCase("DiagramTest", {
    setUp: function () {
        this.paper = document.createElement("div");
        this.editor = document.createElement("textarea");
        $(document.body).append(this.paper).append(this.editor);
        this.diagram = WIKIDIA.newDiagram(this.paper, this.editor);
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
        var node1 = WIKIDIA.newNode();
        var node2 = WIKIDIA.newNode();
        this.diagram.addItem(node1);
        this.diagram.addItem(node2);

        assertEquals(2, this.diagram.items().length);
        assertSame(node1, this.diagram.items()[0]);
        assertSame(node2, this.diagram.items()[1]);
    },
    "test Select item": function () {
        var node1 = WIKIDIA.newNode();
        var node2 = WIKIDIA.newNode();
        this.diagram.addItem(node1);
        this.diagram.addItem(node2);

        assertFalse(node1.isSelected());
        assertFalse(node2.isSelected());

        this.diagram.select(node1);

        assertTrue(node1.isSelected());
        assertFalse(node2.isSelected());

        this.diagram.select(node2);

        assertFalse(node1.isSelected());
        assertTrue(node2.isSelected());
    },
    "test snapToGrid": function () {
        assertThat(this.diagram.gridStep(), equalTo(10));

        var point1 = {x: 6, y: 5};
        var point2 = this.diagram.snapToGrid(point1);

        assertThat(point1, sameAs(point2));

        assertThat(point2.x, equalTo(10));
        assertThat(point2.y, equalTo(0));
    },
    "test snapToGrid can work with more properties than just x and y": function () {
        assertThat(this.diagram.gridStep(), equalTo(10));

        var point = this.diagram.snapToGrid({x: 6, y: 5, width: 16, height: 15, text: "test"});

        assertThat(point.x, equalTo(10));
        assertThat(point.y, equalTo(0));
        assertThat(point.width, equalTo(20));
        assertThat(point.height, equalTo(10));
        assertThat(point.text, equalTo("test"));
    },
    // TODO: I need some DOM assertions
    assertHasChild: function (parentSelector, childSelector) {
        return $(parentSelector).children(childSelector).length > 0;
    }
});
JsHamcrest.Integration.JsTestDriver();

TestCase("NodeTest", {
    setUp: function () {
        log("NodeTest setup");
        this.paper = document.createElement("div");
        this.editor = document.createElement("textarea");
        $(document.body).append(this.paper).append(this.editor);
        this.diagram = WIKIDIA.diagram(this.paper, this.editor);
    },
    "test Create node": function () {
        var node = this.diagram.node({
            x: 10,
            y: 20,
            width: 30,
            height: 40,
            text: "test",
            autoResizeMode: WIKIDIA.AUTO_RESIZE_MODE.none
        });

        assertEquals(10, node.x());
        assertEquals(20, node.y());
        assertEquals(30, node.width());
        assertEquals(40, node.height());
        assertEquals("test", node.text());

        // check also defaults
        var node = this.diagram.node();
        assertEquals(0, node.x());
        assertEquals(0, node.y());
        assertEquals(node._test.DEFAULT_NODE_WIDTH, node.width());
        assertEquals(node._test.DEFAULT_NODE_HEIGHT, node.height());
        assertEquals("", node.text());
    },
    "test AUTO_RESIZE_MODE.none": function () {
        var node = this.diagram.node({
            width: 1,
            height: 1,
            text: "This text cannot fit.",
            autoResizeMode: WIKIDIA.AUTO_RESIZE_MODE.none
        });

        assertEquals(1, node.width());
        assertEquals(1, node.height());
    },
    "test AUTO_RESIZE_MODE.growAndShrink": function () {
        var node = this.diagram.node({
            minNodeWidth: 6,
            minNodeHeight: 6,
            width: 100,
            height: 100,
            text: "xxx",
            autoResizeMode: WIKIDIA.AUTO_RESIZE_MODE.growAndShrink
        });

        // node should be smaller than 100x100, it should be shrunk to fit text exactly
        assertThat(node.width(), between(1).and(99));
        assertThat(node.height(), between(1).and(99));

        // change node's size - it shouldn't fit  and should auto-resize
        node.width(1).height(1);
        assertThat(node.width(), between(2).and(99));
        assertThat(node.height(), between(2).and(99));

        // make node small again and remove text (so it fits), it should shrink to min size
        node.text("").width(1).height(1);
        assertThat(node.width(), equalTo(6));
        assertThat(node.height(), equalTo(6));
    },
    "test AUTO_RESIZE_MODE.growOnly": function () {
        var node = this.diagram.node({
            width: 100,
            height: 100,
            text: "xxx",
            autoResizeMode: WIKIDIA.AUTO_RESIZE_MODE.growOnly
        });

        // text should fit in the beginning
        assertEquals(100, node.width());
        assertEquals(100, node.height());

        // change node's size - it shouldn't fit now and should auto-resize
        node.width(1).height(1);
        assertThat(node.width(), between(2).and(99));
        assertThat(node.height(), between(2).and(99));

        // make node small again and remove text (so it fits), its size should not change
        var lastWidth = node.width();
        var lastHeight = node.height();
        node.text("").width(1).height(1);
        assertThat(node.width(), equalTo(lastWidth));
        assertThat(node.height(), equalTo(lastHeight));
    }
});
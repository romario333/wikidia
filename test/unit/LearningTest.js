TestCase("LearningTest", {
    setUp: function () {
        this.paper = document.createElement("div");
        this.editor = document.createElement("textarea");
        $(document.body).append(this.paper).append(this.editor);
        this.diagram = WIKIDIA.diagram(this.paper, this.editor);
    },
    "test Function arguments are not passed byref" : function () {

        function change(what) {
            what = "changed";
        }

        var value = "test";
        change(value);

        assertEquals("test", value);
    },
    "test Every instance in functional inheritance pattern has own copy of method" : function() {
        // TODO: this is interesting, will it have some noticeable performance impact?
        var node1 = this.diagram.node();
        var node2 = this.diagram.node();

        assertNotSame(node1.isSelected, node2.isSelected);
    }
});
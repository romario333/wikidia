JsHamcrest.Integration.JsTestDriver();

TestCase("LearningTest", {
    setUp: function () {
        this.paper = document.createElement("div");
        this.editor = document.createElement("textarea");
        $(document.body).append(this.paper).append(this.editor);
        this.newDiagram = WIKIDIA.newDiagram(this.paper, this.editor);
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
        var node1 = this.newDiagram.newNode();
        var node2 = this.newDiagram.newNode();

        assertNotSame(node1.isSelected, node2.isSelected);
    },
    "test Classic function declaration is hoisted with function body": function () {
        assertThat(f(), equalTo("test"));

        function f() { return "test"; }
    },
    "test Var function declaration - only var is hoisted, function body is not": function () {
        assertThat(f, nil());

        var f = function () { return "test"; };
    }
});
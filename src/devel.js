var log = function(text, arg1, arg2, argN) {
    if (console) {
        var formattedText = sprintf.apply(null, arguments);
        console.log(formattedText + "\n");
    }
}
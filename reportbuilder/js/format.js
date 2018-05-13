System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function getFormat(formatname) {
        switch (formatname) {
            case "align right":
                return { type: "class", value: "text-right" };
            case "hilite":
                return { type: "class", value: "hilite" };
            case "number":
                return { type: "number", value: "n" };
            case "two decimal":
                return { type: "number", value: ".99" };
            case "date":
                return { type: "date", value: "date" };
            default:
                if (formatname.slice(0, 5) === "text=") {
                    return { type: "text", value: formatname.slice(5) };
                }
                return null;
        }
    }
    function applyFormat(formats, data) {
        var formatReturn = {
            classes: "",
            formatted: data
        };
        for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
            var f = formats_1[_i];
            var format = getFormat(f);
            switch (format.type) {
                case "class":
                    formatReturn.classes += format.type === "class" ? format.value + " " : "";
                    break;
                case "number":
                    switch (format.value) {
                        case ".99":
                            formatReturn.formatted = Number(data) ? data.toFixed(2) : data;
                            break;
                        case "n":
                            formatReturn.formatted = Number(data) ? data : 0;
                            break;
                    }
                    break;
                case "date":
                    formatReturn.formatted = moment(data).format("MM/DD/YYYY");
                    break;
                case "text":
                    var tarray = format.value.split("{val}");
                    if (tarray.length === 0) {
                        formatReturn.formatted = tarray[0];
                    }
                    else {
                        var tbuilder = "";
                        for (var i = 0; i < tarray.length - 1; i++) {
                            tbuilder += tarray[i] + data;
                        }
                        tbuilder += tarray[tarray.length - 1];
                        formatReturn.formatted = tbuilder;
                    }
                    break;
                default:
                    console.log("applyFormat received an undefined format.type");
            }
        }
        formatReturn.classes = formatReturn.classes ? " class=\"" + formatReturn.classes.slice(0, -1) + "\"" : "";
        return formatReturn;
    }
    exports_1("applyFormat", applyFormat);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=format.js.map
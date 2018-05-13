"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Format = /** @class */ (function () {
    function Format() {
        this.List = [];
    }
    Format.prototype.FormatSelectForm = function () {
        var form = "\n            <div id=\"formatSelectForm\" class=\"position-absolute bg-info border rounded border--dark\" style=\"display:none; z-index:1001;\">\n                <div class=\"d-flex flex-column m-0\">\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable\">align right</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable\">hilite</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable\">number</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable\">two decimal</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable\">date</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable\">text</div>\n                </div>\n            </div>";
        return form;
    };
    Format.prototype.getFormat = function (formatname) {
    };
    Format.prototype.applyFormat = function () {
    };
    return Format;
}());
exports.Format = Format;
//# sourceMappingURL=format.js.map
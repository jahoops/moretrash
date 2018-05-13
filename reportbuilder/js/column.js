System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ColumnInfo, Sort, Col;
    return {
        setters: [],
        execute: function () {
            ColumnInfo = /** @class */ (function () {
                function ColumnInfo() {
                    this.formats = [];
                }
                return ColumnInfo;
            }());
            exports_1("ColumnInfo", ColumnInfo);
            (function (Sort) {
                Sort[Sort["none"] = 0] = "none";
                Sort[Sort["asc"] = 1] = "asc";
                Sort[Sort["desc"] = 2] = "desc";
            })(Sort || (Sort = {}));
            Col = /** @class */ (function () {
                function Col(json_in) {
                    this.Group = {
                        show: false,
                        formats: []
                    };
                    this.Detail = {
                        show: true,
                        formats: []
                    };
                    this.SubTotal = {
                        show: false,
                        formats: []
                    };
                    this.FinalTotal = {
                        show: false,
                        formats: []
                    };
                    this.IsNumber = false;
                    this.ShowSettingsIcon = false;
                    this.IsRowTotalColumn = false;
                    $.extend(this, json_in);
                }
                return Col;
            }());
            exports_1("Col", Col);
        }
    };
});
//# sourceMappingURL=column.js.map
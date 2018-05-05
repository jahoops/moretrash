var Report = /** @class */ (function () {
    function Report(rowData, columnInfo, name, version) {
        this.ReportCols = [];
        this.ReportRows = [];
        for (var _i = 0, rowData_1 = rowData; _i < rowData_1.length; _i++) {
            var r = rowData_1[_i];
            this.ReportRows.push(new Report.Row(r));
        }
        if (columnInfo) {
            for (var _a = 0, columnInfo_1 = columnInfo; _a < columnInfo_1.length; _a++) {
                var c = columnInfo_1[_a];
                this.ReportCols.push(new Report.Col(c));
            }
            this.ReportName = name ? name : 'Report Builder';
            this.ReportVersion = version ? version : '1.0';
        }
        else {
            var colInspect = [];
            for (var firstrowfieldname in this.ReportRows[0]) {
                var val = this.ReportRows[0][firstrowfieldname];
                if ($.isNumeric(val)) {
                    colInspect.push({
                        DataField: firstrowfieldname,
                        IsNumber: true
                    });
                }
                else {
                    colInspect.push({
                        DataField: firstrowfieldname,
                        IsNumber: false
                    });
                }
            }
            for (var _b = 0, colInspect_1 = colInspect; _b < colInspect_1.length; _b++) {
                var ci = colInspect_1[_b];
                var c = {
                    DataField: ci.DataField,
                    ShowSettingsIcon: true
                };
                var newCol = new Report.Col(c);
                if (ci.IsNumber) {
                    newCol.Detail.formats.push('align right');
                    newCol.SubTotal.formats.push('align right');
                    newCol.FinalTotal.formats.push('align right');
                    newCol.Detail.formats.push('number');
                    newCol.SubTotal.formats.push('number');
                    newCol.FinalTotal.formats.push('number');
                }
                this.ReportCols.push(newCol);
            }
        }
    }
    Report.prototype.Clear = function () {
        this.ReportName = '';
        this.ReportCols = [];
        this.ReportRows = [];
        this.ReportVersion = 'string';
        return;
    };
    Report.prototype.Render = function (el, reRender) {
        var groupValues = [];
        var hasGroups = false;
        var subTotals = [];
        var hasSubTotals = false;
        var hasSubTotalsByGroup = [];
        var finalTotals = [];
        var hasFinalTotals = false;
        for (var i = 0; i < this.ReportCols.length; i++) {
            if (this.ReportCols[i].Exclude)
                continue;
            if (this.ReportCols[i].Group.show) {
                hasGroups = true;
                groupValues.push(undefined);
            }
            if (this.ReportCols[i].FinalTotal.show) {
                hasFinalTotals = true;
                finalTotals.push(0);
            }
        }
        for (var g = 0; g < groupValues.length; g++) {
            subTotals.push([]);
            hasSubTotalsByGroup[g] = false;
            for (var i = 0; i < this.ReportCols.length; i++) {
                if (this.ReportCols[i].Exclude)
                    continue;
                if (this.ReportCols[i].SubTotal.show) {
                    hasSubTotals = true;
                    hasSubTotalsByGroup[g] = true;
                    subTotals[g].push(0);
                }
            }
        }
        var thead = "<thead><tr>";
        for (var i = 0; i < this.ReportCols.length; i++) {
            if (this.ReportCols[i].Exclude)
                continue;
            var c = this.ReportCols[i];
            thead += c.ShowSettingsIcon ? "<th key=\"" + c.DataField + "\" colindex=\"" + i + "\"><span>" + c.Header + "</span></th>" : "<th>" + c.Header + "</th>";
        }
        thead += "</tr></thead>";
        var tbody = reRender == 'body' ? "" : "<tbody>";
        for (var _i = 0, _a = this.ReportRows; _i < _a.length; _i++) {
            var r = _a[_i];
            var group = 0;
            var subtot = 0;
            var fintot = 0;
            // save next row in detailrow
            var detailrow = "<tr>";
            for (var i = 0; i < this.ReportCols.length; i++) {
                if (this.ReportCols[i].Exclude)
                    continue;
                var c = this.ReportCols[i];
                // calculated field check 
                var thisVal = Report.returnFieldValue(r, c.DataField);
                if (c.SubTotal.show) {
                    for (var gg = 0; gg < subTotals.length; gg++) {
                        subTotals[gg][subtot] += Number(thisVal);
                    }
                    subtot++;
                }
                if (c.FinalTotal.show) {
                    finalTotals[fintot] += Number(thisVal);
                    fintot++;
                }
                // insert group header/subtotals to tbody before detailrow 
                if (c.Group.show) {
                    var thisCol = c.DataField;
                    // on group break
                    if (groupValues[group] !== thisVal) {
                        // if it is NOT the first record, and any column shows subtotals, insert subtotal to tbody now
                        if (groupValues[group] !== undefined) {
                            if (hasSubTotalsByGroup[group]) {
                                tbody += Report.subTotalRow(this.ReportCols, subTotals[group]);
                            }
                        }
                        // insert group header row to tbody now
                        var grouprow = "<tr>";
                        for (var _b = 0, _c = this.ReportCols; _b < _c.length; _b++) {
                            var group_c = _c[_b];
                            if (group_c.Exclude)
                                continue;
                            var format = Report.applyFormat(c.Group);
                            grouprow += thisCol === group_c.DataField ? "<td" + format.classes + ">" + thisVal + "</td>" : "<td></td>";
                        }
                        grouprow += "</tr>";
                        tbody += grouprow;
                        groupValues[group] = thisVal;
                        for (var cg = group + 1; cg < groupValues.length; cg++) {
                            groupValues[cg] = undefined;
                        }
                    }
                    group++;
                }
                // keep building detailrow
                if (c.Detail.show) {
                    var format = Report.applyFormat(c.Detail, Report.returnFieldValue(r, c.DataField));
                    detailrow += "<td" + format.classes + ">" + format.formatted + "</td>";
                }
                else {
                    detailrow += "<td></td>";
                }
            }
            // now add the detail row
            detailrow += "</tr>";
            if (detailrow.replace(/<tr>/g, '').replace(/<td>/g, '').replace(/<\/td>/g, '').replace(/<\/tr>/g, '').length > 0) {
                tbody += detailrow;
            }
        }
        if (hasSubTotals && hasSubTotalsByGroup[groupValues.length - 1])
            tbody += Report.subTotalRow(this.ReportCols, subTotals[groupValues.length - 1]);
        if (hasFinalTotals)
            tbody += Report.finalTotalRow(this.ReportCols, finalTotals);
        tbody += reRender == 'body' ? "" : "</tbody>";
        reRender == 'body' ? $(el).html(tbody) : $(el).append(thead + tbody);
    };
    Report.prototype.ColEditFormats = function (colindex, section, formatsonly) {
        var colinfo = this.ReportCols[colindex][section];
        var formatdiv = "";
        var formats = "";
        formatdiv += "<div class=\"formatsdiv d-flex flex-wrap m-0\" colindex=\"" + colindex + "\" section=\"" + section + "\" >";
        if (colinfo.formats && colinfo.formats.length > 0) {
            for (var j = 0; j < colinfo.formats.length; j++) {
                formats += "<div class=\"border rounded font-weight-light font-italic small m-1 px-1 bg-creps\">" + colinfo.formats[j] + " <i class=\"removeformat fa fa-remove ml-1 clickable\" style=\"height: 4px\" formatindex=\"" + j + "\"></i></div>";
            }
            formatdiv += formats;
        }
        formatdiv += "</div>";
        return formatsonly ? formats : formatdiv;
    };
    Report.prototype.ColEditForm = function (colindex) {
        var cols = this.ReportCols;
        var col = cols[colindex];
        var i = Number(colindex);
        var l = cols.length;
        var j = i - 1;
        for (j; j > -1; j--) {
            if (!cols[j].Exclude)
                break;
        }
        var prev_col = j == -1 ? false : cols[j];
        j = i + 1;
        for (j; j < l; j++) {
            if (!cols[j].Exclude)
                break;
        }
        var next_col = j == l ? false : cols[j];
        var form = "\n            <div class=\"columneditform btn-group dropright btn-group-sm pl-2\">\n                <a class=\"btn excludecheckbox\" section=\"" + 'Exclude' + "\" colindex=\"" + colindex + "\" href=\"#\"><i class=\"fa fa-check-square-o\"></a></i>\n                <a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\"><i class=\"fa fa-gear\"></i></a>\n                <ul class=\"dropdown-menu\" colindex=\"" + colindex + "\">";
        for (var _i = 0, _a = ['Header']; _i < _a.length; _i++) {
            var section = _a[_i];
            form += "<div class='p-0 m-0 text-center'>";
            form += i > 0 && !col.Group.show && (prev_col && !prev_col.Group.show) ? "<i class=\"moveleft clickable fa fa-arrow-left\"></i>" : "<i class=\"moveleft gray fa fa-arrow-left\"></i>";
            form += col.Group.show ? " grouped " : " move ";
            form += colindex < l - 1 && !col.Group.show && (next_col && !next_col.Group.show) ? "<i class=\"moveright clickable fa fa-arrow-right\"></i></div>" : "<i class=\"moveright gray fa fa-arrow-right\"></i></div>";
            form += "<li class=\"p-2\">" + section + ":<input class=\"rg-watch\" type=\"text\" section=\"" + section + "\" value=\"" + col[section] + "\"></li>";
        }
        for (var _b = 0, _c = ['Detail', 'Group', 'SubTotal', 'FinalTotal']; _b < _c.length; _b++) {
            var section = _c[_b];
            var colinfo = col[section];
            var checked = colinfo.show ? ' checked=checked' : '';
            form += "<li class=\"px-2\">" + section + ":<div class=\"form-check form-check-inline\">\n                    <input class=\"form-check-input rg-watch ml-2\" section=\"" + section + "\" type=\"checkbox\" " + checked + "}\">\n                    <a href=\"#\" class=\"addformatlink font-weight-light font-italic small ml-2\" section=\"" + section + "\">add format</a></li>";
            form += this.ColEditFormats(colindex, section);
        }
        form += "</ul>\n            </div>";
        return form;
    };
    Report.prototype.FormatSelectForm = function () {
        var form = "\n            <div id=\"formatSelectForm\" class=\"position-absolute bg-floralwhite border rounded border--olive\" style=\"display:none; z-index:1001;\">\n                <div class=\"d-flex flex-column m-0\">\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable\">align right</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable\">hilite</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable\">number</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable\">two decimal</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable\">date</div>\n                    <div class=\"addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable\">text</div>\n                </div>\n            </div>";
        return form;
    };
    Report.prototype.SetGroupColumns = function () {
        var groups = this.ReportCols.filter(function (e) { return e.Group.show && !e.Exclude; });
        for (var i = 0; i < groups.length; i++) {
            this.MoveKeyToPos(groups[i].DataField, i);
        }
        this.SortAll();
    };
    Report.prototype.SwitchCols = function (fromindex, toindex) {
        var saveToCol = this.ReportCols[toindex];
        this.ReportCols[toindex] = this.ReportCols[fromindex];
        this.ReportCols[fromindex] = saveToCol;
    };
    Report.prototype.MoveKeyToPos = function (key, toindex) {
        var i;
        for (i = 0; i < this.ReportCols.length; i++) {
            if (this.ReportCols[i].DataField == key) {
                break;
            }
        }
        var fromindex = i;
        this.SwitchCols(fromindex, toindex);
        while (toindex - 1 > fromindex) {
            toindex--;
            this.SwitchCols(fromindex, toindex);
        }
        while (toindex + 1 < fromindex) {
            toindex++;
            this.SwitchCols(fromindex, toindex);
        }
    };
    Report.prototype.SortAll = function () {
        for (var i = this.ReportCols.length - 1; i > -1; i--) {
            var c = this.ReportCols[i];
            if (!c.Exclude) {
                if (!c.Group.show) {
                    if (c.Sort)
                        this.SortData(i, c.Sort);
                }
                else {
                    if (!c.Sort) {
                        c.Sort = 1;
                    }
                    this.SortData(i, c.Sort);
                }
            }
        }
    };
    Report.prototype.SortData = function (colindex, direction) {
        function asc(a, b) {
            var colA = Report.returnFieldValue(a, key);
            colA = $.isNumeric(colA) ? colA : colA.toUpperCase();
            var colB = Report.returnFieldValue(b, key);
            colB = $.isNumeric(colB) ? colB : colB.toUpperCase();
            var comparison = 0;
            if (colA > colB) {
                comparison = 1;
            }
            else if (colA < colB) {
                comparison = -1;
            }
            return comparison;
        }
        function desc(a, b) {
            var colA = Report.returnFieldValue(a, key);
            colA = $.isNumeric(colA) ? colA : colA.toUpperCase();
            var colB = Report.returnFieldValue(b, key);
            colB = $.isNumeric(colB) ? colB : colB.toUpperCase();
            var comparison = 0;
            if (colA < colB) {
                comparison = 1;
            }
            else if (colA > colB) {
                comparison = -1;
            }
            return comparison;
        }
        var key = this.ReportCols[colindex].DataField;
        this.ReportRows = direction == 'ascending' || direction == 1 ? this.ReportRows.sort(asc) : this.ReportRows.sort(desc);
    };
    Report.prototype.AddRowCol = function () {
        var datafieldarray = [];
        for (var _i = 0, _a = this.ReportCols; _i < _a.length; _i++) {
            var c_1 = _a[_i];
            for (var _b = 0, _c = c_1.Detail.formats; _b < _c.length; _b++) {
                var f = _c[_b];
                if (f === 'number') {
                    datafieldarray.push(c_1.DataField);
                    break;
                }
            }
        }
        var c = {
            Header: 'Total',
            DataField: datafieldarray.join(','),
            ShowSettingsIcon: true
        };
        var newCol = new Report.Col(c);
        newCol.Detail.formats.push('align right');
        newCol.SubTotal.formats.push('align right');
        newCol.FinalTotal.formats.push('align right');
        newCol.Detail.formats.push('number');
        newCol.SubTotal.formats.push('number');
        newCol.FinalTotal.formats.push('number');
        this.ReportCols.push(newCol);
    };
    return Report;
}());
(function (Report) {
    var Sort;
    (function (Sort) {
        Sort[Sort["none"] = 0] = "none";
        Sort[Sort["asc"] = 1] = "asc";
        Sort[Sort["desc"] = 2] = "desc";
    })(Sort || (Sort = {}));
    var ColumnInfo = /** @class */ (function () {
        function ColumnInfo() {
            this.formats = [];
        }
        return ColumnInfo;
    }());
    Report.ColumnInfo = ColumnInfo;
    var Col = /** @class */ (function () {
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
            this.ShowSettingsIcon = false;
            this.Exclude = false;
            $.extend(this, json_in);
            if (!this.Header)
                this.Header = this.DataField;
        }
        return Col;
    }());
    Report.Col = Col;
    var Row = /** @class */ (function () {
        function Row(json_in) {
            $.extend(this, json_in);
        }
        return Row;
    }());
    Report.Row = Row;
    function getColumnInfoByKey(key) {
        JSON.stringify(this.ReportCols[key]);
    }
    Report.getColumnInfoByKey = getColumnInfoByKey;
    function getFormat(formatname) {
        switch (formatname) {
            case 'align right':
                return { type: 'class', value: 'text-right' };
            case 'hilite':
                return { type: 'class', value: 'hilite' };
            case 'number':
                return { type: 'number', value: 'n' };
            case 'two decimal':
                return { type: 'number', value: '.99' };
            case 'date':
                return { type: 'date', value: 'date' };
            default:
                if (formatname.slice(0, 5) == 'text=') {
                    return { type: 'text', value: formatname.slice(5) };
                }
                return null;
        }
    }
    function applyFormat(df, data) {
        var formatReturn = {
            classes: '',
            formatted: data
        };
        for (var _i = 0, _a = df.formats; _i < _a.length; _i++) {
            var f = _a[_i];
            var format = getFormat(f);
            switch (format.type) {
                case 'class':
                    formatReturn.classes += format.type === 'class' ? format.value + ' ' : '';
                    break;
                case 'number':
                    switch (format.value) {
                        case '.99':
                            formatReturn.formatted = Number(data) ? data.toFixed(2) : data;
                            break;
                        case 'n':
                            formatReturn.formatted = Number(data) ? data : 0;
                            break;
                    }
                    break;
                case 'date':
                    formatReturn.formatted = moment(data).format('MM/DD/YYYY');
                    break;
                case 'text':
                    var tarray = format.value.split('{val}');
                    if (tarray.length == 0) {
                        formatReturn.formatted = tarray[0];
                    }
                    else {
                        var tbuilder = '';
                        for (var i = 0; i < tarray.length - 1; i++) {
                            tbuilder += tarray[i] + data;
                        }
                        tbuilder += tarray[tarray.length - 1];
                        formatReturn.formatted = tbuilder;
                    }
                    break;
                default:
                    console.log('applyFormat received an undefined format.type');
            }
        }
        formatReturn.classes = formatReturn.classes ? ' class="' + formatReturn.classes.slice(0, -1) + '"' : '';
        return formatReturn;
    }
    Report.applyFormat = applyFormat;
    function subTotalRow(ReportCols, subtotals) {
        var subtot = 0;
        var subtotalrow = "<tr>";
        for (var i = 0; i < ReportCols.length; i++) {
            var c = ReportCols[i];
            if (c.Exclude)
                continue;
            var subformat = void 0;
            if (c.SubTotal.show) {
                subformat = Report.applyFormat(c.SubTotal, subtotals[subtot]);
                subtotals[subtot] = 0;
                subtot++;
            }
            else {
                subformat = Report.applyFormat(c.SubTotal, '');
            }
            subtotalrow += c.SubTotal.show ? "<td" + subformat.classes + ">" + subformat.formatted + "</td>" : "<td></td>";
        }
        subtotalrow += "</tr>";
        return subtotalrow;
    }
    Report.subTotalRow = subTotalRow;
    function finalTotalRow(ReportCols, finalTotals) {
        var fintot = 0;
        var finaltotalrow = "<tr>";
        var finalformat;
        for (var i = 0; i < ReportCols.length; i++) {
            var c = ReportCols[i];
            if (c.Exclude)
                continue;
            if (c.FinalTotal.show) {
                finalformat = Report.applyFormat(c.FinalTotal, finalTotals[fintot]);
                fintot++;
            }
            else {
                finalformat = Report.applyFormat(c.FinalTotal, '');
            }
            finaltotalrow += c.FinalTotal.show ? "<td" + finalformat.classes + ">" + finalformat.formatted + "</td>" : "<td></td>";
        }
        finaltotalrow += "</tr>";
        return finaltotalrow;
    }
    Report.finalTotalRow = finalTotalRow;
    function returnFieldValue(row, DataField) {
        // for calculated columns, a column might be a comma delimited list of field names instead of a single field name
        var calcvalue = 0;
        if (DataField.indexOf(',') > -1) {
            // for now only sum field values
            for (var _i = 0, _a = DataField.split(','); _i < _a.length; _i++) {
                var f = _a[_i];
                calcvalue += row[f];
            }
        }
        else {
            calcvalue = row[DataField];
        }
        return calcvalue;
    }
    Report.returnFieldValue = returnFieldValue;
})(Report || (Report = {}));
//# sourceMappingURL=report.js.map
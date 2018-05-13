import {Col, ColumnInfo} from "./column";
import {IFormat, IFormatReturn, applyFormat} from "./format";

class Report {
    ReportID: number;
    ReportName: string;
    ReportDataCall: string;
    ReportCols: Col[] = [];
    ReportRows: any[][] = [];
    ReportVersion: string;
    constructor(dataCall: string, rowData: any[][], columnInfo ? : any, id ? : number, name ? : string, version ? : string) {
        this.ReportDataCall = dataCall;
        for (let r:number = 0; r<rowData.length; r++) {
            this.ReportRows.push(rowData[r]);
        }
        if (columnInfo) {
            for (const c of columnInfo) {
                this.ReportCols.push(new Col(c));
            }
            this.ReportID = id ? id : -1;
            this.ReportName = name ? name : "Report Builder";
            this.ReportVersion = version ? version : "1.0";
        } else {
            let colInspect:Col[] = [];
            for (let c:number=0; c<this.ReportRows[1].length; c++) {
                const val:any = this.ReportRows[1][c];
                if ($.isNumeric(val)) {
                    colInspect.push({
                        Index: c,
                        Position: c,
                        IsNumber: true
                    });
                } else {
                    colInspect.push({
                        Index: c,
                        Position: c,
                        IsNumber: false
                    });
                }
            }
            for (const ci of colInspect) {
                let c:Col = {
                    Header: this.ReportRows[0][ci.Index],
                    Index: ci.Index,
                    Position: ci.Index,
                    ShowSettingsIcon: true
                };
                const newCol:Col = new Col(c);
                if (ci.IsNumber) {
                    newCol.Detail.formats.push("align right");
                    newCol.SubTotal.formats.push("align right");
                    newCol.FinalTotal.formats.push("align right");
                    newCol.Detail.formats.push("number");
                    newCol.SubTotal.formats.push("number");
                    newCol.FinalTotal.formats.push("number");
                }
                this.ReportCols.push(newCol);
            }
        }
    }
    Clear():void {
        this.ReportID = -1;
        this.ReportName = "";
        this.ReportCols = [];
        this.ReportRows = [];
        this.ReportVersion = "string";
        return;
    }
    Render(el: string, reRender? : string):void {
        const groupValues:number[] = [];
        let subTotals:number[][] = [];
        let hasSubTotals:boolean = false;
        let hasSubTotalsByGroup:boolean[] = [];
        const finalTotals:number[] = [];
        let hasFinalTotals:boolean = false;
        this.UpdateRowTotalCol();
        const cols:Col[] = this.ReportCols.filter( col => {
            return col.Position>-1;
        });
        cols.sort(function(a:Col,b:Col):number {
            return a.Position - b.Position;
        });
        for (let i:number=0; i<cols.length; i++) {
            const c : Col = cols[i];
            if (c.Group.show) {
                groupValues.push(undefined);
            }
            if (c.FinalTotal.show) {
                hasFinalTotals = true;
                finalTotals.push(0);
            }
        }
        for (let g:number=0; g<groupValues.length; g++) {
            subTotals.push([]);
            hasSubTotalsByGroup[g] = false;
            for (let i:number=0; i<cols.length; i++) {
                const c : Col = cols[i];
                if (c.SubTotal.show) {
                    hasSubTotals = true;
                    hasSubTotalsByGroup[g] = true;
                    subTotals[g].push(0);
                }
            }
        }

        let thead:string = `<thead><tr>`;
        for (let i:number=0; i<cols.length; i++) {
            const c : Col = cols[i];
            thead += c.ShowSettingsIcon ?
            `<th colposition="${c.Position}" colindex="${c.Index}"><span>${c.Header}</span></th>` : `<th>${c.Header}</th>`;
        }
        thead += `</tr></thead>`;

        let tbody:string = reRender==="body" ? `` : `<tbody>`;
        for (let ir:number=1; ir<this.ReportRows.length; ir++) {
            let r:any = this.ReportRows[ir];
            let group:number = 0;
            let subtot:number = 0;
            let fintot:number = 0;
            // save next row in detailrow
            let detailrow:string = `<tr>`;
            for (let i:number=0; i<cols.length; i++) {
                const c : Col = cols[i];
                // calculated field check
                const thisVal:any = r[c.Index];
                if (c.SubTotal.show) {
                    for(let gg:number=0;gg<subTotals.length;gg++) {
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
                    const thisCol:number = c.Index;
                    // on group break
                    if (groupValues[group] !== thisVal) {
                        // if it is NOT the first record, and any column shows subtotals, insert subtotal to tbody now
                        if (groupValues[group] !== undefined) {
                            if (hasSubTotalsByGroup[group]) {
                                tbody += this.subTotalRow(this.ReportCols,subTotals[group]);
                            }
                        }
                        // insert group header row to tbody now
                        let grouprow:string = `<tr>`;
                        for (let g:number=0; g<cols.length; g++) {
                            const group_c : Col = cols[g];
                            let format: IFormatReturn = applyFormat(c.Group.formats);
                            grouprow += thisCol === group_c.Index ? `<td${format.classes}>${thisVal}</td>` : `<td></td>`;
                        }
                        grouprow += `</tr>`;
                        tbody += grouprow;
                        groupValues[group] = thisVal;
                        for(let cg:number=group+1; cg<groupValues.length; cg++) {
                            groupValues[cg]=undefined;
                        }
                    }
                    group++;
                }
                // keep building detailrow
                if (c.Detail.show) {
                    let format: IFormatReturn = applyFormat(c.Detail.formats, r[c.Index]);
                    detailrow += `<td${format.classes}>${format.formatted}</td>`;
                } else {
                    detailrow += `<td></td>`;
                }
            }
            // now add the detail row
            detailrow += `</tr>`;
            if(detailrow.replace(/<tr>/g,"").replace(/<td>/g,"").replace(/<\/td>/g,"").replace(/<\/tr>/g,"").length>0) {
                tbody += detailrow;
            }
        }


        if (hasSubTotals && hasSubTotalsByGroup[groupValues.length-1]) {
            tbody += this.subTotalRow(this.ReportCols,subTotals[groupValues.length-1]);
        }

        if (hasFinalTotals) {
            tbody += this.finalTotalRow(this.ReportCols, finalTotals);
        }

        tbody += reRender==="body" ? `` : `</tbody>`;
        reRender==="body" ? $(el).html(tbody) : $(el).append(thead + tbody);

    }
    ColEditFormats(colindex:number, section:string, formatsonly?:boolean):string {
        const colinfo:ColumnInfo = this.ReportCols[colindex][section];
        let formatdiv:string = ``;
        let formats:string = ``;
        formatdiv += `<div class="formatsdiv d-flex flex-wrap m-0" colindex="${colindex}" section="${section}" >`;
        if(colinfo.formats && colinfo.formats.length>0) {
            for (let j:number=0; j<colinfo.formats.length; j++) {
                formats += `<div class="border rounded font-weight-light font-italic small m-1 px-1 bg-creps">${colinfo.formats[j]}
                 <i class="removeformat fa fa-remove ml-1 clickable" style="height: 4px" formatindex="${j}"></i></div>`;
            }
            formatdiv += formats;
        }
        formatdiv += `</div>`;
        return formatsonly ? formats : formatdiv;
    }
    ColEditForm(posindex: string):string {
        if(!$.isNumeric(posindex)) { return; }
        const position:number =  Number(posindex);
        const cols:Col[] = this.ReportCols.filter(col => { return col.Position>-1; });
        cols.sort(function(a:Col,b:Col):number {
            return a.Position - b.Position;
        });
        const col:Col[] = cols.filter(col => { return col.Position===position; });
        const prev_col:Col = col[0].Position > 0 ? cols[col[0].Position-1] : null;
        const next_col:Col = col[0].Position < cols.length-1 ? cols[col[0].Position+1] : null;
        let form:string = `
            <div class="columneditform btn-group dropright btn-group-sm pl-2">
                <a class="btn excludecheckbox" section="${"Exclude"}" colposition="${col[0].Position}" colindex="${col[0].Index}"
                 href="#"><i class="fa fa-check-square-o"></a></i>
                <a class="btn dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-gear"></i></a>
                <ul class="dropdown-menu" colposition="${col[0].Position}" colindex="${col[0].Index}">`;
                for (const section of ["Header"]) {
                    form += `<div class="p-0 m-0 text-center">`;
                    form += col[0].Position > 0 && !col[0].Group.show && (prev_col && !prev_col.Group.show) ?
                     `<i class="moveleft clickable fa fa-arrow-left"></i>` : `<i class="moveleft gray fa fa-arrow-left"></i>`;
                    form += col[0].Group.show ? ` grouped ` : ` move `;
                    form += col[0].Position < cols.length-1 && !col[0].Group.show && (next_col && !next_col.Group.show) ?
                      `<i class="moveright clickable fa fa-arrow-right"></i></div>` :
                      `<i class="moveright gray fa fa-arrow-right"></i></div>`;
                    form += `<li class="p-2">${section}:<input class="rg-watch" type="text" section="${section}"
                     value="${col[0][section]}"></li>`;
                }
                for (const section of ["Detail", "Group", "SubTotal", "FinalTotal"]) {
                    const colinfo:ColumnInfo = col[0][section];
                    var checked:string = colinfo.show ? " checked=checked" : "";
                    form += `<li class="px-2">${section}:<div class="form-check form-check-inline">
                    <input class="form-check-input rg-watch ml-2" section="${section}" type="checkbox" ${checked}}">
                    <a href="#" class="addformatlink font-weight-light font-italic small ml-2" section="${section}">add format</a></li>`;
                    form += this.ColEditFormats(col[0].Index,section);
                }
                form += `</ul>
            </div>`;

        return form;
    }
    FormatSelectForm():string {
        let form:string = `
            <div id="formatSelectForm" class="position-absolute bg-info border rounded border--dark" style="display:none; z-index:1001;">
                <div class="d-flex flex-column m-0">
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1
                     bg-light clickable">align right</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable">hilite</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable">number</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1
                     bg-light clickable">two decimal</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable">date</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-light clickable">text</div>
                </div>
            </div>`;
        return form;
    }
    private SetGroupColumns():void {
        const groups:Col[] = this.ReportCols.filter(col => { return col.Group.show && col.Position>-1; });
        groups.sort(function(a:Col,b:Col):number {
            return a.Position - b.Position;
        });
        for(let i:number=0;i<groups.length;i++) {
            this.MoveToPosition(groups[i].Position, i);
        }
        this.SortAll();
    }
    private SwitchPosition(fromposition:number,toposition:number):void {
        if(fromposition===toposition) { return; }
        const from:Col[] = this.ReportCols.filter(col => { return col.Position===fromposition; });
        const to:Col[] = this.ReportCols.filter(col => { return col.Position===toposition; });
        if(from[0]) {
            from[0].Position = toposition;
        }
        if(to[0]) {
            to[0].Position = fromposition;
        }
    }
    MoveToPosition(fromposition:number,toposition:number):void {
        if(fromposition===toposition) { return; }
        this.SwitchPosition(fromposition,toposition);
        while(toposition-1>fromposition) {
            toposition--;
            this.SwitchPosition(fromposition,toposition);
        }
        while(toposition+1<fromposition) {
            toposition++;
            this.SwitchPosition(fromposition,toposition);
        }
    }
    private SortAll():void {
        const saveheaders:any = this.ReportRows.shift();
        const cols:Col[] = this.ReportCols.filter(col => { return col.Position>-1; });
        cols.sort(function(a:Col,b:Col):number {
            return a.Position - b.Position;
        });
        for(let i:number=cols.length-1;i>-1;i--) {
            let c: Col = cols[i];
            if(c.Group.show && !c.Sort) {
                c.Sort = 1;
            }
            if(c.Sort) { this.SortData(c.Sort,c); }
         }
        this.ReportRows.unshift(saveheaders);
    }
    SortData(direction:any,col:Col):any {
        function asc(a:any, b:any):number {
            let colA:any = a[col.Index];
            colA = $.isNumeric(colA) ? colA : colA.toUpperCase();
            let colB:any = b[col.Index];
            colB = $.isNumeric(colB) ? colB : colB.toUpperCase();
            let comparison:number = 0;
            if (colA > colB) {
              comparison = 1;
            } else if (colA < colB) {
              comparison = -1;
            }
            return comparison;
        }
        function desc(a:any, b:any):number {
            let colA:any = a[col.Index];
            colA = $.isNumeric(colA) ? colA : colA.toUpperCase();
            let colB:any = b[col.Index];
            colB = $.isNumeric(colB) ? colB : colB.toUpperCase();
            let comparison:number = 0;
            if (colA < colB) {
              comparison = 1;
            } else if (colA > colB) {
              comparison = -1;
            }
            return comparison;
        }
        this.ReportRows = direction==="ascending" || direction===1 ? this.ReportRows.sort(asc) : this.ReportRows.sort(desc);
    }
    AddRowCol():void {
        let c:object = {
            Header: "Total",
            Index: this.ReportCols.length,
            Position: this.ReportCols.length,
            ShowSettingsIcon: true,
            IsRowTotalColumn: true
        };
        const newCol:Col = new Col(c);
        newCol.Detail.formats.push("align right");
        newCol.SubTotal.formats.push("align right");
        newCol.FinalTotal.formats.push("align right");
        newCol.Detail.formats.push("number");
        newCol.SubTotal.formats.push("number");
        newCol.FinalTotal.formats.push("number");
        this.ReportCols.push(newCol);
        this.ReportRows[0].push("Total");
        for (let r:number = 1; r<this.ReportRows.length; r++) {
            let calcval:number = 0;
            for(let ci:number = 0; ci<this.ReportCols.length; ci++) {
                if(this.ReportCols[ci].Position>-1 && $.isNumeric(this.ReportRows[r][ci])) { calcval += Number(this.ReportRows[r][ci]); }
            }
            this.ReportRows[r].push(calcval);
        }
    }
    private UpdateRowTotalCol():void {
        const cols:Col[] = this.ReportCols.filter(col => { return col.Position>-1 && col.IsRowTotalColumn; });
        if(!cols.length) { return; }
        const colindex:number = cols[0].Index;
        for (let r:number = 1; r<this.ReportRows.length; r++) {
            let calcval:number = 0;
            for(let ci:number = 0; ci<this.ReportCols.length; ci++) {
                if(ci!==colindex && this.ReportCols[ci].Position>-1 &&
                    $.isNumeric(this.ReportRows[r][ci])) { calcval += Number(this.ReportRows[r][ci]); }
            }
           this.ReportRows[r][colindex]=calcval;
        }
    }
    private subTotalRow(ReportCols: Col[], subtotals:number[]): string {
        let subtot:number = 0;
        let subtotalrow:string = `<tr>`;
        for (let i:number=0; i<ReportCols.length; i++) {
            const c: Col = ReportCols[i];
            if (c.Position<0) { continue; }
            let subformat: IFormatReturn;
            if (c.SubTotal.show) {
                subformat = applyFormat(c.SubTotal.formats, subtotals[subtot]);
                subtotals[subtot] = 0;
                subtot++;
            } else {
                subformat = applyFormat(c.SubTotal.formats, "");
            }
            subtotalrow += c.SubTotal.show ? `<td${subformat.classes}>${subformat.formatted}</td>` : `<td></td>`;
        }
        subtotalrow += `</tr>`;
        return subtotalrow;
    }
    private finalTotalRow(ReportCols: Col[],finalTotals:number[]): string {
        let fintot:number = 0;
        let finaltotalrow:string = `<tr>`;
        let finalformat: IFormatReturn;
        for (let i:number=0; i<ReportCols.length; i++) {
            const c: Col = ReportCols[i];
            if (c.Position<0) { continue; }
            if (c.FinalTotal.show) {
                finalformat = applyFormat(c.FinalTotal.formats, finalTotals[fintot]);
                fintot++;
            } else {
                finalformat = applyFormat(c.FinalTotal.formats, "");
            }
            finaltotalrow += c.FinalTotal.show ? `<td${finalformat.classes}>${finalformat.formatted}</td>` : `<td></td>`;
        }
        finaltotalrow += `</tr>`;
        return finaltotalrow;
    }
}
export default Report;
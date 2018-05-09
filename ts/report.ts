class Report {
    ReportName: string;
    ReportDataCall: string;
    ReportCols: Report.Col[] = [];
    ReportRows: any[][] = [];
    ReportVersion: string;
    constructor(dataCall: string, rowData: any[][], columnInfo ? : any, name ? : string, version ? : string) {
        this.ReportDataCall = dataCall;
        for (let r = 0; r<rowData.length; r++) {
            this.ReportRows.push(rowData[r]);
        }
        if (columnInfo) {
            for (const c of columnInfo) {
                this.ReportCols.push(new Report.Col(c));
            }
            this.ReportName = name ? name : 'Report Builder';
            this.ReportVersion = version ? version : '1.0';
        } else {
            let colInspect = [];
            for (let c=0; c<this.ReportRows[1].length; c++) {
                const val = this.ReportRows[1][c];
                if ($.isNumeric(val)) {
                    colInspect.push({
                        Index: c,
                        Position: c,
                        IsNumber: true
                    })
                } else {
                    colInspect.push({
                        Index: c,
                        Position: c,
                        IsNumber: false
                    })
                }
            }
            for (const ci of colInspect) {
                let c = {
                    Header: this.ReportRows[0][ci.Index],
                    Index: ci.Index,
                    Position: ci.Index,
                    ShowSettingsIcon: true
                }
                const newCol = new Report.Col(c);
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
    Clear() {
        this.ReportName = '';
        this.ReportCols = [];
        this.ReportRows = [];
        this.ReportVersion = 'string';
        return;
    }
    Render(el: string, reRender? : string) {
        const groupValues = [];
        let subTotals = [];
        let hasSubTotals = false;
        let hasSubTotalsByGroup = [];
        const finalTotals = [];
        let hasFinalTotals = false;
        const cols = this.ReportCols.filter(function(e){ return e.Position>-1; });
        cols.sort(function(a,b){
            return a.Position - b.Position;
        })
        for (let i=0; i<cols.length; i++) {
            const c : Report.Col = cols[i];
            if (c.Group.show) {
                groupValues.push(undefined);
            }            
            if (c.FinalTotal.show) {
                hasFinalTotals = true;
                finalTotals.push(0);
            }
        }
        for (let g=0; g<groupValues.length; g++) {
            subTotals.push([]);
            hasSubTotalsByGroup[g] = false;
            for (let i=0; i<cols.length; i++) {
                const c : Report.Col = cols[i];
                if (c.SubTotal.show) {
                    hasSubTotals = true;
                    hasSubTotalsByGroup[g] = true;
                    subTotals[g].push(0);
                }
            }
        }

        let thead = `<thead><tr>`;
        for (let i=0; i<cols.length; i++) {
            const c : Report.Col = cols[i];
            thead += c.ShowSettingsIcon ? `<th colposition="${c.Position}" colindex="${c.Index}"><span>${c.Header}</span></th>` : `<th>${c.Header}</th>`;
        }
        thead += `</tr></thead>`;

        let tbody = reRender=='body' ? `` : `<tbody>`;
        for (let ir=1; ir<this.ReportRows.length; ir++) {
            let r = this.ReportRows[ir];
            let group = 0;
            let subtot = 0;
            let fintot = 0;
            // save next row in detailrow
            let detailrow = `<tr>`;
            for (let i=0; i<cols.length; i++) {
                const c : Report.Col = cols[i];
                // calculated field check 
                const thisVal = r[c.Index];
                if (c.SubTotal.show) {
                    for(let gg=0;gg<subTotals.length;gg++){
                        subTotals[gg][subtot] += Number(thisVal);
                    }
                    subtot++
                }
                if (c.FinalTotal.show) {
                    finalTotals[fintot] += Number(thisVal);
                    fintot++;
                }
                // insert group header/subtotals to tbody before detailrow 
                if (c.Group.show) {
                    const thisCol = c.Index;
                    
                    // on group break
                    if (groupValues[group] !== thisVal) { 
                        // if it is NOT the first record, and any column shows subtotals, insert subtotal to tbody now
                        if (groupValues[group] !== undefined) {
                            if (hasSubTotalsByGroup[group]) { 
                                tbody += Report.subTotalRow(this.ReportCols,subTotals[group]);
                            }
                        }
                        // insert group header row to tbody now
                        let grouprow = `<tr>`;
                        for (let g=0; g<cols.length; g++) {
                            const group_c : Report.Col = cols[g];
                            let format: Report.IFormatReturn = Report.applyFormat(c.Group);
                            grouprow += thisCol === group_c.Index ? `<td${format.classes}>${thisVal}</td>` : `<td></td>`;
                        }
                        grouprow += `</tr>`;
                        tbody += grouprow;
                        groupValues[group] = thisVal;
                        for(let cg=group+1; cg<groupValues.length; cg++){
                            groupValues[cg]=undefined;
                        }
                    }
                    group++;
                }
                // keep building detailrow
                if (c.Detail.show) {
                    let format: Report.IFormatReturn = Report.applyFormat(c.Detail, r[c.Index]);
                    detailrow += `<td${format.classes}>${format.formatted}</td>`;
                } else {
                    detailrow += `<td></td>`;
                }
            }
            // now add the detail row
            detailrow += `</tr>`;
            if(detailrow.replace(/<tr>/g,'').replace(/<td>/g,'').replace(/<\/td>/g,'').replace(/<\/tr>/g,'').length>0) {
                tbody += detailrow;
            }
        }


        if (hasSubTotals && hasSubTotalsByGroup[groupValues.length-1]) tbody += Report.subTotalRow(this.ReportCols,subTotals[groupValues.length-1]);

        if (hasFinalTotals) tbody += Report.finalTotalRow(this.ReportCols, finalTotals);

        tbody += reRender=='body' ? `` : `</tbody>`;
        reRender=='body' ? $(el).html(tbody) : $(el).append(thead + tbody);

    }
    ColEditFormats(colindex, section, formatsonly?:boolean) {
        const colinfo: Report.ColumnInfo = this.ReportCols[colindex][section];
        let formatdiv = ``;
        let formats = ``;
        formatdiv += `<div class="formatsdiv d-flex flex-wrap m-0" colindex="${colindex}" section="${section}" >`;
        if(colinfo.formats && colinfo.formats.length>0) {
            for (let j=0; j<colinfo.formats.length; j++) {
                formats += `<div class="border rounded font-weight-light font-italic small m-1 px-1 bg-creps">${colinfo.formats[j]} <i class="removeformat fa fa-remove ml-1 clickable" style="height: 4px" formatindex="${j}"></i></div>`;
            }
            formatdiv += formats;
        }
        formatdiv += `</div>`;
        return formatsonly ? formats : formatdiv;
    }
    ColEditForm(posindex: number) {
        const cols = this.ReportCols.filter(function(e){ return e.Position>-1; });
        cols.sort(function(a,b){
            return a.Position - b.Position;
        })
        const col = cols.filter(function(e){ return e.Position==posindex; });
        const prev_col = col[0].Position > 0 ? cols[col[0].Position-1] : false;
        const next_col = col[0].Position < cols.length-1 ? cols[col[0].Position+1] : false;
        let form = `
            <div class="columneditform btn-group dropright btn-group-sm pl-2">
                <a class="btn excludecheckbox" section="${'Exclude'}" colposition="${col[0].Position}" colindex="${col[0].Index}" href="#"><i class="fa fa-check-square-o"></a></i>
                <a class="btn dropdown-toggle" data-toggle="dropdown" href="#"><i class="fa fa-gear"></i></a>
                <ul class="dropdown-menu" colposition="${col[0].Position}" colindex="${col[0].Index}">`
                for (const section of ['Header']) {
                    form += `<div class='p-0 m-0 text-center'>`;
                    form += col[0].Position > 0 && !col[0].Group.show && (prev_col && !prev_col.Group.show) ? `<i class="moveleft clickable fa fa-arrow-left"></i>` : `<i class="moveleft gray fa fa-arrow-left"></i>`;
                    form += col[0].Group.show ? ` grouped ` : ` move `; 
                    form += col[0].Position < cols.length-1 && !col[0].Group.show && (next_col && !next_col.Group.show) ?  `<i class="moveright clickable fa fa-arrow-right"></i></div>` : `<i class="moveright gray fa fa-arrow-right"></i></div>`;
                    form += `<li class="p-2">${section}:<input class="rg-watch" type="text" section="${section}" value="${col[0][section]}"></li>`;
                }
                for (const section of ['Detail', 'Group', 'SubTotal', 'FinalTotal']) {
                    const colinfo: Report.ColumnInfo = col[0][section];
                    var checked = colinfo.show ? ' checked=checked' : '';
                    form += `<li class="px-2">${section}:<div class="form-check form-check-inline">
                    <input class="form-check-input rg-watch ml-2" section="${section}" type="checkbox" ${checked}}">
                    <a href="#" class="addformatlink font-weight-light font-italic small ml-2" section="${section}">add format</a></li>`;
                    form += this.ColEditFormats(col[0].Index,section);
                }
                form += `</ul>
            </div>`;

        return form;
    }
    FormatSelectForm() {
        let form = `
            <div id="formatSelectForm" class="position-absolute bg-floralwhite border rounded border--olive" style="display:none; z-index:1001;">
                <div class="d-flex flex-column m-0">
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable">align right</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable">hilite</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable">number</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable">two decimal</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable">date</div>
                    <div class="addformatitem border rounded font-weight-light font-italic small m-1 px-1 bg-creps clickable">text</div>
                </div>
            </div>`
        return form;
    }
    SetGroupColumns(){
        const groups = this.ReportCols.filter(function(e){ return e.Group.show && e.Position>-1; });
        groups.sort(function(a,b){
            return a.Position - b.Position;
        })
        for(let i=0;i<groups.length;i++){
            this.MoveToPosition(groups[i].Position, i);
        }
        this.SortAll();
    }
    SwitchPosition(fromposition,toposition){
        const from = this.ReportCols.filter(function(e){ return e.Position==fromposition; });
        const to = this.ReportCols.filter(function(e){ return e.Position==toposition; });
        from[0].Position = toposition;
        to[0].Position = fromposition;
    }
    MoveToPosition(fromposition,toposition){
        this.SwitchPosition(fromposition,toposition);
        while(toposition-1>fromposition){
            toposition--;
            this.SwitchPosition(fromposition,toposition);
        }
        while(toposition+1<fromposition){
            toposition++;
            this.SwitchPosition(fromposition,toposition);
        }
    }
    SortAll(){
        const saveheaders = this.ReportRows.shift();
        const cols = this.ReportCols.filter(function(e){ return e.Position>-1; });
        cols.sort(function(a,b){
            return a.Position - b.Position;
        })
        for(let i=cols.length-1;i>-1;i--){
            let c: Report.Col = cols[i];
            if(c.Group.show && !c.Sort) {
                c.Sort = 1;
            } 
            if(c.Sort) this.SortData(c.Sort,c);
         }
        this.ReportRows.unshift(saveheaders);
    }
    SortData(direction,col:Report.Col) {
        function asc(a, b) {
            let colA = a[col.Index];
            colA = $.isNumeric(colA) ? colA : colA.toUpperCase();
            let colB = b[col.Index];
            colB = $.isNumeric(colB) ? colB : colB.toUpperCase();
            let comparison = 0;
            if (colA > colB) {
              comparison = 1;
            } else if (colA < colB) {
              comparison = -1;
            }
            return comparison;
        }
        function desc(a, b) {
            let colA = a[col.Index];
            colA = $.isNumeric(colA) ? colA : colA.toUpperCase();
            let colB = b[col.Index];
            colB = $.isNumeric(colB) ? colB : colB.toUpperCase();
            let comparison = 0;
            if (colA < colB) {
              comparison = 1;
            } else if (colA > colB) {
              comparison = -1;
            }
            return comparison;
        }
        this.ReportRows = direction=='ascending' || direction==1 ? this.ReportRows.sort(asc) : this.ReportRows.sort(desc);
    }
    AddRowCol() {   
        let c = {
            Header: 'Total',
            Index: this.ReportCols.length,
            Position: this.ReportCols.length,
            ShowSettingsIcon: true
        }
        const newCol = new Report.Col(c);
        newCol.Detail.formats.push('align right');
        newCol.SubTotal.formats.push('align right');
        newCol.FinalTotal.formats.push('align right');
        newCol.Detail.formats.push('number');
        newCol.SubTotal.formats.push('number');
        newCol.FinalTotal.formats.push('number');
        this.ReportCols.push(newCol); 
        this.ReportRows[0].push('Total')
        for (let r = 1; r<this.ReportRows.length; r++) {
            let calcval = 0;
            for(const ci in this.ReportRows[r]) {
                if($.isNumeric(this.ReportRows[r][ci])) calcval += Number(this.ReportRows[r][ci]);
            }
            this.ReportRows[r].push(calcval);
        }
    }
}

namespace Report {
    enum Sort {
        none,
        asc,
        desc
    }
    export interface IFormat {
        type: string;
        value: string;
    }
    export interface IFormatReturn {
        classes: string;
        formatted: string;
    }
    export class ColumnInfo {
        show: boolean;
        formats: string[] = [];
    }
    export class Col {
        Header ? : string;
        Index: number;
        Position: number;
        Sort ? : Sort;
        Group ? : ColumnInfo = {
            show: false,
            formats: []
        };
        Detail ? : ColumnInfo = {
            show: true,
            formats: []
        };
        SubTotal ? : ColumnInfo = {
            show: false,
            formats: []
        };
        FinalTotal ? : ColumnInfo = {
            show: false,
            formats: []
        };
        ShowSettingsIcon ? : boolean = false;
        constructor(json_in: any) {
            $.extend(this, json_in);
        }
    }
    function getFormat(formatname) {
       switch(formatname){
        case 'align right':
            return {type:'class', value:'text-right'};
        case 'hilite':
            return {type:'class', value:'hilite'};
        case 'number':
            return {type:'number', value:'n'};
        case 'two decimal':
            return {type:'number', value:'.99'};
        case 'date':
            return {type:'date', value:'date'};
        default:
            if(formatname.slice(0,5)=='text='){
                return {type:'text', value:formatname.slice(5)};
            }
            return null;
       }
    }
    export function applyFormat(df: Report.ColumnInfo, data ? : any): IFormatReturn {
        let formatReturn: IFormatReturn = {
            classes: '',
            formatted: data
        };
        for (const f of df.formats) {
            let format = getFormat(f);
            switch (format.type) {
                case 'class':
                    formatReturn.classes += format.type === 'class' ? format.value + ' ' : '';
                    break
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
                    const tarray = format.value.split('{val}');
                    if(tarray.length==0){
                        formatReturn.formatted = tarray[0];
                    } else {
                        let tbuilder = '';
                        for(let i=0; i<tarray.length-1; i++){
                            tbuilder += tarray[i] + data;
                        }
                        tbuilder += tarray[tarray.length-1];
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
    export function subTotalRow(ReportCols: Col[], subtotals): string {
        let subtot = 0;
        let subtotalrow = `<tr>`;
        for (let i=0; i<ReportCols.length; i++) {
            const c: Col = ReportCols[i];
            if (c.Position<0) continue;
            let subformat: IFormatReturn;
            if (c.SubTotal.show) {
                subformat = Report.applyFormat(c.SubTotal, subtotals[subtot]);
                subtotals[subtot] = 0;
                subtot++;
            } else {
                subformat = Report.applyFormat(c.SubTotal, '');
            }
            subtotalrow += c.SubTotal.show ? `<td${subformat.classes}>${subformat.formatted}</td>` : `<td></td>`;
        }
        subtotalrow += `</tr>`
        return subtotalrow;
    }
    export function finalTotalRow(ReportCols: Col[],finalTotals): string {
        let fintot = 0;
        let finaltotalrow = `<tr>`;
        let finalformat: IFormatReturn;
        for (let i=0; i<ReportCols.length; i++) {
            const c: Col = ReportCols[i];
            if (c.Position<0) continue;
            if (c.FinalTotal.show) {
                finalformat = Report.applyFormat(c.FinalTotal, finalTotals[fintot]);
                fintot++;
            } else {
                finalformat = Report.applyFormat(c.FinalTotal, '');
            }
            finaltotalrow += c.FinalTotal.show ? `<td${finalformat.classes}>${finalformat.formatted}</td>` : `<td></td>`;
        }
        finaltotalrow += `</tr>`
        return finaltotalrow;
    }
}
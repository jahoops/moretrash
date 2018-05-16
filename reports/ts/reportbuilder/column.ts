import {IFormat} from "./format";

export class ColumnInfo {
    show: boolean;
    formats: IFormat[] = [];
}
enum Sort {
    none,
    asc,
    desc
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
    IsNumber ? : boolean = false;
    ShowSettingsIcon ? : boolean = false;
    IsRowTotalColumn ? : boolean = false;
    constructor(json_in: any) {
        $.extend(this, json_in);
    }
}

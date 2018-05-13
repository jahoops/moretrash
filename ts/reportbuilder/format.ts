export interface IFormat {
    type: string;
    value: string;
}
export interface IFormatReturn {
    classes: string;
    formatted: string;
}
function  getFormat(formatname:string):IFormat {
    switch(formatname) {
    case "align right":
        return {type:"class", value:"text-right"};
    case "hilite":
        return {type:"class", value:"hilite"};
    case "number":
        return {type:"number", value:"n"};
    case "two decimal":
        return {type:"number", value:".99"};
    case "date":
        return {type:"date", value:"date"};
    default:
        if(formatname.slice(0,5)==="text=") {
            return {type:"text", value:formatname.slice(5)};
        }
        return null;
    }
}
export function applyFormat(formats: string[], data ? : any): IFormatReturn {
    let formatReturn: IFormatReturn = {
        classes: "",
        formatted: data
    };
    for (const f of formats) {
        let format:IFormat = getFormat(f);
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
                const tarray:string[] = format.value.split("{val}");
                if(tarray.length===0) {
                    formatReturn.formatted = tarray[0];
                } else {
                    let tbuilder:string = "";
                    for(let i:number=0; i<tarray.length-1; i++) {
                        tbuilder += tarray[i] + data;
                    }
                    tbuilder += tarray[tarray.length-1];
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


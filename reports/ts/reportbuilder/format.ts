export interface IFormat {
    type: string;
    value: string;
}
export interface IFormatReturn {
    classes: string;
    formatted: string;
}
export function ApplyFormat(formats: IFormat[], data ? : any): IFormatReturn {
    let formatReturn: IFormatReturn = {
        classes: "",
        formatted: data
    };
    for (const format of formats) {
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
                formatReturn.formatted = moment(data).format(format.value);
                break;
            case "addtext":
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

export function FormatSelectForm():string {
    const backgroundcolor:string[] = ["bg-hilite","bg-navy","bg-blue","bg-aqua","bg-teal","bg-olive","bg-green"
    ,"bg-lime","bg-yellow","bg-orange","bg-red","bg-fuchsia","bg-purple","bg-maroon","bg-white"
    ,"bg-gray","bg-silver","bg-black"];
    let backgroundcolors:string = "";
        for(let i:number=0; i<backgroundcolor.length;i++) {
            let f:string = backgroundcolor[i];
            backgroundcolors += `<li class="dropdown-item ${f}"><a class="addformatitem" href="#" cformat="${f}">${f}</a></li>`;
        }
    const textcolor:string[] = ["navy","blue","aqua","teal","olive","green","lime","yellow","orange","red"
    ,"fuchsia","purple","maroon","white","silver","gray","black"];
    let textcolors:string = "";
        for(let i:number=0; i<textcolor.length;i++) {
            let f:string = textcolor[i];
            textcolors += `<li class="dropdown-item ${f}"><a class="addformatitem" href="#" cformat="${f}">${f}</a></li>`;
        }
    const textalign:string[] = ["text-left","text-center","text-right"];
    let textaligns:string = "";
        for(let i:number=0; i<textalign.length;i++) {
            let f:string = textalign[i];
            textaligns += `<li class="dropdown-item ${f}"><a class="addformatitem" href="#" cformat="${f}">${f}</a></li>`;
        }
    const texttransform:string[] = ["text-lowercase","text-uppercase","text-capitalize"];
    let texttransforms:string = "";
        for(let i:number=0; i<texttransform.length;i++) {
            let f:string = texttransform[i];
            texttransforms += `<li class="dropdown-item ${f}"><a class="addformatitem" href="#" cformat="${f}">${f}</a></li>`;
        }
    const textfont:string[] = ["font-weight-bold","font-weight-normal","font-weight-light","font-italic"];
    let textfonts:string = "";
        for(let i:number=0; i<textfont.length;i++) {
            let f:string = textfont[i];
            textfonts += `<li class="dropdown-item ${f}"><a class="addformatitem" href="#" cformat="${f}">${f}</a></li>`;
        }
    const numberformat:string[] = ["number","two decimal"];
    let numberformats:string = "";
        for(let i:number=0; i<numberformat.length;i++) {
            let f:string = numberformat[i];
            numberformats += `<li class="dropdown-item"><a class="addformatitem" href="#" nformat="${f}">${f}</a></li>`;
        }
    const dateformat:string[] = ["MM-DD-YYYY","MM-YYYY"];
    let dateformats:string = "";
        for(let i:number=0; i<dateformat.length;i++) {
            let f:string = dateformat[i];
            dateformats += `<li class="dropdown-item"><a class="addformatitem" href="#" dformat="${f}">${f}</a></li>`;
        }

    let form:string = `
        <div id="formatSelectForm" class="position-absolute bg-info border rounded border--dark" style="z-index:1002;">
            <div class="dropdown">
                <ul class="dropdown-menu multi-level" role="menu" aria-labelledby="dropdownMenu">
                    <li class="dropdown-item"><a class="addformatitem" href="#" tformat="addtext">Add Text</a></li>
                    <li class="dropdown-submenu"><a class="dropdown-item" tabindex="-1" href="#">Number Formats</a>
                        <ul class="dropdown-menu">
                        ${numberformats}
                        </ul>
                    </li>
                    <li class="dropdown-submenu"><a class="dropdown-item" tabindex="-1" href="#">Date Formats</a>
                        <ul class="dropdown-menu">
                        ${dateformats}
                        </ul>
                    </li>
                    <li class="dropdown-submenu"><a class="dropdown-item" tabindex="-1" href="#">Text Alignment</a>
                        <ul class="dropdown-menu">
                        ${textaligns}
                        </ul>
                    </li>
                    <li class="dropdown-submenu"><a class="dropdown-item" tabindex="-1" href="#">Text Transform</a>
                        <ul class="dropdown-menu">
                        ${texttransforms}
                        </ul>
                    </li>
                    <li class="dropdown-submenu"><a class="dropdown-item" tabindex="-1" href="#">Text Bold/Italic</a>
                        <ul class="dropdown-menu">
                        ${textfonts}
                        </ul>
                    </li>
                    <li class="dropdown-submenu"><a class="dropdown-item" tabindex="-1" href="#">Text Color</a>
                        <ul class="dropdown-menu">
                        ${textcolors}
                        </ul>
                    </li>
                    <li class="dropdown-submenu"><a class="dropdown-item" tabindex="-1" href="#">Background Color</a>
                        <ul class="dropdown-menu">
                        ${backgroundcolors}
                        </ul>
                    </li>
                </ul>
            </div>
        </div>`;
    return form;
}


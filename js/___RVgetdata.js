var reportinfo = {};

function RBreturndata(reportid, varlist, callback) {
    getreportinfo(reportid);
    getAJAXData(varlist, callback);
}
function getAJAXData(varlist, callback) {
    startSpinCSS($('#reportTable'),'loadreport',true);
    $.ajax({
        type: 'POST',
        url: "cfc/Reports.cfc",
        data: {
            method: "ReturnJSONbyFunction",
            Func: reportinfo.reportDataCall,
            Vars: JSON.stringify(varlist)
        },
        success: function (data) {
            data = $.parseJSON(data, true);
            if(reportinfo.reportCols) {
                for(var c=0; c<reportinfo.reportCols.length; c++){
                    data.COLUMNS[c] = reportinfo.reportCols[c].Header ? reportinfo.reportCols[c].Header: data.COLUMNS[c];
                }
            }
            data.DATA.unshift(data.COLUMNS);
            callback(reportinfo, data.DATA);
        },
        error: function (data) {
            console.log("ReportViewer ajax fail: " + data);
        },
        complete: function () {
            stopSpinCSS($('#reportTable'));
        }
    });
}
function getreportinfo(reportid) {
    $.ajax({
        type: 'POST',
        async: false,
        url: "cfc/Reports.cfc",
        data: {
            method: "SelectReportBuilder",
            ID: reportid
        },
        success: function (data) {
            if(!data) return;
            var reports = queryToObject(JSON.parse(data));
            for(var i=0; i<reports.length; i++){
                try {
                    var r = '';
                    r = JSON.parse(reports[i].reportjson);
                    r.reportID =reports[i].reportbuilderid;
                    r.reportName = reports[i].reportname;
                    reportinfo = r;
                } catch (e) {
                    continue;
                }
            }     
        },
        error: function (data) {
            console.log("ReportViewer ajax fail: " + data);
        },
        complete: function () {
        }
    }); 
}


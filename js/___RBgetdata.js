reportlist = [];

function RBreturndata(reportinfo, callback) {
    if(reportinfo.reportname) {
        for(var i=0; i<reportlist.length; i++){
            if(reportlist[i].reportName==reportinfo.reportname){ 
                reportinfo.datacall = reportlist[i].reportDataCall;
                reportinfo.reportcols = reportlist[i].reportCols;
                reportinfo.reportpivot = reportlist[i].reportPivot;
                callback(reportinfo, getdatafromdataset(reportinfo.datacall));
                break; 
            }
        }
    } else {
        if(reportinfo.datacall) {
            callback(reportinfo, getdatafromdataset(reportinfo.datacall));
        }
    }
}

function getdatafromdataset(datasetname){
    for(var i=0; i<datasets.length; i++){
        if(datasets[i].name==datasetname){
            return datasets[i].data;
        }
    }
}

function RBreturnsavedreports() {
    initreportlist();
    var options = '<option value="">~ Select saved report ~</option>';
    for(var i=0; i<reportlist.length; i++){
        options += '<option value="' + reportlist[i].reportName + '">' + reportlist[i].reportName + '</option>';
    }
    return options;
}
function RBreturndatasources() {
    var options = '<option value="">~ Select data source ~</option>';
    for(var i=0; i<datasets.length; i++){
        options += '<option value="' + datasets[i].name + '">' + datasets[i].name + '</option>';
    }
    return options;
}
function initreportlist() {
    var jsonstring = localStorage.getItem('reportlist');
    if(!jsonstring) return;
    reportlist = $.parseJSON(jsonstring);
    if(!isArray(reportlist)) reportlist = [];
}
function RBsavereport(report, pivotJSON) {
    var reportName = report.ReportName;
    var reportDataCall = report.ReportDataCall;
    var reportCols = report.ReportCols;
    var reportInfo = {'reportName':reportName,'reportDataCall':reportDataCall, 'reportCols':reportCols,'reportPivot':pivotJSON};
    var found = -1;
    for(var i=0; i<reportlist.length; i++){
        if(reportlist[i].reportName==reportName){ found=i; break; }
    }
    if(found>-1){
        var rc = confirm(reportName + ' already exists.  Replace?');
        if(rc) {
            reportlist[found] = reportInfo;
            var savestring = JSON.stringify(reportlist);
            localStorage.setItem('reportlist', savestring);
        }
    } else {
        reportlist.push(reportInfo);
        var savestring = JSON.stringify(reportlist);
        localStorage.setItem('reportlist', savestring);
    }
}

function isArray (value) {
    return value && typeof value === 'object' && value.constructor === Array;
}

var datasets =  [{  name : 'rowJSONarray',
                    data : [    ["TechName","ProbClassName","Closed_Tickets","TicketsTimeOnTask","Past_Due"],
                                ["Bob","New Feature",14,103,1],
                                ["Bob","Bug",21,421,0],
                                ["Bob","Bug",5,81,0],
                                ["Bob","Meeting",2,60,0],
                                ["Sue","New Feature",22,371,3],
                                ["Sue","Bug",10,82,1],
                                ["Sue","Meeting",4,180,0],
                                ["Sue","Documentation",1,60,0],
                                ["Zack","Documentation",8,320,2],
                                ["Zack","Documentation",4,120,0]
                            ]
                },
                {   name : 'special',
                    data : [    ["State","City","Leaving","New Business","Shut Down"],
                                ["California","San Jose",14,103,1],
                                ["California","Los Angeles",21,421,0],
                                ["California","Los Angeles",5,81,0],
                                ["California","Sacremento",2,60,0],
                                ["Michigan","Detroit",22,371,3],
                                ["Michigan","Grand Rapids",10,82,1],
                                ["Michigan","Warren",4,180,0],
                                ["Vermont","Documentation",1,60,0],
                                ["Vermont","Documentation",8,320,2],
                                ["Vermont","Documentation",4,120,0]
                            ]
                }   
            ];


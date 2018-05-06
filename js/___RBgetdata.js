function RBloadtable(callback) {
    callback(rowJSONarray);
}
function RBloadsaved() {
}
function RBreturndatasources() {
    var options = '<option value="">~ Select data source ~</option>';
    options += '<option value="RowJSON">RowJSON</option>';
    return options;
}
function RBsavereport() {
    var reportName = $('#reportName').val();
    var reportDataCall = $('#dataSource option:selected').text();
    var reportCols = report.ReportCols;
    var reportInfo = JSON.stringify({'reportName':reportName,'reportDataCall':reportDataCall, 'reportCols':reportCols});
    var id = $('#reportTable').attr('reportid');
    if($.isNumeric(id)){
        //update        
    } else {
        //add
    }
}

var rowJSON = [
    {
        "TechName": "Bob",
        "ProbClassName": "New Feature",
        "Closed_Tickets": 14,
        "TicketsTimeOnTask": 103,
        "Past_Due": 1
    },
    {
        "TechName": "Bob",
        "ProbClassName": "Bug",
        "Closed_Tickets": 21,
        "TicketsTimeOnTask": 421,
        "Past_Due": 0
    },
    {
        "TechName": "Bob",
        "ProbClassName": "Bug",
        "Closed_Tickets": 5,
        "TicketsTimeOnTask": 81,
        "Past_Due": 0
    },
    {
        "TechName": "Bob",
        "ProbClassName": "Meeting",
        "Closed_Tickets": 2,
        "TicketsTimeOnTask": 60,
        "Past_Due": 0
    },
    {
        "TechName": "Sue",
        "ProbClassName": "New Feature",
        "Closed_Tickets": 22,
        "TicketsTimeOnTask": 371,
        "Past_Due": 3
    },
    {
        "TechName": "Sue",
        "ProbClassName": "Bug",
        "Closed_Tickets": 10,
        "TicketsTimeOnTask": 82,
        "Past_Due": 1
    },
    {
        "TechName": "Sue",
        "ProbClassName": "Meeting",
        "Closed_Tickets": 4,
        "TicketsTimeOnTask": 180,
        "Past_Due": 0
    },
    {
        "TechName": "Sue",
        "ProbClassName": "Documentation",
        "Closed_Tickets": 1,
        "TicketsTimeOnTask": 60,
        "Past_Due": 0
    },
    {
        "TechName": "Zack",
        "ProbClassName": "Documentation",
        "Closed_Tickets": 8,
        "TicketsTimeOnTask": 320,
        "Past_Due": 2
    },
    {
        "TechName": "Zack",
        "ProbClassName": "Documentation",
        "Closed_Tickets": 4,
        "TicketsTimeOnTask": 120,
        "Past_Due": 0
    }         
];
var rowJSONarray = [    ["TechName","ProbClassName","Closed_Tickets","TicketsTimeOnTask","Past_Due"],
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
                    ];


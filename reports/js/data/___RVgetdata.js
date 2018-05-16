var reportinfo = {};

function RBreturndata(reportid, varlist, callback) {
    //getreportinfo(reportid);
    reportinfo.reportID = reportid;
    reportinfo.reportName = reportid;
    reportinfo.reportDataCall = "rowJSONarray";
    getAJAXData(varlist, callback);
}

function getAJAXData(varlist, callback) {
    callback(reportinfo, getdatafromdataset("rowJSONarray"));
}

function getreportinfo(reportid) {
    // var jsonstring = localStorage.getItem('reportlist');
    // reportlist = $.parseJSON(jsonstring);
    // for(var i=0; i<reportlist.length; i++){
    //     if(reportlist[i].reportName==reportid){
    //         reportinfo = reportlist[i];
    //         reportinfo.reportID = reportinfo.reportName;
    //     }
    // }
}

function getdatafromdataset(datasetname){
    for(var i=0; i<datasets.length; i++){
        if(datasets[i].name==datasetname){
            return datasets[i].data;
        }
    }
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


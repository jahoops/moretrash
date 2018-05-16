SystemJS.config({
    meta: {
        "reports/js/report.js": {
            format: "system"
        }
    }
});

var report;

SystemJS.import("reports/js/report.js").then(function(rb){ 

    $(function () {
        var varlist = {};
        var params = new URLSearchParams(location.search.toLowerCase());
        var rv = params.get("rv") ? params.get("rv").toString() : "";
        var title = params.get("ttl") ? params.get("ttl").toString() : "Report";
        varlist.deptid = params.get("deptid") ? params.get("deptid").toString() : "";
        varlist.startdate = params.get("startdate") ? params.get("startdate").toString() : "";
        varlist.enddate = params.get("enddate") ? params.get("enddate").toString() : "";
        varlist.teamid = params.get("teamid") ? params.get("teamid").toString() : "";
        varlist.techid = params.get("techid") ? params.get("techid").toString() : "";
        varlist.catid = params.get("catid") ? params.get("catid").toString() : "";
        varlist.plotby = params.get("plotby") ? params.get("plotby").toString() : "";

        if(rv===""){
            //invalid report id
        } else {
            RBreturndata(rv, varlist, loadReport);
        }

        function loadReport(reportinfo, jsonData) {
            if (report) {
                report.Clear();
            }
            report = new rb.default(reportinfo.reportDataCall, jsonData, reportinfo.reportCols, reportinfo.reportID, reportinfo.reportName, "1.0");
            report.title = title;
            try {
                report.pivotJSON = JSON.parse(reportinfo.reportPivot);
            } catch (e){
            }   
            renderReport();
        }

        function renderReport(reRender) {
            $("#reportTable").empty();
            report.Render($("#reportTable"),reRender);
            $("th.sorting").off("click").on("click", function(){
                var colindex = $(this).attr("colindex");
                direction = $(this).hasClass("ascending") ? "ascending" : "descending";
                report.SortData(direction, report.ReportCols[colindex]);
                renderReport();
            });
            if(report.pivotJSON && $("#pivotjs").html()=="") renderPivot();
        }

        function renderPivot(){
            $("#refreshPivotChart").show();
            $("#hidePivotEditor").show();
            var defaultJSON = {
                aggregatorName: "Sum",
                renderers: $.extend(
                        $.pivotUtilities.renderers,
                        $.pivotUtilities.c3_renderers,
                        $.pivotUtilities.d3_renderers,
                        $.pivotUtilities.plotly_renderers,
                        $.pivotUtilities.export_renderers
                ),
                rendererOptions: {
                    width:500
                }
            };
            $.extend(defaultJSON, report.pivotJSON);
            $("#pivotjs").pivotUI(report.ReportRows,defaultJSON,true);
            $(".pvtAxisContainer, .pvtVals").hide();
        }
        $("#printBtn").printPreview({
            obj2print:"#printReportDiv"
        });
    });
}).catch(function(err){ console.error(err); });

function exportCSV() {
    var getdata = report.ExportData();
    var csv = Papa.unparse(getdata);
    download(new Blob([csv]), report.title + " - " + moment().format("MM/DD/YY").toString() + ".csv", "text/plain");
}

$('.alert').alert();
function alertThenFade(alertel, waitms){
    $(alertel).show();
    setTimeout(function(){
        $(alertel).alert('close');
    },waitms);
}
function selectElementContents(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
        document.execCommand("copy");
        sel.removeAllRanges();
        alertThenFade($('#copyalert'),2000);
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
        range.execCommand("Copy");
        sel.removeAllRanges();
        alertThenFade($('#copyalert'),2000);
    }
}

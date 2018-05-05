

function RBloadtable() {
}
function RBloadsaved() {
}
function RBreturndatasources() {
    var options = '<option value="">~ Select data source ~</option>';
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
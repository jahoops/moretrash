$('#btnExport').hide();

var standardReportObj = {
    dom:"<'row'<'col'B><'col'f>><'row't><'row'<'col'i>>",
    buttons: [
        { extend: 'print',
            autoPrint: false,
            exportOptions: {
                stripHtml: true
            },
            customize: function(win) {
                var medias = win.document.querySelectorAll('[type="text/css"]');
                for(var i=0; i < medias.length;i++){ 
                    if(medias.item(i).href && medias.item(i).href.indexOf('standard-report.css')>0 || medias.item(i).href && medias.item(i).href.indexOf('bootstrap')>0){
                         medias.item(i).media="all";
                    } else {
                    }
                }
                var title1 = $('#printReportDiv #divTitle').text().trim();
                var title2 = '<h5>' + $('#printReportDiv #divParams .col:first-child').text().trim() + '</h5>';
                $(win.document.head).find('title').html(title1);
                $(win.document.body).prepend(title2);
                $(win.document.body).find('h1').remove();
                $(win.document.body).css('background','none');
            } 
        },
        'copyHtml5',
        'excelHtml5',
        'csvHtml5'
    ],
    "paging": false,
    "order": [],
    "stripeClasses": []
};

var varlist = {};

$(function() {
    var params = new URLSearchParams(location.search.toLowerCase());
    varlist.deptid = params.get('deptid') ? params.get('deptid').toString() : '';
    varlist.startdate = params.get('startdate') ? params.get('startdate').toString() : '';
    varlist.enddate = params.get('enddate') ? params.get('enddate').toString() : '';
    varlist.teamid = params.get('teamid') ? params.get('teamid').toString() : '';
    varlist.techid = params.get('techid') ? params.get('techid').toString() : '';
    varlist.catid = params.get('catid') ? params.get('catid').toString() : '';
    varlist.plotby = params.get('plotby') ? params.get('plotby').toString() : '';

    $('.dt-buttons').addClass('no-print');
    $('.dataTables_filter').addClass('no-print');
});

function reportFromJSON(tableEl, reportJSON, reportCallback, newvarlist){
    if(newvarlist) varlist = newvarlist;
    $(tableEl).empty();
    startSpinCSS($(tableEl), 'loadreport', false);
    $.ajax({
        type: 'POST',
        url: "cfc/Reports.cfc",
        data: {
            method: "ReturnJSONbyFunction",
            Func: reportJSON.reportDataCall,
            Vars: JSON.stringify(varlist)
        },
        success: function (data) {
            data = $.parseJSON(data, true);
            data = queryToObjectNoNulls(data);
            var report = new Report(data, reportJSON.reportCols, reportJSON.reportName, '2.0');
            report.Render(tableEl);
            $(tableEl).DataTable(standardReportObj);
            $(tableEl + ' th').on('click',function(e){
                var colindex = $(this).attr('colindex');
                var direction = $(this).attr('aria-sort');
                report.SortData(colindex, direction);
                report.Render($(tableEl + ' tbody'), 'body');
            });
        },
        error: function (data) {
            console.log("ReportBuilder ajax fail: " + data);
        },
        complete: function () {
            stopSpinCSS($(tableEl));
        }
    });
}
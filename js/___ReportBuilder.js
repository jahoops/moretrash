$(function () {
    var params = new URLSearchParams(location.search.toLowerCase());
    var varlist = {};
    varlist.deptid = params.get('deptid') ? params.get('deptid').toString() : '';
    varlist.startdate = params.get('startdate') ? params.get('startdate').toString() : '';
    varlist.enddate = params.get('enddate') ? params.get('enddate').toString() : '';
    varlist.teamid = params.get('teamid') ? params.get('teamid').toString() : '';
    varlist.techid = params.get('techid') ? params.get('techid').toString() : '';
    varlist.catid = params.get('catid') ? params.get('catid').toString() : '';
    varlist.plotby = params.get('plotby') ? params.get('plotby').toString() : '';

    var report;
    var pivotJSON;

    $('#saveReportButton').on('click', function(e){
        e.preventDefault();
        var newname = $('#reportName').val();
        if(!newname) {
            $('#reportName').focus();
            alert('No name selected');
            return;
        }
        report.ReportName = newname; 
        RBsavereport(report, pivotJSON);
        loadsavedreports();
    });

    $('#addrowtotal').on('click', function(){
        if(report) {
             report.AddRowCol();
             renderReport();
        }
    });

    function loadsavedreports(){
        var opts = RBreturnsavedreports();
        $('#savedReportList').html(opts);   
    }
    loadsavedreports();

    $('#savedReportList').on('change', function () {
        var reportid = $('option:selected', this).val();
        var reportname = $('option:selected', this).text();
        if (!reportid) return;
        $('#reportName').val(reportname);
        RBreturndata({ reportid:reportid, reportname:reportname, datacall:false, varlist:varlist }, loadReport);
    });
    $('#refreshPivotChart').on('click', function () {
        renderPivot();
    });

    opts = RBreturndatasources();
    $('#dataSource').html(opts);

    $('#dataSource').on('change', function () {
        var datacall = $('option:selected', this).val();
        if (!datacall) return;
        RBreturndata({ reportid:false, datacall:datacall, varlist:varlist }, loadReport);
    });

    function loadReport(reportinfo, jsonData) {
        if (report) {
            report.Clear();
        }
        if(reportinfo.reportid) {
            report = new Report(reportinfo.datacall, jsonData, reportinfo.reportcols, reportinfo.reportid, reportinfo.reportname, '1.0');
            pivotJSON = JSON.parse(reportinfo.reportpivot);
        } else {
            report = new Report(reportinfo.datacall, jsonData);
        }         
        renderReport();
    }

    function renderReport(reRender) {
        $('#reportTable').empty();
        report.Render($('#reportTable'),reRender);
        setHeaders();
        if($("#pivotjs").html()=='') renderPivot();
    }

    function renderPivot(){
        $('#refreshPivotChart').show();
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
            },
            onRefresh: function(config) {
                var config_copy = JSON.parse(JSON.stringify(config));
                //delete some values which are functions
                delete config_copy['aggregators'];
                delete config_copy['renderers'];
                //delete some bulky default values
                delete config_copy['rendererOptions'];
                delete config_copy['localeStrings'];
                pivotJSON = JSON.stringify(config_copy, undefined, 2);
            }
        };
        $.extend(defaultJSON, pivotJSON);
        $('#pivotjs').pivotUI(report.ReportRows,defaultJSON,true);
    }

    function setHeaders() {
        $('#reportTable .formatselect').remove();
        var formatselect = report.FormatSelectForm();
        $('#reportTable').append($(formatselect));
        
        $("th").each(function () {
            var colposition = $(this).attr('colposition');
            if ($.isNumeric(colposition)) {
                var colinfo = report.ColEditForm(colposition);
                $(this).append($(colinfo));
            }
        });
        $("th .moveleft").on('click', function () {
            var fromindex = $(this).closest('ul').attr('colposition');
            var toindex = Number(fromindex) - 1;
            report.MoveToPosition(fromindex,toindex);
            renderReport(true);
        });
        $("th .moveright").on('click', function () {
            var fromindex = $(this).closest('ul').attr('colposition');
            var toindex = Number(fromindex) + 1;
            report.MoveToPosition(fromindex,toindex);
            renderReport(true);
        });
        $("th .excludecheckbox").on('click', function () {
            var colindex = $(this).attr('colindex');
            report.ReportCols[colindex].Position = -1;
            renderReport(true);
        });
        $("th .rg-watch").on('input click', function () {
            var colindex = $(this).closest('ul').attr('colindex');
            var section = $(this).attr('section');
            switch ($(this).attr('type')) {
                case 'text':
                    report.ReportCols[colindex][section] = $(this).val();
                    report.ReportRows[0][colindex] = $(this).val();
                    $(this).closest('th').find('span').text(report.ReportCols[colindex][section]);
                    break;
                case 'checkbox':
                    report.ReportCols[colindex][section].show = $(this).is(':checked');
                    if (section === 'Group') {
                        if($(this).is(':checked')) {
                            report.ReportCols[colindex].Detail.show = false;
                            report.SetGroupColumns();
                        } else {
                            report.ReportCols[colindex].Detail.show = true; 
                            report.SetGroupColumns();
                        }
                    }
                    renderReport(true);
                    break;
            }
        });
        bindFormatEvents();
    }
    function bindFormatEvents() {
        $(".removeformat").off('click').on('click', function () {
            var colindex = $(this).closest('.formatsdiv').attr('colindex');
            var section = $(this).closest('.formatsdiv').attr('section');
            var fi = $(this).attr('formatindex');
            report.ReportCols[colindex][section].formats.splice(fi,1);
            var formats = report.ColEditFormats(colindex,section,true);
            $(this).closest('ul').find('.formatsdiv').html(formats);
            report.Render($('#reportTable tbody'), 'body');
            bindFormatEvents();
            return false;
        });
        $(".addformatitem").off('click').on('click', function () {
            var colindex = $('#formatSelectForm').attr('colindex');
            var section = $('#formatSelectForm').attr('section');
            var format = $(this).text();
            if(format=='text'){
                var textstring = prompt("Please enter text you can embed the value with {val} if you like, for example 'Cost is {val} dollars'", "{val}");
                if (textstring == null || textstring == "") {
                    return false;
                } else {
                    format = "text=" + textstring;
                }
            }
            report.ReportCols[colindex][section].formats.push(format);
            var formats = report.ColEditFormats(colindex,section,true);
            $('.formatsdiv[colindex=' + colindex + '][section=' + section + ']').html(formats);
            report.Render($('#reportTable tbody'), 'body');
            bindFormatEvents();
            return false;
        });
        $(".addformatlink").off('click').on('click', function () {
            var colindex = $(this).closest('ul').attr('colindex');
            var section = $(this).attr('section');
            if($('#formatSelectForm').attr('section')==section){
                $('#formatSelectForm').hide();
            }
            $('#formatSelectForm').attr('colindex', colindex);
            $('#formatSelectForm').attr('section', section);
            $('#formatSelectForm').css({'top':0,'left':0});
            $('#formatSelectForm').position({my: 'left top', at:'right bottom', of:$(this)});
            $('#formatSelectForm').show();
            $('#formatSelectForm').position({my: 'left top', at:'right bottom', of:$(this)});
            return false;
        });
        $('.columneditform').off('hide.bs.dropdown').on('hide.bs.dropdown', function () {
            $('#formatSelectForm').hide();
            bindFormatEvents();
        });
    }
});

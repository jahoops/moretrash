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
    var reportlist=[];

    $('#saveReportButton').on('click', function(e){
        e.preventDefault();
        RBsavereport();
    });

    $('#addrowtotal').on('click', function(){
        if(report) {
             report.AddRowCol();
             renderReport();
        }
    });

    var opts = RBreturndatasources();
    $('#dataSource').html(opts);

    RBloadsaved();

    $('#dataSource').on('change', function () {
        var selected = $('option:selected', this);
        if (!selected) return;

        $('#reportTable').empty();

        RBloadtable(loadReport);
    });

    function loadReport(jsonData) {
        if (report) {
            report.Clear();
        }
        report = new Report(jsonData);
        renderReport();
    }

    function renderReport(reRender) {
        $('#reportTable').empty();
        report.Render($('#reportTable'),reRender);
        setHeaders();
        $("#pivotjs").pivotUI(report.ReportRows,{
            aggregatorName: "Sum",
            renderers: $.extend(
                    $.pivotUtilities.renderers,
                    $.pivotUtilities.c3_renderers,
                    $.pivotUtilities.d3_renderers,
                    $.pivotUtilities.plotly_renderers,
                    $.pivotUtilities.export_renderers
            )
        });
    }

    function setHeaders() {
        $('#reportTable .formatselect').remove();
        var formatselect = report.FormatSelectForm();
        $('#reportTable').append($(formatselect));
        
        $("th").each(function () {
            var colindex = $(this).attr('colindex');
            if ($.isNumeric(colindex)) {
                var colinfo = report.ColEditForm(colindex);
                $(this).append($(colinfo));
            }
        });
        $("th .moveleft").on('click', function () {
            var fromindex = $(this).closest('ul').attr('colindex');
            var toindex = Number(fromindex) - 1;
            var saveToCol = report.ReportCols[toindex];
            report.ReportCols[toindex] = report.ReportCols[fromindex];
            report.ReportCols[fromindex] = saveToCol;
            renderReport(true);
        });
        $("th .moveright").on('click', function () {
            var fromindex = $(this).closest('ul').attr('colindex');
            var toindex = Number(fromindex) + 1;
            report.moveCol(fromindex,toindex);
            renderReport(true);
        });
        $("th .excludecheckbox").on('click', function () {
            var colindex = $(this).attr('colindex');
            var section = $(this).attr('section');
            report.ReportCols[colindex][section] = true;
            renderReport(true);
        });
        $("th .rg-watch").on('input click', function () {
            var colindex = $(this).closest('ul').attr('colindex');
            var section = $(this).attr('section');
            switch ($(this).attr('type')) {
                case 'text':
                    report.ReportCols[colindex][section] = $(this).val();
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

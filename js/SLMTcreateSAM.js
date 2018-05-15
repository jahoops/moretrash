$(function() {
    $('#SLMTitems #samlist .samcheck').unbind('click').bind('click', function() {
        var nsn = $(this).attr('nsn');
        var selected = $(this).is(':checked');
        $('#SLMTitems #samlist .samcheck').prop('checked',false);
        if(selected) $(this).prop('checked',true);
        $('#SLMTitems #dislist tr').removeClass('bg-hilite');
        $('#SLMTitems #dislist .discheck').removeAttr('disabled');
        if(selected) {
            if(nsn){
                $('#SLMTitems #dislist .discheck').attr('disabled', 'true');
                $('#SLMTitems #dislist .discheck[nsn!=' + nsn + ']').prop('checked',false);
                $('#SLMTitems #dislist .discheck[nsn=' + nsn + ']').removeAttr('disabled');
                $('#SLMTitems #dislist .discheck[nsn=' + nsn + ']').closest('tr').addClass('bg-hilite');
            }
        }
        var disselected = $('#SLMTitems #dislist .discheck:checked');
        if(disselected.length) {
            nsn = $(disselected).attr('nsn');
            var dis = $(disselected).attr('dis');
            $('#SLMTitems #dislist .discheck').attr('disabled', 'true');
            $('#SLMTitems #dislist .discheck[nsn=' + nsn + '][dis="' + dis + '"]').removeAttr('disabled'); 
        }
        var samselected = $('#SLMTitems #samlist .samcheck:checked');
        samselected.length && disselected.length ? $('#assigntosam').removeClass('d-none') :  $('#assigntosam').addClass('d-none');
    });
    $('#SLMTitems #dislist .discheck').unbind('click').bind('click', function() {
        $('#SLMTitems #dislist .discheck').removeAttr('disabled');
        var nsn = $(this).attr('nsn');
        var dis = $(this).attr('dis');
        var disselected = $('#SLMTitems #dislist .discheck:checked');
        var anyhilites = $('#SLMTitems #dislist tr.bg-hilite');
        if(disselected.length){
            $('#SLMTitems #dislist .discheck').attr('disabled', 'true');
            $('#SLMTitems #dislist .discheck[nsn=' + nsn + '][dis="' + dis + '"]').removeAttr('disabled'); 
        } else {
            if(anyhilites.length){
                $('#SLMTitems #dislist .discheck').attr('disabled', 'true');
                $('#SLMTitems #dislist tr.bg-hilite .discheck').attr('disabled', 'false'); 
            }
        }
        var samselected = $('#SLMTitems #samlist .samcheck:checked');
        samselected.length && disselected.length ? $('#assigntosam').removeClass('d-none') :  $('#assigntosam').addClass('d-none');
    });
    $('#slmt #assigntosam').unbind('click').bind('click', function() {
        var samselected = $('#SLMTitems #samlist .samcheck:checked').attr('rn');
        var d = [];
        $('#SLMTitems #dislist .discheck:checked').each(function(){
            d.push($(this).attr('rn'));
        });
        var disselected = d.join(',');
        $.ajax({
            type: 'POST',
            url: "cfc/ParentTicket.cfc",
            data: {
                method: "AssignParentTicket",
                ParentRequestNo: samselected,
                RelatedRequestNos: disselected
            },
            success: function (data) {
                ajaxContent('slmt','p=slmt',true);
            },
            error: function (data) {
                console.log("SLMTcreateSAM ajax fail: " + data);
            },
            complete: function () {
            }
        });
        // 
    });
    $('#slmt #unassignedsam').unbind('click').bind('click', function() {
        $('#slmt #samlist .assignedsam').hide();
        $('#slmt #samlist .assigneddis').hide();
        $('#slmt #allsam').removeClass('active');
        $(this).addClass('active');
    });
    $('#slmt #allsam').unbind('click').bind('click', function() {
        $('#slmt #samlist .assignedsam').show();
        $('#slmt #samlist .assigneddis').show();
        $('#slmt #unassignedsam').removeClass('active');
        $(this).addClass('active');
    });
    $('#slmt .clickable').unbind('click').bind('click', function() {
        if($(this).hasClass('samprint')) {
            var rn = $(this).attr('rn');
            var els = $('#slmt #samlist .assigneddis[sam=' + rn + ']')
            displayPopup('<div class="w-75 col m-auto p-4">' + returnSAMprint(els) + '</div>','white');
        } else {
            var rid = $(this).attr('rn');
            console.log(rid);
            if($.isNumeric(rid)) ajaxContent('td', 'p=td&rid=' + rid, true);
        }

    });

});
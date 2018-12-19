function set_groups_cookie(groups){
    document.cookie = "groups=" + groups;
}

function set_groups_name_cookie(names){
    document.cookie = "groups_name=" + names;
}

function submit(){
    var groups = [];
    var names = [];
    $("input[name='sensorhub']").each(function(){
        if($(this).prop("checked")){
            groups.push($(this).attr('id'));
            names.push($(this).val());
        }
    });

    if(groups.length > 0){
        var groups_json = JSON.stringify(groups);
        var names_json = JSON.stringify(names);
        set_groups_cookie(groups_json);
        set_groups_name_cookie(names_json);
        window.location.href = "show_compare.html";
    }else{
        alert("請選擇一個以上的感測器群組");
    }
}

function select_all(){
    if($("#all").prop("checked")){
        $("input[name='sensorhub']").each(function(){
            $(this).prop("checked",true);
        });
    }else{
        $("input[name='sensorhub']").each(function(){
            $(this).prop("checked",false);
        });
    }
}

function list_groups(){
    var sensorType = getCookie("sensorType");
    var areaId = getCookie("area");

    $.get(api_url + 'api/sensorgroup_in_area/' + areaId, function(data) {
        var group_body = JSON.parse(data);
        // for (let j = 0; j < group_body.Count; j++) {
        //     $.get(api_url + 'api/sensors_in_group/' + group_body.Items[j].groupId, function(data){
        //         var sensor_body = JSON.parse(data);
        //         for (let k = 0; k < sensor_body.Count; k++) {
        //             //表示有無偵測到， 0 -> 未偵測到， 1 -> 偵測到
        //             var detect = 0;
        //             console.log(sensor_body.Items[k].sensorType+" "+sensorType);
        //             if(sensor_body.Items[k].sensorType == sensorType){
        //                 detect = 1;

        //                 var groupId = group_body.Items[j].groupId;
        //                 var name = group_body.Items[j].name;
        //                 $("#groups_list").append('<div class="col-xs-12 col-sm-6">'+
        //                     '<div class="checkbox_div">'+
        //                         '<input type="checkbox" name="sensorhub" id="' + groupId + '" value="' + name + '">'+
        //                         '<label for="' + groupId + '">' + name + '</label>'+
        //                     '</div>'+
        //                 '</div>');
        //                 console.log(k);
        //             }
        //             //偵測到就跳出
        //             if(detect == 1){  
        //                 break;
        //             }
        //         }
        //     });
        // }

        //將此場域的sensorhub全部列出來
        for (let j = 0; j < group_body.Count; j++) {
            var groupId = group_body.Items[j].groupId;
            var name = group_body.Items[j].name;
            $("#groups_list").append('<div class="col-xs-12 col-sm-6">'+
                '<div class="checkbox_div">'+
                    '<input type="checkbox" name="sensorhub" id="' + groupId + '" value="' + name + '">'+
                    '<label for="' + groupId + '">' + name + '</label>'+
                '</div>'+
            '</div>');
        }
    });
}
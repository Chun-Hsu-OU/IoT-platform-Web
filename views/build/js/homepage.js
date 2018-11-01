var api_url = 'http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/';

var uuid = getCookie("checker");


function load_sensorhub_info(){
    
    //$.when()用途 -> 依照順序檢查sensor狀態
    var promise = $.when(); 

    $.get(api_url + 'api/area/' + uuid, function(data) {
        var area_body = JSON.parse(data);
        for (let i = 0; i < area_body.Count; i++) {
            if (area_body.Items[i].visible == 1) {
                $.get(api_url + 'api/sensorgroup_in_area/' + area_body.Items[i].areaId, function(data) {
                    var group_body = JSON.parse(data);
                    for (let j = 0; j < group_body.Count; j++) {
                        $.get(api_url + 'api/sensors_in_group/' + group_body.Items[j].groupId, function(data){
                            var sensor_body = JSON.parse(data);
                            
                            for (let k = 0; k < sensor_body.Count; k++) {
                                promise = promise.then(function() { 
                                    // 在table建立一列senorhub一定要依序建立(在sensorhub第一個sensor建立)，因為狀態欄位id一樣，
                                    // 要處理完一組sensorhub的全部sensors，id清空之後才能換下一組檢查，
                                    // (其實id可以多加一個全域變數，但還要累加，還要多加一個參數，有點麻煩，覺得用一樣的比較簡單XD)
                                    // 否則故障會蓋到正常的sensorhub，就會顯示錯誤
                                    // group_body.Items[j].name只是為了debug用，之後可以拿掉
                                    if(k == 0){
                                        $('tbody').append('<tr>' +
                                        '<td>' + area_body.Items[i].name + '</td>' +
                                        '<td>' + area_body.Items[i].location + '</td>' +
                                        '<td>' + group_body.Items[j].name + '</td>' +
                                        '<td id="state" style="color: green;letter-spacing: 2px;"><i class="fa fa-check-circle"></i>正常</td>' +
                                        '</tr>');
                                    }
                                    return check_working(sensor_body.Items[k].sensorType, sensor_body.Items[k].sensorId, group_body.Items[j].name, k, sensor_body.Count-1);
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}

function check_working(type, id, name, index, count){
    return $.get(api_url + 'api/sensors/'+ type +'/'+ id, function(data){
        if (data == 'No data'){
            $("#state").html('<div style="color: red;letter-spacing: 2px;"><i class="fa fa-exclamation-circle"></i>故障</div>');
        }
        //檢查sensorhub最後一個sensor完要清除id,才能給下一個使用(要不然會重複)
        if(index == count){
            $("#state").attr("id","");
        }
        console.log(name+": "+index);
    });
}


{/* <a onclick="set_group_cookie(\'' + group_body.Items[j].groupId + '\')" href="#" data-toggle="modal" data-target="#set_sensorgroup_modal">編輯</a> */}
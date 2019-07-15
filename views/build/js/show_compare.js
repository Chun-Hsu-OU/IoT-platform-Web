var groups = JSON.parse(getCookie("groups"));
var select_type = JSON.parse(getCookie("sensorType"));
var groups_name = JSON.parse(getCookie("groups_name"));

var toDate = new Date();
var toEpoch = toDate.getTime();
var fromEpoch = toEpoch - 86400000;

$(function(){
    /*-------------------設定highchart參數-------------------*/
    Highcharts.setOptions({
        time: {
          useUTC: false
        }
    });

    var options = {
        chart: {
            type: 'spline',
        },

        title: {
            text: select_type
        },

        subtitle: {
            text: '不同感測器群組數值比較'
        },

        xAxis: {
            type: 'datetime',
            labels: {
              format: '{value:%m/%d/%Y<br>%H:%M}'
            }
        },

        yAxis: {
            title: {
                text: '數值'
            }
        },

        tooltip: {
            xDateFormat: '%m/%d/%Y<br>%H:%M',
            // crosshairs: true
        },

        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        plotOptions: {
            series: {
                cursor: 'pointer',
                label: {
                  connectorAllowed: false
                },
                marker: {
                  lineWidth: 1
                },
            }
        },

        series: [],

        exporting: false,

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    }
    /*-------------------設定highchart參數-------------------*/

    /*-------------------初始化(預設一天)-------------------*/
    //放創好的圖表
    var charts = [];

    // 先創之後要畫的圖表
    for(let i=0; i<select_type.length; i++){
        //創圖表的html
        $('#result').append('<div class="col-xs-12" style="overflow-x: auto; overflow-y:hidden; margin-bottom: 20px;">' +
                '<div id="'+ select_type[i] +'" style="min-width:400px; height:500px;"></div>' +
            '</div>');
        
        //改圖表名稱
        options.title.text = select_type[i];
        charts.push(Highcharts.chart(select_type[i], options));
    }

    for(let i=0; i<select_type.length; i++){

        //儲存同一種類sensor的所有slope資料
        var multi_line_slopes = [];

        //記錄開始時間，並去掉重複值
        var from_times = [];
        //存每個異常資料 object
        var abnormal_objs = [];

        //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
        for(let group_num=0; group_num<groups.length; group_num++){
            var group_id = groups[group_num];
            var group_name = groups_name[group_num];
    
            var sensors_in_group_str = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);    
            var sensors_in_group = JSON.parse(sensors_in_group_str);
            sensors_in_group.Items.forEach(function make(sensor) {

                if(sensor.sensorType == select_type[i]){

                    var id = sensor.sensorId;
                    var type = sensor.sensorType;

                    $.get(api_url + 'api/sensors_in_timeinterval/' + type + '/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                        draw_sensor_data(data, charts[i], group_num, sensor.num);
                    });

                    //顯示異常資料
                    var abnormal_str = httpGet(api_url + 'api/abnormal/data_in_interval/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token);
                    if(abnormal_str != "No data"){
                        var one_abnormal_data = JSON.parse(abnormal_str);
                        for(let data_num=0; data_num < one_abnormal_data.Count; data_num++){
                            from_times.push(one_abnormal_data.Items[data_num].from_time);
                            abnormal_objs.push(one_abnormal_data.Items[data_num]);
                        }
                    }
                    //顯示異常資料
                }
            });

            //測試
            // var data = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);

            // var body = JSON.parse(data);
            // for(let j=0; j<body.Items.length; j++){
            //     var sensor = body.Items[j];
            //     if(sensor.sensorType == select_type[i]){
            //         var temp = httpGet(api_url + 'api/linear/2.5/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token);
            //         if(temp != "No data"){
            //             var one_line_slopes = JSON.parse(temp);
            //             add_name_and_num(one_line_slopes, group_name, sensor.num);
            //             multi_line_slopes.push(one_line_slopes);
            //         }
            //     }
            // }
            //測試
        }

        //顯示異常資料
        draw_abnormal_plot(from_times, abnormal_objs, charts[i]);
        //顯示異常資料
        
        //測試
        // console.log(multi_line_slopes);
        // filterOutlier(multi_line_slopes, select_type[i], charts[i]);
        //測試
    }

    /*-------------------初始化(預設一天)-------------------*/

    /*-------------------選擇時間-------------------*/
    $('input[name="daterange_picker"]').daterangepicker({
        timePicker: true,
        timePickerIncrement: 5,
        locale: {
          format: 'MM/DD/YYYY HH:mm'
        }
    });

    $('#daterange_picker').on('apply.daterangepicker', function(ev, picker) {
        // 清空所有圖表
        charts = [];

        // 重新設定之後要畫的圖表
        for(let i=0; i<select_type.length; i++){
            //改圖表名稱
            options.title.text = select_type[i];
            charts.push(Highcharts.chart(select_type[i], options));
        }

        var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
        var fromEpoch = fromDate.getTime();
        var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
        var toEpoch = toDate.getTime();
        
        for(let i=0; i<select_type.length; i++){

            //儲存同一種類sensor的所有slope資料
            var multi_line_slopes = [];

            //BATTERY_VOLTAGE使用
            voltages_of_each_batteries = [];

            //記錄開始時間，並去掉重複值
            var from_times = [];
            //存每個異常資料 object
            var abnormal_objs = [];

            //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
            for(let group_num=0; group_num<groups.length; group_num++){
                var group_id = groups[group_num];
                var group_name = groups_name[group_num];
        
                var sensors_in_group_str = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);    
                var sensors_in_group = JSON.parse(sensors_in_group_str);
                sensors_in_group.Items.forEach(function make(sensor) {

                    if(sensor.sensorType == select_type[i]){

                        var id = sensor.sensorId;
                        var type = sensor.sensorType;

                        $.get(api_url + 'api/sensors_in_timeinterval/' + type + '/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                            draw_sensor_data(data, charts[i], group_num, sensor.num);
                        });

                        //顯示異常資料
                        var abnormal_str = httpGet(api_url + 'api/abnormal/data_in_interval/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token);
                        if(abnormal_str != "No data"){
                            var one_abnormal_data = JSON.parse(abnormal_str);
                            for(let data_num=0; data_num < one_abnormal_data.Count; data_num++){
                                from_times.push(one_abnormal_data.Items[data_num].from_time);
                                abnormal_objs.push(one_abnormal_data.Items[data_num]);
                            }
                        }
                        //顯示異常資料
                    }
                });

                //測試
                // var data = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);

                // var body = JSON.parse(data);

                // if(select_type[i] == "BATTERY_VOLTAGE"){

                //     for(let j=0; j<body.Items.length; j++){
                //         var sensor = body.Items[j];
                //         if(sensor.sensorType == "BATTERY_VOLTAGE"){
                //             var temp = httpGet(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token);
                //             var voltages = JSON.parse(temp);
                //             if(voltages.Count > 0){
                //                 var one_voltages_set = [];
                //                 for(let k=0; k<voltages.Items.length; k++){
                //                     one_voltages_set.push(voltages.Items[k]);
                //                 }
                //                 voltages_of_each_batteries.push(one_voltages_set);
                //             }
                //         }
                //     }

                // }else{ //土壤 ＆ 光照

                //     for(let j=0; j<body.Items.length; j++){
                //         var sensor = body.Items[j];
                //         if(sensor.sensorType == select_type[i]){
                //             var temp = httpGet(api_url + 'api/linear/1.52/'+ sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token);
                //             if(temp != "No data"){
                //                 var one_line_slopes = JSON.parse(temp);
                //                 add_name_and_num(one_line_slopes, group_name, sensor.num);
                //                 multi_line_slopes.push(one_line_slopes);
                //             }
                            
                //         }
                //     }

                // }
                
                //測試
            }

            //顯示異常資料
            draw_abnormal_plot(from_times, abnormal_objs, charts[i]);
            //顯示異常資料

            //測試
            // if(select_type[i] == "BATTERY_VOLTAGE"){
            //     check_voltage(voltages_of_each_batteries, charts[i]);
            // }else if(select_type[i] == "LIGHT_INTENSITY"){
            //     check_light(multi_line_slopes, charts[i]);
            // }else{
            //     console.log(multi_line_slopes);
            //     filterOutlier(multi_line_slopes, select_type[i], charts[i]);
            // }
            
            //測試
        }
    });
    /*-------------------選擇時間-------------------*/
});

//抓出掉4%電的電壓
function check_voltage(voltages_of_each_batteries, chart){
    console.log(voltages_of_each_batteries);

    var all_voltages = [];
    for(let i=0; i<voltages_of_each_batteries.length; i++){
        for(let j=0; j<voltages_of_each_batteries[i].length; j++){
            if(voltages_of_each_batteries[i][j].value != null){
                all_voltages.push(voltages_of_each_batteries[i][j].value);
            }
        }
    }
    console.log(all_voltages);

    var sort_voltages = Array_Sort_Numbers(all_voltages);
    //挑出最大值(滿電電壓)
    var full_voltage = sort_voltages[sort_voltages.length - 1];
    console.log("滿電: "+full_voltage);

    var dangerous_voltage = full_voltage - full_voltage * 0.04;
    console.log("危險電壓: "+dangerous_voltage);

    //挑出低於 "危險電壓" 的sensor
    for(let i=0; i<voltages_of_each_batteries.length; i++){
        for(let j=0; j<voltages_of_each_batteries[i].length; j++){
            if(voltages_of_each_batteries[i][j].value != null){
                if(voltages_of_each_batteries[i][j].value < dangerous_voltage){
                    chart.xAxis[0].addPlotBand({
                        from: voltages_of_each_batteries[i][j].timestamp - 30*60*1000,
                        to: voltages_of_each_batteries[i][j].timestamp + 30*60*1000,
                        color: '#7D7E7F',
                        label: {
                            text: groups_name[i]+" 1 處於危險電壓",
                            style: {
                                color: 'white',
                                fontWeight: 'bold'
                            }
                        }
                    });
                }
            }
        }
    }
}

//------------------------------------------------------

//抓出平均正常值的5%以下的光照度
function check_light(multi_line_slopes, chart){
    console.log(multi_line_slopes);

    var col_length = multi_line_slopes[0].length;

    //一次跑一組(同一行)相同時間sensors偵測異常趨勢
    for(let col=0; col<col_length; col++){
        var same_interval_data = [];

        for(let row=0; row<multi_line_slopes.length; row++){
            same_interval_data.push(multi_line_slopes[row][col]);
        }
        console.log(same_interval_data);

        // 將光照度 >= 500分一群， < 500 分一群(可能異常)
        var normal_values = [];
        var maybe_abnormal_values = [];

        for(let i=0; i<same_interval_data.length; i++){
            if(same_interval_data[i].slope != "x"){
                if(Math.abs(same_interval_data[i].slope) < 500){
                    maybe_abnormal_values.push(same_interval_data[i]);
                }else{
                    normal_values.push(same_interval_data[i]);
                }
            }
        }
        
        //算出平均正常值，挑出低於其5%以下的異常值，如果正常組沒有值(晚上)，就不用算
        if(normal_values.length != 0){
            var abs_slopes = convert_to_abs_slopes(normal_values);
            var mean = Math.mean(abs_slopes);
            var abnormal_check_point = mean * 0.05;

            for(let i=0; i<maybe_abnormal_values.length; i++){
                if(Math.abs(maybe_abnormal_values[i].slope) < abnormal_check_point){
                    chart.xAxis[0].addPlotBand({
                        from: maybe_abnormal_values[i].from,
                        to: maybe_abnormal_values[i].to,
                        color: '#7D7E7F',
                        label: {
                            text: maybe_abnormal_values[i].name + " " + maybe_abnormal_values[i].num + 
                                    " 光照度異常",
                            style: {
                                color: 'white',
                                fontWeight: 'bold'
                            }
                        }
                    });
                }
            }
            console.log("-----------------------------------");
        }
        
    }
}

function convert_to_abs_slopes(normal_values){
    var abs_slopes = [];
    for(let i=0; i<normal_values.length; i++){
        abs_slopes.push(Math.abs(normal_values[i].slope));
    }

    return abs_slopes;
}

//------------------------------------------------------

function draw_abnormal_plot(from_times, abnormal_objs, chart){
    //去除重複值(開始時間相同的)
    from_times = from_times.filter(function(element, index, arr){
        return arr.indexOf(element) === index;
    });
    console.log(from_times);

    var appear_count = new Array(from_times.length).fill(0);
    console.log(appear_count);
    console.log(abnormal_objs);
    for(let obj_num=0; obj_num < abnormal_objs.length; obj_num++){
        var index = from_times.indexOf(abnormal_objs[obj_num].from_time);
        var y_position = 10 + 30*appear_count[index];

        if(abnormal_objs[obj_num].state == 0){
            chart.xAxis[0].addPlotBand({
                from: abnormal_objs[obj_num].from_time,
                to: abnormal_objs[obj_num].to_time,
                color: '#7D7E7F',
                label: {
                    text: abnormal_objs[obj_num].sensor_name+'<br>低於正常值',
                    style: {
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    y: y_position
                }
            });            
        }else if(abnormal_objs[obj_num].state == 1){
            chart.xAxis[0].addPlotBand({
                from: abnormal_objs[obj_num].from_time,
                to: abnormal_objs[obj_num].to_time,
                color: '#7D7E7F',
                label: {
                    text: abnormal_objs[obj_num].sensor_name+'<br>高於正常值',
                    style: {
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    y: y_position
                }
            });
        }else if(abnormal_objs[obj_num].state == 2){
            chart.xAxis[0].addPlotBand({
                from: abnormal_objs[obj_num].from_time,
                to: abnormal_objs[obj_num].to_time,
                color: '#7D7E7F',
                label: {
                    text: abnormal_objs[obj_num].sensor_name+'<br>資料不完整',
                    style: {
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    y: y_position
                }
            });
        }else if(abnormal_objs[obj_num].state == 3){
            chart.xAxis[0].addPlotBand({
                from: abnormal_objs[obj_num].from_time,
                to: abnormal_objs[obj_num].to_time,
                color: '#7D7E7F',
                label: {
                    text: abnormal_objs[obj_num].sensor_name+'<br>光照度異常',
                    style: {
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    y: y_position
                }
            });
        }else if(abnormal_objs[obj_num].state == 4){
            chart.xAxis[0].addPlotBand({
                from: abnormal_objs[obj_num].from_time,
                to: abnormal_objs[obj_num].to_time,
                color: '#7D7E7F',
                label: {
                    text: abnormal_objs[obj_num].sensor_name+'<br>電壓異常',
                    style: {
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    y: y_position
                }
            });
        }

        appear_count[index] = appear_count[index]+1;
        
    }

    console.log(appear_count);
}

function filterOutlier(array, type, chart){

    var col_length = array[0].length;

    //一次跑一組(同一行)相同時間sensors偵測異常趨勢
    for(let col=0; col<col_length; col++){

        //挑出不同線同一時段的slope
        var same_time_interval_slopes = [];
        //挑出不同線同一時段的所有資料(sensorId, from, to, slope)
        var all_info_slopes = [];

        for(let row=0; row<array.length; row++){
            same_time_interval_slopes.push(array[row][col].slope);
            all_info_slopes.push(array[row][col]);
        }
        console.log(same_time_interval_slopes);

        //先把資料不完整的挑出來顯示
        for(let i=0; i<same_time_interval_slopes.length; i++){
            if(same_time_interval_slopes[i] == "x"){
                //識別sensor，sensor在哪個group下，編號是多少
                var sensor_alias = all_info_slopes[i].name+" "+all_info_slopes[i].num;

                // chart.xAxis[0].addPlotBand({
                //     from: all_info_slopes[i].from,
                //     to: all_info_slopes[i].to,
                //     color: '#7D7E7F',
                //     label: {
                //         text: sensor_alias+'<br>資料不完整',
                //         style: {
                //             color: 'white',
                //             fontWeight: 'bold'
                //         }
                //     }
                // });                

                console.log("資料不完整")
            }
        }
        //刪除(slope = x)，才不會影響到後面計算四分位數
        same_time_interval_slopes = same_time_interval_slopes.filter(function(element, index, arr){
            return element != "x";
        });
        console.log(same_time_interval_slopes);
        
        var q1 = Quartile_25(same_time_interval_slopes);
        var q3 = Quartile_75(same_time_interval_slopes);
        var iqr = q3 - q1;
        console.log("q1: "+q1);
        console.log("q3: "+q3);
        console.log("iqr: "+iqr);

        // Then find min and max values
        var maxValue = q3 + iqr*1.5;
        var minValue = q1 - iqr*1.5;
        console.log("最大值: "+maxValue);
        console.log("最小值: "+minValue);

        console.log("從: "+timeConverter(all_info_slopes[0].from));
        console.log("到: "+timeConverter(all_info_slopes[0].to));

        //計算每一條線的平均值
        // for(let i=0; i<all_info_slopes.length; i++){
        //     var line_values = [];
        //     var line_infos = httpGet(api_url + 'open/sensors_in_timeinterval/'+ type + '/' + all_info_slopes[i].sensorId + '/' + all_info_slopes[i].from + '/' + all_info_slopes[i].to + '?token=' + token);
        //     line_infos = JSON.parse(line_infos);
        //     for(let k=0; k<line_infos.Items.length; k++){
        //         line_values.push(line_infos.Items[k].value);
        //     }
        //     console.log("線段平均值: "+Math.mean(line_values));
        // }

        var mean= Math.mean(same_time_interval_slopes);
        console.log("斜率平均值: "+mean);

        /* 
         potential_anomaly 紀錄是否有可能有異常情況
         true -> 有可能有異常
         false -> 沒有異常
         */
        var potential_anomaly = false;
        var threshold = 0;
        if(type == "SOIL_EC"){
            threshold = 11;
        }else{
            threshold = 0.67;
        }

        for(let i=0; i<same_time_interval_slopes.length; i++){
            var test_value = Math.abs(same_time_interval_slopes[i] - mean);
            console.log("差距:"+test_value);
            if(test_value > threshold){
                potential_anomaly = true;
            }
        }

        if(potential_anomaly){
            //挑出異常值
            for(let i=0; i<all_info_slopes.length; i++){
                var test_value = all_info_slopes[i].slope;

                if(Math.abs(test_value - mean) > threshold){
                    //識別sensor，sensor在哪個group下，編號是多少
                    var sensor_alias = all_info_slopes[i].name+" "+all_info_slopes[i].num;

                    // state: 1 -> 過高 ， 0 -> 過低
                    if(test_value > maxValue){
                        console.log("異常值: "+test_value);
                        console.log("sensor 名稱: "+sensor_alias);
                        console.log(sensor_alias+" 高於正常值");
                        chart.xAxis[0].addPlotBand({
                            from: all_info_slopes[i].from,
                            to: all_info_slopes[i].to,
                            color: '#7D7E7F',
                            label: {
                                text: sensor_alias+'<br>高於正常值',
                                style: {
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }
                        });
                    }
                    if(test_value < minValue){
                        console.log("異常值: "+test_value);
                        console.log("sensor 名稱: "+sensor_alias);
                        console.log(sensor_alias+" 低於正常值");
                        chart.xAxis[0].addPlotBand({
                            from: all_info_slopes[i].from,
                            to: all_info_slopes[i].to,
                            color: '#7D7E7F',
                            label: {
                                text: sensor_alias+'<br>低於正常值',
                                style: {
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }
                        });
                    }
                }
            }
        }
        console.log("--------------------------------");
        
    }
}

function Quartile_25(data) {
    return Quartile(data, 0.25);
}

function Quartile_75(data) {
    return Quartile(data, 0.75);
}

function Quartile(data, q) {
    // Copy the values, rather than operating on references to existing values
    var values = data.concat();

    values=Array_Sort_Numbers(values);
    var pos = ((values.length) - 1) * q;
    var base = Math.floor(pos);
    var rest = pos - base;
    if( (values[base+1]!==undefined) ) {
        return values[base] + rest * (values[base+1] - values[base]);
    } else {
        return values[base];
    }
}

//數字從小排到大的函式
function Array_Sort_Numbers(inputarray){
    return inputarray.sort(function(a, b) {
        return a - b;
    });
}

Math.mean= function(array){
    return array.reduce(function(a, b){ return a+b; })/array.length;
}

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

/*-------------------------------------
功用: call API 的 GET 方法 (改js是因為jquery資料傳不出來，垃圾jquery)
Arg:
    param1（str）: call API 的網址
--------------------------------------*/
function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

/*-------------------------------------
功用: 加sensorhub名稱和sensor編號進去陣列的所有元素
Arg:
    param1（array）: 要加資訊的陣列，元素都是物件
    param2（str）: sensorhub 名稱
    param3（str）: sensor 編號
--------------------------------------*/
function add_name_and_num(array, name, num){
    for(let i=0; i<array.length; i++){
        var obj = array[i];
        obj.name = name;
        obj.num = num;
    }
    // console.log(array);
}

function draw_sensor_data(data, chart, group_num, serial_num) {
    main();
  
    async function main() {
      var body = JSON.parse(data);
      try {
        var dataset = await parseData(body);
        // console.log(dataset);
        //有資料才畫圖
        if (dataset.length != 0) {
            //新增一條線
            chart.addSeries({
                name: groups_name[group_num] + " " + serial_num,
                data: dataset
            });
        }
      } catch (err) {
        console.error(err);
      }
    }
  
    async function parseData(data) {
      return Promise.all(data.Items.map(function(set) {
        var data_and_date = [];
        data_and_date.push(set.timestamp);
        data_and_date.push(set.value);
        return data_and_date;
      }));
    }
}


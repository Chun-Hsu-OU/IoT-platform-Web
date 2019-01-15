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

        //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
        for(let group_num=0; group_num<groups.length; group_num++){
            var group_id = groups[group_num];
            var group_name = groups_name[group_num];
    
            $.get(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token, function(data) {
                var body = JSON.parse(data);
            
                body.Items.forEach(function make(sensor) {
                    if(sensor.sensorType == select_type[i]){
                        $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                            draw_sensor_data(data, charts[i], group_num, sensor.num);
                        });
                    }
                });
            });

            var data = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);

            var body = JSON.parse(data);
            for(let j=0; j<body.Items.length; j++){
                var sensor = body.Items[j];
                if(sensor.sensorType == select_type[i]){
                    var temp = httpGet(api_url + 'api/linear/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token);
                    var one_line_slopes = JSON.parse(temp);

                    add_name_and_num(one_line_slopes, group_name, sensor.num);
                    multi_line_slopes.push(one_line_slopes);
                }
            }

            console.log(getCookie("groups_name"));
        }
        // console.log(multi_line_slopes);
        // console.log(multi_line_slopes.length);

        detect_abnormal(multi_line_slopes, charts[i]);
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

            //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
            for(let group_num=0; group_num<groups.length; group_num++){
                var group_id = groups[group_num];
                var group_name = groups_name[group_num];
        
                $.get(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token, function(data) {
                    var body = JSON.parse(data);

                    body.Items.forEach(function make(sensor) {
                        if(sensor.sensorType == select_type[i]){
                            $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                                draw_sensor_data(data, charts[i], group_num, sensor.num);
                            });
                        }
                    });
                });

                var data = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);

                var body = JSON.parse(data);
                for(let j=0; j<body.Items.length; j++){
                    var sensor = body.Items[j];
                    if(sensor.sensorType == select_type[i]){
                        var temp = httpGet(api_url + 'api/linear/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token);
                        var one_line_slopes = JSON.parse(temp);

                        add_name_and_num(one_line_slopes, group_name, sensor.num);
                        multi_line_slopes.push(one_line_slopes);
                    }
                }
            }
            detect_abnormal(multi_line_slopes, charts[i]);
        }
    });
    /*-------------------選擇時間-------------------*/
});


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

/*-------------------------------------
功用: 偵測哪個數據異常
Arg:
    param1（array）: 要偵測的二維陣列，裡面一維陣列都是各別sensor時間範圍內的資料
--------------------------------------*/
function detect_abnormal(array, chart){
    var col_length = array[0].length;

    for(let col=0; col<col_length; col++){

        //挑出不同線同一時段的slope
        var same_time_interval_slopes = [];
        //挑出不同線同一時段的所有資料(slope, from, to, name, num)
        var all_info_slopes = [];

        for(let row=0; row<array.length; row++){
            same_time_interval_slopes.push(array[row][col].slope);
            all_info_slopes.push(array[row][col]);
        }
        console.log(same_time_interval_slopes);
        // console.log(all_info_slopes);

        /*------------------------------------------
          以下為四分位數算法
          1.目的：
            算出異常大於或小於常態分佈的數字，可以挑出異常值
          2.算法：
            σ：標準差
            Md：中位數
            常態分佈上限：Md + 2.698σ (大於就挑出)
            常態分佈下限：Md - 2.698σ (小於就挑出)
        -------------------------------------------*/
        //計算中位數
        var median = median_number(same_time_interval_slopes);
        console.log("中位數: "+median);
        
        //計算標準差
        var std = Math.stDeviation(same_time_interval_slopes);
        console.log("標準差: "+std);
        
        //常態分佈上限
        var top_normal_limit = median + 2.698*std;
        //常態分佈下限
        var bottom_normal_limit = median - 2.698*std;
        console.log("from: "+timeConverter(all_info_slopes[0].from));
        console.log("to: "+timeConverter(all_info_slopes[0].to));
        console.log("top: "+top_normal_limit);
        console.log("bottom: "+bottom_normal_limit);
        

        for(let index=0; index<all_info_slopes.length; index++){
            var test_value = all_info_slopes[index].slope;
            if(test_value>top_normal_limit || test_value<bottom_normal_limit){
                // console.log("from: "+timeConverter(all_info_slopes[index].from));
                // console.log("to: "+timeConverter(all_info_slopes[index].to));
                console.log("sensor名稱: "+all_info_slopes[index].name+" "+all_info_slopes[index].num);
                console.log("異常值："+test_value);
                chart.xAxis[0].addPlotBand({
                    from: all_info_slopes[index].from,
                    to: all_info_slopes[index].to,
                    color: '#FCFFC5',
                    events: {
                        click: function (e) {
                            var myWindow = window.open("", "MsgWindow", "width=800px,height=500px");
                            myWindow.document.write("<p>This is 'MsgWindow'. I am 200px wide and 100px tall!</p>");
                            console.log("click");
                        }
                    }
                });
            }
        }
        console.log("--------------------------------");
    }
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

/*-------------------------------------
功用: 算平均值
Arg:
    param1（array）: 要算的array
--------------------------------------*/
Math.mean= function(array){
    return array.reduce(function(a, b){ return a+b; })/array.length;
}

/*-------------------------------------
功用: 算標準差
Arg:
    param1（array）: 要算的array
--------------------------------------*/
Math.stDeviation=function(array){
    var mean= Math.mean(array),
    dev= array.map(function(itm){return (itm-mean)*(itm-mean); });
    return Math.sqrt(dev.reduce(function(a, b){ return a+b; })/array.length);
}

/*-------------------------------------
功用: 算中位數
Arg:
    param1（array）: 要算的array
--------------------------------------*/
function median_number(values){
  values.sort(function(a,b){
    return a-b;
  });

//   console.log(values);

  if(values.length === 0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}


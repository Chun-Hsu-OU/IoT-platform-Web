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
            text: "兩種感測器比較圖"
        },

        xAxis: {
            type: 'datetime',
            labels: {
              format: '{value:%m/%d/%Y<br>%H:%M}'
            }
        },

        yAxis: [{ // Primary yAxis
            title: {
                text: Convert_type_to_Ch(select_type[0])
            }
        }, { // Secondary yAxis
            title: {
                text: Convert_type_to_Ch(select_type[1])
            },
            opposite: true
        }],

        tooltip: {
            xDateFormat: '%m/%d/%Y<br>%H:%M',
            shared: true
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

    /*-------------------初始化(預設一天，包含水錶則是一個禮拜)-------------------*/

    var chart = Highcharts.chart("chart", options);

    if(select_type.includes('METER')){
        fromEpoch = toEpoch - 86400000*7;
    }

    for(let i=0; i<select_type.length; i++){

        //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
        for(let group_num=0; group_num<groups.length; group_num++){
            var group_id = groups[group_num];
    
            var sensors_in_group_str = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);    
            var sensors_in_group = JSON.parse(sensors_in_group_str);
            sensors_in_group.Items.forEach(function make(sensor) {

                if(sensor.sensorType == select_type[i]){

                    var id = sensor.sensorId;
                    var type = sensor.sensorType;

                    if(type == "METER"){
                        $.get(api_url + 'api/meter/interval/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                            draw_sensor_data(data, chart, i, group_num, sensor.num);
                        });
                    }else{
                        $.get(api_url + 'api/sensors_in_timeinterval/' + type + '/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                            draw_sensor_data(data, chart, i, group_num, sensor.num);
                        });
                    }
                }
            });
        }
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

        //重設圖表
        var chart = Highcharts.chart("chart", options);

        var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
        var fromEpoch = fromDate.getTime();
        var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
        var toEpoch = toDate.getTime();
        
        for(let i=0; i<select_type.length; i++){

            //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
            for(let group_num=0; group_num<groups.length; group_num++){
                var group_id = groups[group_num];
        
                var sensors_in_group_str = httpGet(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token);    
                var sensors_in_group = JSON.parse(sensors_in_group_str);
                sensors_in_group.Items.forEach(function make(sensor) {

                    if(sensor.sensorType == select_type[i]){

                        var id = sensor.sensorId;
                        var type = sensor.sensorType;

                        if(type == "METER"){
                            $.get(api_url + 'api/meter/interval/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                                draw_sensor_data(data, chart, i, group_num, sensor.num);
                            });
                        }else{
                            $.get(api_url + 'api/sensors_in_timeinterval/' + type + '/' + id + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
                                draw_sensor_data(data, chart, i, group_num, sensor.num);
                            });
                        }

                    }
                });
            }

        }
    });
    /*-------------------選擇時間-------------------*/
});

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

function draw_sensor_data(data, chart, i, group_num, serial_num) {
    main();
  
    async function main() {
      var body = JSON.parse(data);
      try {
        var dataset = await parseData(body);
        var draw_type = Convert_type_to_Ch(select_type[i]);
        
        //有資料才畫圖
        if (dataset.length != 0) {
            //新增一條線
            chart.addSeries({
                name: draw_type + " " + groups_name[group_num] + "_" + serial_num,
                type: "spline",
                yAxis: i,
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

function Convert_type_to_Ch(type){
    var ch = "";

    if(type == "AIR_TEMPERATURE"){
        ch = "空氣溫度";
    }else if(type == "AIR_HUMIDITY"){
        ch = "空氣濕度";
    }else if(type == "SOIL_TEMPERATURE"){
        ch = "土壤溫度";
    }else if(type == "SOIL_HUMIDITY"){
        ch = "土壤濕度";
    }else if(type == "SOIL_EC"){
        ch = "土壤電導度";
    }else if(type == "LIGHT_INTENSITY"){
        ch = "光照度";
    }else if(type == "BATTERY_VOLTAGE"){
        ch = "電池電壓";
    }else if(type == "METER"){
        ch = "水錶";
    }

    return ch;
}

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
            // scrollablePlotArea: {
            //     minWidth: 700,
            //     scrollPositionX: 0
            // }
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
            crosshairs: true
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
        //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
        for(let group_num=0; group_num<groups.length; group_num++){
            var group_id = groups[group_num];
    
            $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
                var body = JSON.parse(data);
            
                body.Items.forEach(function make(sensor) {
                    if(sensor.sensorType == select_type[i]){
                        $.get(api_url + 'api/sensors_in_timeinterval/' + select_type[i] + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
                            draw_sensor_data(data, charts[i], group_num, sensor.num);
                        });
                    }
                });
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
            //判斷每個 sensorhub 有無此 sensorType 的 sensor，再畫圖
            for(let group_num=0; group_num<groups.length; group_num++){
                var group_id = groups[group_num];
        
                $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
                    var body = JSON.parse(data);
                
                    body.Items.forEach(function make(sensor) {
                        if(sensor.sensorType == select_type[i]){
                            $.get(api_url + 'api/sensors_in_timeinterval/' + select_type[i] + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
                                draw_sensor_data(data, charts[i], group_num, sensor.num);
                            });
                        }
                    });
                });
            }
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
        console.log(dataset);
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
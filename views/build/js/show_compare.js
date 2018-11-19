var groups = JSON.parse(getCookie("groups"));
var select_type = getCookie("sensorType");
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
            type: 'spline'
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
            xDateFormat: '%m/%d/%Y<br>%H:%M'
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
    var chart = Highcharts.chart('container', options);

    for(let group_num=0; group_num<groups.length; group_num++){
        var group_id = groups[group_num];

        $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
            var body = JSON.parse(data);
        
            body.Items.forEach(function make(sensor) {
                if(sensor.sensorType == select_type){
                    $.get(api_url + 'api/sensors_in_timeinterval/' + select_type + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
                        draw_sensor_data(data, chart, group_num);
                    });
                }
            });
        });
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
        //重新設定highchart參數
        var chart = Highcharts.chart('container', options);

        var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
        var fromEpoch = fromDate.getTime();
        var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
        var toEpoch = toDate.getTime();

        for(let group_num=0; group_num<groups.length; group_num++){
            var group_id = groups[group_num];
    
            $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
                var body = JSON.parse(data);
            
                body.Items.forEach(function make(sensor) {
                    if(sensor.sensorType == select_type){
                        $.get(api_url + 'api/sensors_in_timeinterval/' + select_type + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
                            draw_sensor_data(data, chart, group_num);
                        });
                    }
                });
            });
        }
    });
    /*-------------------選擇時間-------------------*/
});


function draw_sensor_data(data, chart, group_num) {
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
                name: groups_name[group_num],
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
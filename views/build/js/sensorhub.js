var uuid = getCookie("checker");
var group_id = getCookie("group");
var api_url = 'http://ec2-13-125-205-170.ap-northeast-2.compute.amazonaws.com:3000/';

var max;
var min;
var avg;
var sum;
var barGraph = null;
var toDate = new Date();

var toEpoch = toDate.getTime();
var fromEpoch = toEpoch - 86400000;

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function import_sensor_data() {
  $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(sensor) {
      if (sensor.visible == 0) {
        return;
      }
      // all graphs are default hidden, and only the ones with data would be shown
      $('#' + sensor.sensorType).show();
      //console.log(sensor.sensorType + "show");
      //console.log('input[name="' + sensor.sensorType + '_daterange"]');

      $('input[name="daterange_picker"]').daterangepicker({
        timePicker: true,
        timePickerIncrement: 5,
        locale: {
          format: 'MM/DD/YYYY HH:mm'
        }
      });

      $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
        draw_sensor_data(data, sensor.sensorType);
      });

      $('#daterange_picker').on('apply.daterangepicker', function(ev, picker) {
        var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
        var fromEpoch = fromDate.getTime();
        var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
        var toEpoch = toDate.getTime();

        $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
          var body = JSON.parse(data);
          for(let i = 0; i < body.Count; i++) {
            if (body.Items[i].visible == 1) {
              $.get(api_url + 'api/sensors_in_timeinterval/' + body.Items[i].sensorType + '/' + body.Items[i].sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
                draw_sensor_data(data, body.Items[i].sensorType);
              });
            }
          }
        });

      });
    });
  });
}

function draw_sensor_data(data, type) {
  main();
  async function main() {
    var body = JSON.parse(data);
    //console.log(body);
    try {
      var dataset = await parseData(body);
      var date = await parseDate(body);
      var map = await draw(dataset, date);
    } catch (err) {
      console.error(err);
    }
  }

  async function parseData(data) {
    return Promise.all(data.Items.map(function(set) {
      return Number(set.value.toFixed(1));
    }));
  }

  async function parseDate(data) {
    return Promise.all(data.Items.map(function(set) {
      var date = new Date(Number(set.timestamp));
      var formattedDate = ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
      return formattedDate;
    }));
  }

  function draw(dataset, date) {
    max = Math.max(...dataset);
    min = Math.min(...dataset);

    console.log(dataset);

    sum = dataset.reduce(function(a, b) {
      return a + b;
    });
    avg = (sum / dataset.length).toFixed(1);


    String.prototype.capitalize = function() {
      return this.replace(/(?:^|\s)\S/g, function(a) {
        return a.toUpperCase();
      });
    };

    if (type == "CO2") {
      sensor_type = "CO2";
    } else if (type == "SOIL_EC") {
      sensor_type = "Soil EC";
    } else {
      sensor_type = type.replace("_", " ").toLowerCase();
      sensor_type = sensor_type.capitalize();
    }

    var temp = Highcharts.chart(type + '_div', {
      //console.log(dataset);
      chart: {
        scrollablePlotArea: {
          minWidth: 700
        },
        height: 500
      },

      xAxis: {
        categories: date,
        tickInterval: null,
        labels: {
          enabled: true,
        }
      },

      yAxis: {
        title: {
          text: type
        }
      },

      title: {
        text: sensor_type
      },

      legend: {
        align: 'left',
        verticalAlign: 'top',
        borderWidth: 0
      },

      tooltip: {
        shared: true,
        crosshairs: true
      },

      plotOptions: {
        series: {
          cursor: 'pointer',
          label: {
            connectorAllowed: false
          },
          marker: {
            lineWidth: 1
          }
        }
      },

      exporting: false,

      series: [{
        name: sensor_type,
        data: dataset
      }]
    });

    temp.yAxis[0].addPlotLine({
      value: avg,
      color: 'green',
      dashStyle: 'shortdash',
      width: 2,
      label: {
        text: '平均 : ' + avg,
        style: {
          color: 'white'
        }
      }
    });

    temp.yAxis[0].addPlotLine({
      value: min,
      color: 'red',
      dashStyle: 'shortdash',
      width: 2,
      label: {
        text: '最低 : ' + min,
        style: {
          color: 'white'
        }
      }
    });

    temp.yAxis[0].addPlotLine({
      value: max,
      color: 'red',
      dashStyle: 'shortdash',
      width: 2,
      label: {
        text: '最高 : ' + max,
        style: {
          color: 'white'
        }
      }
    });
  }
  //console.log(dataset);
}

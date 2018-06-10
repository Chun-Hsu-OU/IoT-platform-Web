var uuid = getCookie("checker");
var group_id = getCookie("group");
var api_url = 'http://ec2-13-125-205-170.ap-northeast-2.compute.amazonaws.com:3000/';

var toDate = new Date();

var toEpoch = toDate.getTime();
var fromEpoch = toEpoch - 86400000;
var firstLoadTag = 1;

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

function load_sensorhub_descriptions() {
  $.get(api_url + 'api/sensorgroup_in_area/' + area, function(data) {
    var body = JSON.parse(data);
    body.Items.forEach(function (hub) {
      if (hub.groupId == sensorhub){
        //document.getElementById("sensorhub_page_title").innerHTML = hub.name;
        $( "#sensorhub_page_title" ).append('<h1>' + hub.name + '</h1>');
        $( "#sensorhub_description" ).append('<h2>' + hub.description + '</h2>');
      }
    });
  });
}

function import_sensor_data() {
  var product;

  $.get(api_url + 'api/sensorgroup_in_area/' + area, function(data) {
    var body = JSON.parse(data);
    for (let j = 0; j < body.Count; j++) {
      if (body.Items[j].groupId == group) {
        product = body.Items[j].product;
      }
    }

    $.get(api_url + 'api/expert/' + product, function(data) {
      var body = JSON.parse(data);

      for (let index = 0; index < body.Count; index++) {
        if (body.Items[index].feature == "CO2") {
          var sensor_type = "CO2";
        } else if (body.Items[index].feature == "SOIL_EC") {
          var sensor_type = "Soil EC";
        } else if (body.Items[index].feature == "AVG_WIND_SPEED"){
          var sensor_type = "Average Wind Speed"
        } else {
          var sensor_type = body.Items[index].feature.replace("_", " ").toLowerCase();
          sensor_type = sensor_type.capitalize();
        }
        //console.log(body.Items[index]);

        $('#expert_table_identity').append('<tr id="' + body.Items[index].feature + '_feature' + '">' +
          '<td>' + sensor_type + '</td>' +
          '<td>' + body.Items[index].min + '</td>' +
          '<td>' + body.Items[index].max + '</td>' +
          '<td>' + body.Items[index].description + '</td>' +
          '<td>' + body.Items[index].expert + '</td>' +
          '</tr>');
      }
    });
  });

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
        draw_sensor_data(data, sensor.sensorType, firstLoadTag);
      });

      $('#daterange_picker').on('apply.daterangepicker', function(ev, picker) {
        var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
        var fromEpoch = fromDate.getTime();
        var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
        var toEpoch = toDate.getTime();

        $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
          var body = JSON.parse(data);
          for (let i = 0; i < body.Count; i++) {
            if (body.Items[i].visible == 1) {
              $.get(api_url + 'api/sensors_in_timeinterval/' + body.Items[i].sensorType + '/' + body.Items[i].sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
                draw_sensor_data(data, body.Items[i].sensorType, firstLoadTag = 0);
              });
            }
          }
        });

      });
    });
  });
}

function draw_sensor_data(data, type, firstLoadTag) {
  main();
  console.log(firstLoadTag);

  async function main() {
    var body = JSON.parse(data);
    //console.log(body);
    try {
      var dataset = await parseData(body);
      var date = await parseDate(body);
      if (dataset.length != 0){
        var map = await draw(dataset, date);
      }
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
      var formattedDate = '<br>' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/' + date.getFullYear() + '<br>' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
      return formattedDate;
    }));
  }

  function draw(dataset, date) {
    var max = Math.max(...dataset);
    var min = Math.min(...dataset);

    var sum = dataset.reduce(function(a, b) {
      return a + b;
    });
    var avg = (sum / dataset.length).toFixed(1);


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

    if (firstLoadTag == 1) {
      $.get(api_url + 'api/sensorgroup_in_area/' + area, function(data) {
        var body = JSON.parse(data);
        for (let j = 0; j < body.Count; j++) {
          if (body.Items[j].groupId == group) {
            product = body.Items[j].product;
          }
        }
        $.get(api_url + 'api/expert/' + product, function(data) {
          var body = JSON.parse(data);

          for (let index = 0; index < body.Count; index++) {
            if (type == body.Items[index].feature) {
              if (body.Items[index].max < max || body.Items[index].min > min){
                console.log(body.Items[index].max + "-" + max);
                console.log(body.Items[index].min + "-" + min);
                $('#' + body.Items[index].feature + '_feature').css("background-color", "red");
              }
            }
          }
        });
      });
    }

    var temp = Highcharts.chart(type + '_div', {
      //console.log(dataset);
      chart: {
        scrollablePlotArea: {
          minWidth: 600
        },
        height: 550
      },

      xAxis: {
        tickInterval: Math.floor((date.length) / 10),
        categories: date,
        labels: {
          enabled: true,
        }
      },

      yAxis: {
        title: {
          text: sensor_type
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
        crosshairs: true,
        style: {
          fontSize: 15
        }
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
          label: {
            enabled: false,
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

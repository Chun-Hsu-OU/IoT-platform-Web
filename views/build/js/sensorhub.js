var api_url = 'http://ec2-13-125-205-170.ap-northeast-2.compute.amazonaws.com:3000/';

var uuid = getCookie("checker");
var group_id = getCookie("group");

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


String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) {
    return a.toUpperCase();
  });
};

function change_limit() {
  var max = document.getElementById("knob_max").value;
  var min = document.getElementById("knob_min").value;
  var group = getCookie("group");

  $.get(api_url + 'api/control/search/' + group, function(data) {
    var body = JSON.parse(data);
    var controller = body.Items[0].controllerId;

    $.post(api_url + 'api/control/limit', {
      "controllerId": controller,
      "max": max,
      "min": min
    });
  });

}

function load_sensorhub_descriptions() {
  $.get(api_url + 'api/sensorgroup_in_area/' + area, function(data) {
    var body = JSON.parse(data);
    body.Items.forEach(function(hub) {
      if (hub.groupId == sensorhub) {
        //document.getElementById("sensorhub_page_title").innerHTML = hub.name;
        $("#sensorhub_page_title").append('<h1>' + hub.name + '</h1>');
        $("#sensorhub_description").append('<h2>' + hub.description + '</h2>');
      }
    });
  });
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
          for (let i = 0; i < body.Count; i++) {
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
    try {
      var dataset = await parseData(body);
      var date = await parseDate(body);
      if (dataset.length != 0) {
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

    if (type != "WIND_DIRECTION") {
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
    } else {
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
          },
          categories: ["北", "東北", "東", "東南", "南", "西南", "西", "西北"]
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
          formatter: function() {
            if (this.y == 0) {
              var dir = "北";
            } else if (this.y == 1) {
              var dir = "東北";
            } else if (this.y == 2) {
              var dir = "東";
            } else if (this.y == 3) {
              var dir = "東南";
            } else if (this.y == 4) {
              var dir = "南";
            } else if (this.y == 5) {
              var dir = "西南";
            } else if (this.y == 6) {
              var dir = "西";
            } else if (this.y == 7) {
              var dir = "西北";
            }
            return '<b>' + this.x +
              '</b><br>風向：<b>' + dir + '</b>';
          },
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
    }
    //console.log(dataset);
  }
}

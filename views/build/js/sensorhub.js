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
      console.log('input[name="' + sensor.sensorType + '_daterange"]');

      $('input[name="' + sensor.sensorType + '_daterange"]').daterangepicker({
        timePicker: true,
        timePickerIncrement: 5,
        locale: {
          format: 'MM/DD/YYYY HH:mm'
        }
      });

      $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
        draw_sensor_data(data, sensor.sensorType);
      });

      $('#' + sensor.sensorType + '_daterange').on('apply.daterangepicker', function(ev, picker) {
        var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
        var fromEpoch = fromDate.getTime();
        var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
        var toEpoch = toDate.getTime();

        $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch, function(data) {
          draw_sensor_data(data, sensor.sensorType);
        });
      });
    });
  });
}

function draw_sensor_data(data, type) {
  if(barGraph != null) {
    barGraph.destroy();
  }
  var body = JSON.parse(data);
  var dataset = [];
  var time = [];
  console.log("data = " + data);
  body.Items.forEach(function make_dataset(set) {
    if (set.value != null) {
      dataset.push(Number(set.value.toFixed(1)));
      var date = new Date(Number(set.timestamp));
      var formattedDate = ('0' + (date.getMonth() + 1)).slice(-2) + '/' + ('0' + date.getDate()).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
      time.push(formattedDate);
    }
  });
  max = Math.max(...dataset);
  min = Math.min(...dataset);
  sum = dataset.reduce(function(a, b) {
    return a + b;
  });
  avg = (sum / dataset.length).toFixed(1);
  document.getElementById(type + "_min").innerHTML = min;
  document.getElementById(type + "_avg").innerHTML = avg;
  document.getElementById(type + "_max").innerHTML = max;

  String.prototype.capitalize = function() {
      return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  if (type == "CO2") {
    sensor_type = "CO2";
  } else {
    sensor_type = type.replace("_", " ").toLowerCase();
    sensor_type = sensor_type.capitalize();
  }

  var chartdata = {
    labels: time,
    datasets: [{
      label: sensor_type,
      backgroundColor: "rgba(150, 202, 89, 0.12)",
      borderColor: "rgba(150, 202, 89, 0.9)",
      pointBorderColor: "rgba(150, 202, 89, 0.9)",
      pointBackgroundColor: "rgba(0, 0, 0, 0.0)",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointBorderWidth: 3,
      pointRadius: 5,
      data: dataset
    }]
  };

  ctx = $("#" + type + "_canvas");

  barGraph = new Chart(ctx, {
    type: 'line',
    data: chartdata,
    options: {
      elements: {
        line: {
          tension: 0, // disables bezier curves
        }
      }
    }
  });
}

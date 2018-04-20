var uuid = getCookie("checker");
var group_id = getCookie("group");
var api_url = 'http://localhost:3000/';

var max;
var min;
var avg;
var sum;
var Mon = getMonday(new Date());
var U_Mon = Mon.getTime();
var U_Sun = U_Mon + 604799999;

function getMonday(d) {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

Mon.setHours(0);
Mon.setMinutes(0);
Mon.setSeconds(0);
Mon.setMilliseconds(0);

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

function draw_sensor_data() {
  $.get(api_url + 'api/sensors_in_group/' + group_id, function(data) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(sensor) {
      if (sensor.visible == 0) {
        return;
      }
      // all graphs are default hidden, and only the ones with data would be shown
      $('#' + sensor.sensorType).show();

      $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + U_Mon + '/' + U_Sun, function(data) {
        var body = JSON.parse(data);
        var dataset = [];
        //console.log(data);
        body.Items.forEach(function make_dataset(set) {
          dataset.push(Number(set.value.toFixed(2)));
        });
        max = Math.max(...dataset);
        min = Math.min(...dataset);
        sum = dataset.reduce(function(a, b) { return a + b; });
        avg = (sum/dataset.length).toFixed(2);
        console.log(Math.max(...dataset));
        console.log(avg);
      });
    });
  });
}

function test_show() {
  $('#AIR_TEMPERATURE').css("display", "block");
  console.log("try");
}

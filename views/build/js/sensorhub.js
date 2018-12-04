var api_url = 'http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/';

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

function load_sensorhub_descriptions() {
  $.get(api_url + 'api/sensorgroup_in_area/' + area, function(data) {
    var body = JSON.parse(data);
    body.Items.forEach(function(hub) {
      if (hub.groupId == group_id) {
        //document.getElementById("sensorhub_page_title").innerHTML = hub.name;
        $("#sensorhub_page_title").append(hub.name);
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
      if(set.value != null){
        if(type == "METER"){
          var value = set.value * 1000;
          return value;
        }else{
          return Number(set.value.toFixed(1));
        }
      }else{
        return null;
      }
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
      var sensor_type = "CO2";
    } else if (type == "SOIL_EC") {
      var sensor_type = "Soil EC";
    } else {
      var sensor_type = type.replace("_", " ").toLowerCase();
      var sensor_type = sensor_type.capitalize();
    }

    if (type != "WIND_DIRECTION") {
      var title = type;
      if(type == "METER"){
        title = "累積用水量";
      }

      var temp = Highcharts.chart(type + '_div', {
        chart: {
          scrollablePlotArea: {
            minWidth: 300
          },
          height: 400
        },

        xAxis: {
          tickInterval: Math.floor((date.length) / 6),
          categories: date,
          labels: {
            enabled: true,
          }
        },

        title: {
          text: title
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
          name: title,
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
    } else{
      var temp = Highcharts.chart(type + '_div', {
        //console.log(dataset);
        chart: {
          scrollablePlotArea: {
            minWidth: 300
          },
          height: 550
        },

        xAxis: {
          tickInterval: Math.floor((date.length) / 6),
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

    //計算並顯示每次用水量歷史數據圖
    if(type == "METER"){
      // console.log("type:"+type);
      // console.log(dataset);
      var meter_once = [];
      //在做運算時，null會自動轉成0
      //因為是前後兩個數據相減，最後會少一個，所以一開始要先補一個
      meter_once.push(0);
      for(let i=0;i<dataset.length;i++){
        if(i != dataset.length-1){
            //前面和後面都不是null才計算，否則都是0
            if(dataset[i]!=null && dataset[i+1]!=null){
              meter_once.push(dataset[i+1]-dataset[i]);
            }else{
              meter_once.push(0);
            }
        }
      }
      // console.log(meter_once);

      /* <歷史數據圖> */
      $('#METER_NOW').show();
      var temp = Highcharts.chart('meter_now_div', {
        //console.log(dataset);
        chart: {
          scrollablePlotArea: {
            minWidth: 300
          },
          height: 400
        },

        xAxis: {
          tickInterval: Math.floor((date.length) / 6),
          categories: date,
          labels: {
            enabled: true,
          }
        },

        title: {
          text: "每次用水量"
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
          name: "每次用水量",
          data: meter_once
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
      /* </歷史數據圖> */
    }
  }
}

function set_sensors_cookie(id) {
  document.cookie = "sensor=" + id;
}

function change_update_sensor_modal(id){
  $.get(api_url + 'api/sensors_in_group/' + getCookie("group"), function(data) {
    var body = JSON.parse(data);
    for (group_num = 0; group_num < body.Count; group_num++) {
      if (body.Items[group_num].sensorId == id) {
        document.getElementById('update_sensorname').value = body.Items[group_num].name;
      }
    }
  });
}

function update_sensor_item() {
  var update_name = document.getElementById("update_sensorname").value;

  $.post(api_url + 'api/update/sensor', {
    "groupId": getCookie("group"),
    "sensorId": getCookie("sensor"),
    "name": update_name
  }, function() {
    window.location.replace('sensorhub.html');
  });
}

function initial_sensor(){
  $.get(api_url + 'api/sensors_in_group/' + getCookie("group"), function(data) {
    var body = JSON.parse(data);
    for (group_num = 0; group_num < body.Count; group_num++) {
        var type = body.Items[group_num].sensorType;
        var id = body.Items[group_num].sensorId;
        var name = body.Items[group_num].name;
        $("#current_"+type+"_div").find("#edit").attr('onclick','set_sensors_cookie(\'' + id + '\');'+
        'change_update_sensor_modal(\''+ id +'\')');
        $("#current_"+type+"_div").find("#name").text(name);
    }
  });
}

function add_sensor_item() {
  var add_name = document.getElementById("add_sensorname").value;
  var add_type = document.getElementById("add_sensorType").value;
  var macAddr = getCookie("macAddr");
  
  $.get(api_url + 'api/sensors/num/'+ macAddr +'/'+ add_type, function(data){
    console.log(data);

    $.post(api_url + 'api/add/sensor', {
      "groupId": groupId,
      "name": add_name,
      "macAddr": getCookie("macAddr"),
      "sensorType": add_type,
      "num": data,
      "ownerId": getCookie("checker")
    }, function(data) {
        alert("新增感測器 '" + add_name + "'成功！");
        location.reload();
    });
  });
}

function initial_sensor_name(){
  document.getElementById("add_sensorname").value = $("#add_sensorType option:selected").text();
}

function initial_current_chart(){
  document.addEventListener("DOMContentLoaded", function(event) {
    var sensors = {};

    sensors.air_temp = new JustGage({
      id: "current_AIR_TEMPERATURE",
      label: "度",
      value: 0,
      min: 0,
      max: 40,
      levelColors: [
          "#2187ED",
          "#EDDF1A",
          "#E31251"
      ],
      humanFriendly: true,
      gaugeWidthScale: 0.7,
      pointer: true,
      pointerOptions: {
          toplength: 10,
          bottomlength: 10,
          bottomwidth: 2
      },
      counter: true,
      relativeGaugeSize: true
    });

    sensors.air_hum = new JustGage({
        id: "current_AIR_HUMIDITY",
        label: "%",
        value: 0,
        min: 0,
        max: 100,
        levelColors: [
            "#C8EDFA",
            "#145CE0"
        ],
        humanFriendly: true,
        gaugeWidthScale: 0.7,
        pointer: true,
        pointerOptions: {
            toplength: 10,
            bottomlength: 10,
            bottomwidth: 2
        },
        counter: true,
        relativeGaugeSize: true
    });

    sensors.soil_temp = new JustGage({
      id: "current_SOIL_TEMPERATURE",
      label: "度",
      value: 0,
      min: 0,
      max: 40,
      levelColors: [
          "#2187ED",
          "#EDDF1A",
          "#E31251"
      ],
      humanFriendly: true,
      gaugeWidthScale: 0.7,
      pointer: true,
      pointerOptions: {
          toplength: 10,
          bottomlength: 10,
          bottomwidth: 2
      },
      counter: true,
      relativeGaugeSize: true
    });

    sensors.soil_hum = new JustGage({
      id: "current_SOIL_HUMIDITY",
      label: "%",
      value: 0,
      min: 0,
      max: 100,
      levelColors: [
          "#C8EDFA",
          "#145CE0"
      ],
      humanFriendly: true,
      gaugeWidthScale: 0.7,
      pointer: true,
      pointerOptions: {
          toplength: 10,
          bottomlength: 10,
          bottomwidth: 2
      },
      counter: true,
      relativeGaugeSize: true
    });

    sensors.light = new JustGage({
        id: "current_LIGHT_INTENSITY",
        label: "lux",
        value: 0,
        min: 0,
        max: 70000,
        levelColors: [
            "#91918D",
            "#FCDB03"
        ],
        humanFriendly: true,
        gaugeWidthScale: 0.7,
        pointer: true,
        pointerOptions: {
            toplength: 10,
            bottomlength: 10,
            bottomwidth: 2
        },
        counter: true,
        relativeGaugeSize: true
    });

    sensors.soil_ec = new JustGage({
        id: "current_SOIL_EC",
        label: "S/m",
        value: 0,
        min: 0,
        max: 1000,
        levelColors: [
            "#CCF7CB",
            "#098205"
        ],
        humanFriendly: true,
        gaugeWidthScale: 0.7,
        pointer: true,
        pointerOptions: {
            toplength: 10,
            bottomlength: 10,
            bottomwidth: 2
        },
        counter: true,
        relativeGaugeSize: true
    });

    sensors.battery = new JustGage({
        id: "current_BATTERY_VOLTAGE",
        label: "V",
        value: 0,
        min: 0,
        max: 13,
        levelColors: [
            "#CCF7CB",
            "#098205"
        ],
        humanFriendly: true,
        gaugeWidthScale: 0.7,
        pointer: true,
        pointerOptions: {
            toplength: 10,
            bottomlength: 10,
            bottomwidth: 2
        },
        counter: true,
        relativeGaugeSize: true
    });

    sensors.wind_speed = new JustGage({
        id: "current_REALTIME_WIND_SPEED",
        label: "m/s",
        value: 0,
        min: 0,
        max: 8,
        levelColors: [
            "#CCF7CB",
            "#098205"
        ],
        humanFriendly: true,
        gaugeWidthScale: 0.7,
        pointer: true,
        pointerOptions: {
            toplength: 10,
            bottomlength: 10,
            bottomwidth: 2
        },
        counter: true,
        relativeGaugeSize: true
    });

    sensors.weed_direction = new JustGage({
      id: "current_WIND_DIRECTION",
      label: "",
      value: 0,
      min: 0,
      max: 8,
      donut: true,
      levelColors: [
          "#F0F2F2",
          "#F0F2F2"
      ],
      textRenderer: function(val) {
          if (val == 0) {
              return '北';
          } else if (val == 1) {
              return '東北';
          } else if (val == 2) {
              return '東';
          }else if (val == 3) {
              return '東南';
          }else if (val == 4) {
              return '南';
          }else if (val == 5) {
              return '西南';
          }else if (val == 6) {
              return '西';
          }else if (val == 7) {
              return '西北';
          }
      },
      humanFriendly: true,
      gaugeWidthScale: 0.7,
      pointer: true,
      pointerOptions: {
          toplength: 10,
          bottomlength: 10,
          bottomwidth: 2
      },
      counter: true,
      relativeGaugeSize: true
    });

    //累積澆水量
    sensors.meter = new JustGage({
      id: "current_METER",
      label: "公升",
      value: 0,
      min: 0,
      max: 10000,
      levelColors: [
        "#C8EDFA",
        "#145CE0"
      ],
      gaugeWidthScale: 0.7,
      pointer: true,
      pointerOptions: {
          toplength: 10,
          bottomlength: 10,
          bottomwidth: 2
      },
      counter: true,
      relativeGaugeSize: true
    });

    //本次澆水量
    sensors.meter_now = new JustGage({
      id: "current_METER_now",
      label: "公升",
      value: 0,
      min: 0,
      max: 10,
      levelColors: [
        "#C8EDFA",
        "#145CE0"
      ],
      humanFriendly: true,
      gaugeWidthScale: 0.7,
      pointer: true,
      pointerOptions: {
          toplength: 10,
          bottomlength: 10,
          bottomwidth: 2
      },
      counter: true,
      relativeGaugeSize: true
    });

    console.log(sensors);
    initial_current_data(sensors);
  });
}

function initial_current_data(sensors){
  $.get(api_url + 'api/sensors_in_group/' + getCookie("group"), function(data) {
    var body = JSON.parse(data);
    for (let j = 0; j < body.Count; j++) {
      var id = body.Items[j].sensorId;
      var type = body.Items[j].sensorType;
      if(body.Items[j].visible == 1){
        $.get(api_url + 'api/sensors/' + type + '/' + id, function(data) {
          
          if (data != 'No data') {
            var value = JSON.parse(data);
            var val = value.value;
            
            if(body.Items[j].sensorType=="AIR_TEMPERATURE"){
              $('#current_AIR_TEMPERATURE_div').show();
              sensors.air_temp.refresh(val);
            } else if(body.Items[j].sensorType=="AIR_HUMIDITY"){
              $('#current_AIR_HUMIDITY_div').show();
              sensors.air_hum.refresh(val);
            } else if(body.Items[j].sensorType=="SOIL_TEMPERATURE"){
              $('#current_SOIL_TEMPERATURE_div').show();
              sensors.soil_temp.refresh(val);
            } else if(body.Items[j].sensorType=="SOIL_HUMIDITY"){
              $('#current_SOIL_HUMIDITY_div').show();
              sensors.soil_hum.refresh(val);
            } else if(body.Items[j].sensorType=="LIGHT_INTENSITY"){
              $('#current_LIGHT_INTENSITY_div').show();
              sensors.light.refresh(val);
            } else if(body.Items[j].sensorType=="BATTERY_VOLTAGE"){
              $('#current_BATTERY_VOLTAGE_div').show();
              sensors.battery.refresh(val);
            } else if(body.Items[j].sensorType=="SOIL_EC"){
              $('#current_SOIL_EC_div').show();
              sensors.soil_ec.refresh(val);
            } else if(body.Items[j].sensorType=="REALTIME_WIND_SPEED"){
              $('#current_REALTIME_WIND_SPEED_div').show();
              sensors.wind_speed.refresh(val);
            } else if (body.Items[j].sensorType == "WIND_DIRECTION") {
              $('#current_WIND_DIRECTION_div').show();
              sensors.weed_direction.refresh(val);
            } else if (body.Items[j].sensorType == "METER") {
              $('#current_METER_div').show();
              val = val * 1000;//改為公升
              sensors.meter.refresh(val);

              //顯示即時水表數據
              $('#current_METER_now_div').show();
              $.get(api_url + 'api/meter/new/' + id, function(data) {
                var amount = JSON.parse(data);
                sensors.meter_now.refresh(amount.toFixed(2));
              });
            }
          } else{
            if(body.Items[j].sensorType=="AIR_TEMPERATURE"){
              $('#current_AIR_TEMPERATURE_div').show();
              sensors.air_temp.refresh("無數據");
            } else if(body.Items[j].sensorType=="AIR_HUMIDITY"){
              $('#current_AIR_HUMIDITY_div').show();
              sensors.air_hum.refresh("無數據");
            } else if(body.Items[j].sensorType=="SOIL_TEMPERATURE"){
              $('#current_SOIL_TEMPERATURE_div').show();
              sensors.soil_temp.refresh("無數據");
            } else if(body.Items[j].sensorType=="SOIL_HUMIDITY"){
              $('#current_SOIL_HUMIDITY_div').show();
              sensors.soil_hum.refresh("無數據");
            } else if(body.Items[j].sensorType=="LIGHT_INTENSITY"){
              $('#current_LIGHT_INTENSITY_div').show();
              sensors.light.refresh("無數據");
            } else if(body.Items[j].sensorType=="BATTERY_VOLTAGE"){
              $('#current_BATTERY_VOLTAGE_div').show();
              sensors.battery.refresh("無數據");
            } else if(body.Items[j].sensorType=="SOIL_EC"){
              $('#current_SOIL_EC_div').show();
              sensors.soil_ec.refresh("無數據");
            } else if(body.Items[j].sensorType=="REALTIME_WIND_SPEED"){
              $('#current_REALTIME_WIND_SPEED_div').show();
              sensors.wind_speed.refresh("無數據");
            } else if (body.Items[j].sensorType == "WIND_DIRECTION") {
              $('#current_WIND_DIRECTION_div').show();
              sensors.weed_direction.refresh("無數據");
            } else if (body.Items[j].sensorType == "METER") {
              $('#current_METER_div').show();
              sensors.meter.refresh("無數據");
            }
          }

          
        });
      }
    }
  });
}



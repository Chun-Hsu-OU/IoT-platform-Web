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
  $.get(api_url + 'api/sensorgroup_in_area/' + area + '?token=' + token, function(data) {
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

  $.get(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token, function(data) {
    var body = JSON.parse(data);

    //初始化，預設顯示一天
    body.Items.forEach(function make(sensor) {
      if (sensor.visible == 0) {
        return;
      }
      // all graphs are default hidden, and only the ones with data would be shown
      $('#' + sensor.sensorType + sensor.num).show();
      // console.log('#' + sensor.sensorType + sensor.num);

      $('input[name="daterange_picker"]').daterangepicker({
        timePicker: true,
        timePickerIncrement: 5,
        locale: {
          format: 'MM/DD/YYYY HH:mm'
        }
      });

      $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
        draw_sensor_data(data, sensor.sensorType, sensor.num, sensor.name);
      });
    });
    
    //更改時間區段，重新畫圖
    $('#daterange_picker').on('apply.daterangepicker', function(ev, picker) {

      var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
      var fromEpoch = fromDate.getTime();
      var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
      var toEpoch = toDate.getTime();

      $.get(api_url + 'api/sensors_in_group/' + group_id + '?token=' + token, function(data) {
        var body = JSON.parse(data);
        for (let i = 0; i < body.Count; i++) {
          if (body.Items[i].visible == 1) {
            $.get(api_url + 'api/sensors_in_timeinterval/' + body.Items[i].sensorType + '/' + body.Items[i].sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
              draw_sensor_data(data, body.Items[i].sensorType, body.Items[i].num, body.Items[i].name);
            });
          }
        }
      });
    });
  });
}

//歷史數據處理
/*
  參數：
  num -> 感測器編號
  title -> 圖表名稱
*/
function draw_sensor_data(data, type, num, title) {
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

    /*
      繪製圖表，分三類:
      1.一般數據(空氣溫濕、土壤溫濕、光照度、電導度、電池電壓...等)
      2.風向(每個數值都要轉成方位)
      3.PM2.5(每個數值都要判斷是在哪個空氣品質等級)
    */
    if (type == "WIND_DIRECTION") { //風向
      var temp = Highcharts.chart(type + num + '_div', {
        chart: {
          scrollablePlotArea: {
            minWidth: 700,
            scrollPositionX: 0
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
          categories: ["北", "東北", "東", "東南", "南", "西南", "西", "西北"]
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
          name: title,
          data: dataset
        }]
      });
    }else if(type == "PM2_5"){ //PM2.5
      var temp = Highcharts.chart(type + num + '_div', {
        chart: {
          scrollablePlotArea: {
            minWidth: 700,
            scrollPositionX: 0
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
          labels: {
            formatter: function () {
                var level = "";
                if(this.value == 0){
                  level = "良好";
                }else if (this.value == 50) {
                  level = "普通";
                } else if (this.value == 100) {
                  level = "對敏感族群<br>不健康";
                } else if (this.value == 150) {
                  level = "對所有族群<br>不健康";
                }else if (this.value == 200) {
                  level = "非常不健康";
                }else if (this.value == 300) {
                  level = "危害";
                }
                return level+'<br>'+this.value;
            }
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
          formatter: function() {
            var level = "";
            if(this.y <= 50){
              level = "良好";
            }else if (this.y <= 100) {
              level = "普通";
            } else if (this.y <= 150) {
              level = "對敏感族群不健康";
            } else if (this.y <= 200) {
              level = "對所有族群不健康";
            }else if (this.y <= 300) {
              level = "非常不健康";
            }else if (this.y <= 500) {
              level = "危害";
            }
            return '<b>' + 
              this.x + 
              '<br>等級：' + level +
              '<br>數值：' + this.y +
              '</b>';
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
          name: title,
          data: dataset
        }]
      });
    }else{  //一般數據
      if(type == "METER"){
        title = "累積用水量";
      }

      var temp = Highcharts.chart(type + num + '_div', {
        chart: {
          scrollablePlotArea: {
            minWidth: 700,
            scrollPositionX: 0
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
    }

    //計算並顯示每次用水量歷史數據圖
    if(type == "METER"){
      var meter_once = [];
      //在做運算時，null會自動轉成0
      //因為是前後兩個數據相減，最後會少一個，所以一開始要先補一個0
      meter_once.push(0);
      for(let i=0;i<dataset.length;i++){
        if(i != dataset.length-1){
            //前面和後面都不是null才計算，否則都是0
            if(dataset[i]!=null && dataset[i+1]!=null){
              var meter_read = dataset[i+1]-dataset[i];
              meter_once.push( Number(meter_read.toFixed(2)) );
            }else{
              meter_once.push(0);
            }
        }
      }
      console.log(meter_once);

      /* <歷史數據圖> */
      $('#METER_NOW').show();
      var temp = Highcharts.chart('meter_now_div', {
        chart: {
          scrollablePlotArea: {
            minWidth: 700,
            scrollPositionX: 0
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
          name: "本次用水量",
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
  $.get(api_url + 'api/sensors_in_group/' + getCookie("group") + '?token=' + token, function(data) {
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

  $.post(api_url + 'api/update/sensor' + '?token=' + token, {
    "groupId": getCookie("group"),
    "sensorId": getCookie("sensor"),
    "name": update_name
  }, function() {
    window.location.replace('sensorhub.html');
  });
}

function initial_sensor(){
  $.get(api_url + 'api/sensors_in_group/' + getCookie("group") + '?token=' + token, function(data) {
    var body = JSON.parse(data);
    for (group_num = 0; group_num < body.Count; group_num++) {
        // sensor種類
        var type = body.Items[group_num].sensorType;
        // sensor id
        var id = body.Items[group_num].sensorId;
        // sensor 名稱
        var name = body.Items[group_num].name;
        // sensor 編號
        var num = body.Items[group_num].num;

        $("#current_" + type + num + "_div").find("#edit").attr('onclick','set_sensors_cookie(\'' + id + '\');'+
        'change_update_sensor_modal(\''+ id +'\')');
        $("#current_" + type + num + "_div").find("#name").text(name);
    }
  });
}

function add_sensor_item() {
  var add_name = document.getElementById("add_sensorname").value;
  var add_type = document.getElementById("add_sensorType").value;
  var macAddr = getCookie("macAddr");
  
  $.get(api_url + 'api/sensors/num/'+ macAddr +'/'+ add_type + '?token=' + token, function(data){
    console.log(data);

    $.post(api_url + 'api/add/sensor' + '?token=' + token, {
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


//即時數據處理
function initial_current_chart(){
  document.addEventListener("DOMContentLoaded", function(event) {
    var sensors = {};

    //空氣溫度
    sensors.air_temp1 = new JustGage({
      id: "current_AIR_TEMPERATURE1",
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

    sensors.air_temp2 = new JustGage({
      id: "current_AIR_TEMPERATURE2",
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

    sensors.air_temp3 = new JustGage({
      id: "current_AIR_TEMPERATURE3",
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
    //-----------------------------------

    //空氣濕度
    sensors.air_hum1 = new JustGage({
        id: "current_AIR_HUMIDITY1",
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

    sensors.air_hum2 = new JustGage({
      id: "current_AIR_HUMIDITY2",
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

    sensors.air_hum3 = new JustGage({
        id: "current_AIR_HUMIDITY3",
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
    //-----------------------------------

    //土壤溫度
    sensors.soil_temp1 = new JustGage({
      id: "current_SOIL_TEMPERATURE1",
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

    sensors.soil_temp2 = new JustGage({
      id: "current_SOIL_TEMPERATURE2",
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

    sensors.soil_temp3 = new JustGage({
      id: "current_SOIL_TEMPERATURE3",
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

    sensors.soil_temp4 = new JustGage({
      id: "current_SOIL_TEMPERATURE4",
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

    sensors.soil_temp5 = new JustGage({
      id: "current_SOIL_TEMPERATURE5",
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

    sensors.soil_temp6 = new JustGage({
      id: "current_SOIL_TEMPERATURE6",
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
    //-----------------------------------

    //土壤濕度
    sensors.soil_hum1 = new JustGage({
      id: "current_SOIL_HUMIDITY1",
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

    sensors.soil_hum2 = new JustGage({
      id: "current_SOIL_HUMIDITY2",
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

    sensors.soil_hum3 = new JustGage({
      id: "current_SOIL_HUMIDITY3",
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

    sensors.soil_hum4 = new JustGage({
      id: "current_SOIL_HUMIDITY4",
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

    sensors.soil_hum5 = new JustGage({
      id: "current_SOIL_HUMIDITY5",
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

    sensors.soil_hum6 = new JustGage({
      id: "current_SOIL_HUMIDITY6",
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
    //-----------------------------------

    sensors.light1 = new JustGage({
        id: "current_LIGHT_INTENSITY1",
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

    //土壤電導度
    sensors.soil_ec1 = new JustGage({
        id: "current_SOIL_EC1",
        label: "μS/cm",
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

    sensors.soil_ec2 = new JustGage({
        id: "current_SOIL_EC2",
        label: "μS/cm",
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

    sensors.soil_ec3 = new JustGage({
      id: "current_SOIL_EC3",
      label: "μS/cm",
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

    sensors.soil_ec4 = new JustGage({
        id: "current_SOIL_EC4",
        label: "μS/cm",
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

    sensors.soil_ec5 = new JustGage({
        id: "current_SOIL_EC5",
        label: "μS/cm",
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

    sensors.soil_ec6 = new JustGage({
        id: "current_SOIL_EC6",
        label: "μS/cm",
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
    //-----------------------------------

    sensors.battery1 = new JustGage({
        id: "current_BATTERY_VOLTAGE1",
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

    sensors.wind_speed1 = new JustGage({
        id: "current_REALTIME_WIND_SPEED1",
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

    sensors.weed_direction1 = new JustGage({
      id: "current_WIND_DIRECTION1",
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
          if(val == -1){
              return '無數據';
          }else if (val == 0) {
              return '北';
          }else if (val == 1) {
              return '東北';
          }else if (val == 2) {
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
    sensors.meter1 = new JustGage({
      id: "current_METER1",
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

    //累積用電量
    sensors.electric_meter1 = new JustGage({
      id: "current_ELECTRIC_METER1",
      label: "Wh",
      value: 0,
      min: 0,
      max: 10000,
      levelColors: [
        "#CCF7CB",
        "#098205"
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

    sensors.pm2_51 = new JustGage({
      id: "current_PM2_51",
      label: "",
      value: 0,
      min: 0,
      max: 500,
      levelColors: [
          "#1EC918",
          "#FFFF00",
          "#FF8C00",
          "#FF0000",
          "#800080",
          "#8B0000"
      ],
      textRenderer: function(val) {
        var level = "";
        if(val <= 50){
          level = "良好";
        }else if (val <= 100) {
          level = "普通";
        } else if (val <= 150) {
          level = "對敏感族群不健康";
        } else if (val <= 200) {
          level = "對所有族群不健康";
        }else if (val <= 300) {
          level = "非常不健康";
        }else if (val <= 500) {
          level = "危害";
        }
        return level + '\n' + val;
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

    sensors.switch1 = new JustGage({
      id: "current_SWITCH1",
      label: "",
      value: 0,
      min: 0,
      max: 1,
      levelColors: [
        "#CCF7CB",
        "#098205"
      ],
      textRenderer: function(val) {
          if (val == -1) {
              return '無數據';
          } else if (val == 0) {
              return '關閉';
          } else if (val == 1) {
              return '開啟';
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

    console.log(sensors);
    initial_current_data(sensors);
  });
}

function initial_current_data(sensors){
  $.get(api_url + 'api/sensors_in_group/' + getCookie("group") + '?token=' + token, function(data) {
    var body = JSON.parse(data);
    for (let j = 0; j < body.Count; j++) {
      // sensor id
      var id = body.Items[j].sensorId;
      // sensor 種類
      var type = body.Items[j].sensorType;

      if(body.Items[j].visible == 1){
        $.get(api_url + 'api/sensors/' + type + '/' + id + '?token=' + token, function(data) {

          /* 有數據 */
          if (data != 'No data') {
            var value = JSON.parse(data);
            var val = value.value;
            
            if(body.Items[j].sensorType=="AIR_TEMPERATURE"){
              $('#current_AIR_TEMPERATURE' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.air_temp1.refresh(val);
              }else if(body.Items[j].num == "2"){
                sensors.air_temp2.refresh(val);
              }else if(body.Items[j].num == "3"){
                sensors.air_temp3.refresh(val);
              }
              
            } else if(body.Items[j].sensorType=="AIR_HUMIDITY"){
              $('#current_AIR_HUMIDITY' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.air_hum1.refresh(val);
              }else if(body.Items[j].num == "2"){
                sensors.air_hum2.refresh(val);
              }else if(body.Items[j].num == "3"){
                sensors.air_hum3.refresh(val);
              }
              
            } else if(body.Items[j].sensorType=="SOIL_TEMPERATURE"){

              $('#current_SOIL_TEMPERATURE' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.soil_temp1.refresh(val);
              }else if(body.Items[j].num == "2"){
                sensors.soil_temp2.refresh(val);
              }else if(body.Items[j].num == "3"){
                sensors.soil_temp3.refresh(val);
              }else if(body.Items[j].num == "4"){
                sensors.soil_temp4.refresh(val);
              }else if(body.Items[j].num == "5"){
                sensors.soil_temp5.refresh(val);
              }else if(body.Items[j].num == "6"){
                sensors.soil_temp6.refresh(val);
              }
              
            } else if(body.Items[j].sensorType=="SOIL_HUMIDITY"){

              $('#current_SOIL_HUMIDITY' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.soil_hum1.refresh(val);
              }else if(body.Items[j].num == "2"){
                sensors.soil_hum2.refresh(val);
              }else if(body.Items[j].num == "3"){
                sensors.soil_hum3.refresh(val);
              }else if(body.Items[j].num == "4"){
                sensors.soil_hum4.refresh(val);
              }else if(body.Items[j].num == "5"){
                sensors.soil_hum5.refresh(val);
              }else if(body.Items[j].num == "6"){
                sensors.soil_hum6.refresh(val);
              }

            } else if(body.Items[j].sensorType=="LIGHT_INTENSITY"){
              $('#current_LIGHT_INTENSITY' + body.Items[j].num + '_div').show();
              sensors.light1.refresh(val);
            } else if(body.Items[j].sensorType=="BATTERY_VOLTAGE"){
              $('#current_BATTERY_VOLTAGE' + body.Items[j].num + '_div').show();
              sensors.battery1.refresh(val);
            } else if(body.Items[j].sensorType=="SOIL_EC"){
              
              $('#current_SOIL_EC' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.soil_ec1.refresh(val);
              }else if(body.Items[j].num == "2"){
                sensors.soil_ec2.refresh(val);
              }else if(body.Items[j].num == "3"){
                sensors.soil_ec3.refresh(val);
              }else if(body.Items[j].num == "4"){
                sensors.soil_ec4.refresh(val);
              }else if(body.Items[j].num == "5"){
                sensors.soil_ec5.refresh(val);
              }else if(body.Items[j].num == "6"){
                sensors.soil_ec6.refresh(val);
              }

            } else if(body.Items[j].sensorType=="REALTIME_WIND_SPEED"){
              $('#current_REALTIME_WIND_SPEED' + body.Items[j].num + '_div').show();
              sensors.wind_speed1.refresh(val);
            } else if (body.Items[j].sensorType == "WIND_DIRECTION") {
              $('#current_WIND_DIRECTION' + body.Items[j].num + '_div').show();
              sensors.weed_direction1.refresh(val);
            } else if (body.Items[j].sensorType == "METER") {
              $('#current_METER' + body.Items[j].num + '_div').show();
              val = val * 1000;//改為公升
              sensors.meter1.refresh(val);

              //顯示即時水表數據
              $('#current_METER_now_div').show();
              $.get(api_url + 'api/meter/new/' + id + '?token=' + token, function(data) {
                var amount = JSON.parse(data);
                sensors.meter_now.refresh(amount.toFixed(2));
              });
            }else if(body.Items[j].sensorType == "ELECTRIC_METER"){
              $('#current_ELECTRIC_METER' + body.Items[j].num + '_div').show();
              sensors.electric_meter1.refresh(val);
            }else if(body.Items[j].sensorType == "PM2_5"){
              $('#current_PM2_5' + body.Items[j].num + '_div').show();
              sensors.pm2_51.refresh(val);
            }else if(body.Items[j].sensorType == "SWITCH"){
              $('#current_SWITCH' + body.Items[j].num + '_div').show();
              sensors.switch1.refresh(val);
            }
          } else{  /* 無數據 */
            if(body.Items[j].sensorType=="AIR_TEMPERATURE"){
              $('#current_AIR_TEMPERATURE' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.air_temp1.refresh("無數據");
              }else if(body.Items[j].num == "2"){
                sensors.air_temp2.refresh("無數據");
              }else if(body.Items[j].num == "3"){
                sensors.air_temp3.refresh("無數據");
              }
              
            } else if(body.Items[j].sensorType=="AIR_HUMIDITY"){
              $('#current_AIR_HUMIDITY' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.air_hum1.refresh("無數據");
              }else if(body.Items[j].num == "2"){
                sensors.air_hum2.refresh("無數據");
              }else if(body.Items[j].num == "3"){
                sensors.air_hum3.refresh("無數據");
              }
              
            } else if(body.Items[j].sensorType=="SOIL_TEMPERATURE"){

              $('#current_SOIL_TEMPERATURE' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.soil_temp1.refresh("無數據");
              }else if(body.Items[j].num == "2"){
                sensors.soil_temp2.refresh("無數據");
              }else if(body.Items[j].num == "3"){
                sensors.soil_temp3.refresh("無數據");
              }else if(body.Items[j].num == "4"){
                sensors.soil_temp4.refresh("無數據");
              }else if(body.Items[j].num == "5"){
                sensors.soil_temp5.refresh("無數據");
              }else if(body.Items[j].num == "6"){
                sensors.soil_temp6.refresh("無數據");
              }

            } else if(body.Items[j].sensorType=="SOIL_HUMIDITY"){

              $('#current_SOIL_HUMIDITY' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.soil_hum1.refresh("無數據");
              }else if(body.Items[j].num == "2"){
                sensors.soil_hum2.refresh("無數據");
              }else if(body.Items[j].num == "3"){
                sensors.soil_hum3.refresh("無數據");
              }else if(body.Items[j].num == "4"){
                sensors.soil_hum4.refresh("無數據");
              }else if(body.Items[j].num == "5"){
                sensors.soil_hum5.refresh("無數據");
              }else if(body.Items[j].num == "6"){
                sensors.soil_hum6.refresh("無數據");
              }

            } else if(body.Items[j].sensorType=="LIGHT_INTENSITY"){
              $('#current_LIGHT_INTENSITY' + body.Items[j].num + '_div').show();
              sensors.light1.refresh("無數據");
            } else if(body.Items[j].sensorType=="BATTERY_VOLTAGE"){
              $('#current_BATTERY_VOLTAGE' + body.Items[j].num + '_div').show();
              sensors.battery1.refresh("無數據");
            } else if(body.Items[j].sensorType=="SOIL_EC"){

              $('#current_SOIL_EC' + body.Items[j].num + '_div').show();
              if(body.Items[j].num == "1"){
                sensors.soil_ec1.refresh("無數據");
              }else if(body.Items[j].num == "2"){
                sensors.soil_ec2.refresh("無數據");
              }else if(body.Items[j].num == "3"){
                sensors.soil_ec3.refresh("無數據");
              }else if(body.Items[j].num == "4"){
                sensors.soil_ec4.refresh("無數據");
              }else if(body.Items[j].num == "5"){
                sensors.soil_ec5.refresh("無數據");
              }else if(body.Items[j].num == "6"){
                sensors.soil_ec6.refresh("無數據");
              }

            } else if(body.Items[j].sensorType=="REALTIME_WIND_SPEED"){
              $('#current_REALTIME_WIND_SPEED' + body.Items[j].num + '_div').show();
              sensors.wind_speed1.refresh("無數據");
            } else if (body.Items[j].sensorType == "WIND_DIRECTION") {
              $('#current_WIND_DIRECTION' + body.Items[j].num + '_div').show();
              sensors.weed_direction1.refresh(-1);
            } else if (body.Items[j].sensorType == "METER") {
              $('#current_METER' + body.Items[j].num + '_div').show();
              sensors.meter1.refresh("無數據");
              sensors.meter_now.refresh("無數據");
            } else if (body.Items[j].sensorType == "ELECTRIC_METER"){
              $('#current_ELECTRIC_METER' + body.Items[j].num + '_div').show();
              sensors.electric_meter1.refresh("無數據");
            } else if (body.Items[j].sensorType == "PM2_5"){
              $('#current_PM2_5' + body.Items[j].num + '_div').show();
              sensors.pm2_51.refresh("無數據");
            } else if (body.Items[j].sensorType == "SWITCH"){
              $('#current_SWITCH' + body.Items[j].num + '_div').show();
              sensors.switch1.refresh(-1);
            }
          }

          
        });
      }
    }
  });
}



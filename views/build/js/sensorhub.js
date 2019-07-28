var area = getCookie("area");
var group_id = getCookie("group");

var toDate = new Date();
var toEpoch = toDate.getTime();
var fromEpoch = toEpoch - 86400000;

//每隔12分鐘刷新一次頁面
setTimeout(function(){ 
  window.location.reload();
}, 12*60*1000);

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
      // $('#' + sensor.sensorType + sensor.num).show();
      // console.log('#' + sensor.sensorType + sensor.num);

      $('input[name="daterange_picker"]').daterangepicker({
        timePicker: true,
        timePickerIncrement: 5,
        locale: {
          format: 'MM/DD/YYYY HH:mm'
        }
      });

      $.get(api_url + 'api/sensors_in_timeinterval/' + sensor.sensorType + '/' + sensor.sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
        //創圖表的html
        $('#history_charts').append('<div class="diagram" id="'+ sensor.sensorType + sensor.num +'">'+
                                      '<div id="'+ sensor.sensorType + sensor.num + '_div"></div>'+
                                    '</div>');
        
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
          $.get(api_url + 'api/sensors_in_timeinterval/' + body.Items[i].sensorType + '/' + body.Items[i].sensorId + '/' + fromEpoch + '/' + toEpoch + '?token=' + token, function(data) {
            draw_sensor_data(data, body.Items[i].sensorType, body.Items[i].num, body.Items[i].name);
          });
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
          return Number(set.value.toFixed(1));
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
  document.addEventListener("DOMContentLoaded", function(event) {
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

          var icon_name = get_dashboard_icon(type);

          $("#current_dashboards").append(
            '<div class="gauge" id="current_'+ type + num +'_div">'+
              '<center>'+
                '<embed class="image_size" src="images/'+ icon_name +'.svg"/>'+
                '<div class="font_style" id="name"></div>'+
                '<a href="#" id="edit" data-toggle="modal" data-target="#set_sensor_modal">'+
                  '<img class="edit" src="images/edit.png">'+
                '</a>'+
              '</center>'+
              '<br>'+
              '<div id="current_'+ type + num +'"></div>'+
            '</div>'
            );
          
          $("#current_" + type + num + "_div").find("#edit").attr('onclick','set_sensors_cookie(\'' + id + '\');'+
          'change_update_sensor_modal(\''+ id +'\')');
          $("#current_" + type + num + "_div").find("#name").text(name);

          //生成儀表板
          var dashboard = choose_dashboard_type('current_'+ type + num, type);

          get_current_data(type, id, dashboard);
      }
    });
  });
}

function get_current_data(type, id, dashboard){
  $.get(api_url + 'api/sensors/' + type + '/' + id + '?token=' + token, function(data) {

    console.log(group_num);
    
    if (data != 'No data') {  /* 有數據 */
      var value = JSON.parse(data);
      var val = value.value;
      
      if(type == "METER"){
        val = val.toFixed(2);
      }
  
      dashboard.refresh(val);
    }else{   /* 無數據 */
      dashboard.refresh("無數據");
    }
  });
}

function get_dashboard_icon(type){
  var svg_name = "agriculture";

  if(type=="AIR_TEMPERATURE" || type=="SOIL_TEMPERATURE"){
    svg_name = "thermometer";
  }else if(type=="AIR_HUMIDITY" || type=="SOIL_HUMIDITY"){
    svg_name = "drop";
  }else if(type == "LIGHT_INTENSITY"){
    svg_name = "sunlight";
  }else if(type == "SOIL_EC"){
    svg_name = "flash";
  }else if(type == "BATTERY_VOLTAGE"){
    svg_name = "battery";
  }else if(type == "METER"){
    svg_name = "meter";
  }else if(type == "CO2"){
    svg_name = "co2";
  }

  return svg_name;
}

function choose_dashboard_type(id, type){

  if(type=="AIR_TEMPERATURE" || type=="SOIL_TEMPERATURE"){
    return create_dashboard(id, "度", max=40);
  }else if(type=="AIR_HUMIDITY" || type=="SOIL_HUMIDITY"){
    return create_dashboard(id, "%", 100, ["#C8EDFA","#145CE0"]);
  }else if(type == "LIGHT_INTENSITY"){
    return create_dashboard(id, "lux", 70000, ["#000000","#FFF700"]);
  }else if(type == "SOIL_EC"){
    return create_dashboard(id, "μS/cm", 1000, ["#CCF7CB","#098205"]);
  }else if(type == "BATTERY_VOLTAGE"){
    return create_dashboard(id, "V", 13, ["#CCF7CB","#098205"]);
  }else if(type == "METER"){
    return create_dashboard(id, "公升", 10000, ["#C8EDFA","#145CE0"]);
  }else if(type == "CO2"){
    return create_dashboard(id, "ppm", 5000, ["#F1CA5E","#D52D15"]);
  }else if(type == "PH_VAL"){
    return create_dashboard(id, "", 14, ["#A71309","#01549D"]);
  }else{
    return create_dashboard(id);
  }
  
}

function create_dashboard(id, label="", max=100, levelColors=["#2187ED","#EDDF1A","#E31251"]){
  
  var obj = new JustGage({
    id: id,
    label: label,
    value: 0,
    min: 0,
    max: max,
    levelColors: levelColors,
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

  return obj;
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


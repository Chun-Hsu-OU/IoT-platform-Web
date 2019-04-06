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


function add_rules(TYPE, block_num, name, sensorId, value = '數值', symbol = 'greater') {
  /*
    取得選定的sensorhub名稱，因為可能sensor會有相同名稱，
    用來顯示讓使用者區分是哪個sensorhub下的sensor
  */
  var group_name = $("#show_groups_block_"+ block_num +" option:selected").text();

  $('#add_rule_block_' + block_num).before('<div id="rule' + TYPE + '_block_' + block_num + '_' + sensorId + '">' + name + '<span id="' + TYPE + ';' + name + ';' + sensorId + '"></span>' + 
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;設定：' +
    '&emsp;&emsp;<select required="required" id="symbol"><option value="greater">大於</option><option value="less">小於</option></select>' +
    '&emsp;&emsp;<input style="text-align:center;width:70px" type="text" id="value" value="' + value + '">' +
    '&emsp;&emsp;<button type="button" onclick="delete_rule(\'' + TYPE + '\', \'' + block_num + '\', \'' + sensorId + '\')" class="btn btn-danger btn-sm">刪除</button>' +
    '<br><br></div>');
  $('#rule' + TYPE + '_block_' + block_num + '_' + sensorId).children('#symbol').val(symbol).change();
}

function change_rules() {
  var block_array = [];
  var controller = getCookie("controller");
  var rules = [];

  block_change(block_array);

  for (let block_num = 0; block_num < block_array.length; block_num++) {
    current_block = 'rule_block_' + block_array[block_num].toString();

    var children_element = document.getElementById(current_block).children[0].children;

    for (let i = 0; i < children_element.length - 1; i++) {
      var id = children_element[i].children[0].id;
      var type = id.split(';')[0];
      var name = id.split(';')[1];
      var sensorId = id.split(';')[2];
      var value = $('#rule' + type + '_block_' + block_array[block_num].toString() + '_' + sensorId).children('#value').val();
      var symbol = $('#rule' + type + '_block_' + block_array[block_num].toString() + '_' + sensorId).children('#symbol').val();
      var duration = $('#add_rule_block_' + block_array[block_num].toString()).children('#duration').val();
      var new_rule = {
        "block": parseInt(block_array[block_num]),
        "name": name,
        "type": type,
        "sensorId": sensorId,
        "value": parseInt(value),
        "symbol": symbol,
        "duration": parseInt(duration)
      };
      rules.push(new_rule);
    }
  }

  $.post(api_url + 'api/control/rules' + '?token=' + token, {
    "controllerId": controller,
    "status": rules
  }, function(){
      alert("規則設定完成！");
  });
}

function delete_rule(type, block_num, sensorId) {
  $("#rule" + type + '_block_' + block_num + '_' + sensorId).remove();
}

function add_rule_block(block_num = 0, duration = 0) {
  //按新增區塊用
  if (block_num == 0) {
    var children = document.getElementById("control-tab-1").children;

    for (let i = 0; i < children.length; i++) {
      if (children[i].id.includes('rule_block_')) {
        num = parseInt(children[i].id.slice(11));
        if (block_num < num) {
          block_num = num;
        }
      }
    }

    block_num ++;
  }

  console.log(block_num);
  var id_name = "rule_block_" + block_num.toString();

  $('#submit_change_rule').before('<div id="temp_id">' +
    '<div style="border-width:3px;border-style:dashed;border-color:#339933;padding:5px;">' +
    '<div id="add_rule_block_' + block_num + '"><hr>' +
      '啟動時間:&nbsp&nbsp' + 
      '<select id="duration">'+
        '<option value="1">1分鐘</option>'+
        '<option value="5">5分鐘</option>'+
        '<option value="10">10分鐘</option>'+
        '<option value="15">15分鐘</option>'+
        '<option value="20">20分鐘</option>'+
        '<option value="25">25分鐘</option>'+
        '<option value="30">30分鐘</option>'+
        '<option value="35">35分鐘</option>'+
        '<option value="40">40分鐘</option>'+
        '<option value="45">45分鐘</option>'+
        '<option value="50">50分鐘</option>'+
        '<option value="55">55分鐘</option>'+
        '<option value="60">60分鐘</option>'+
      '</select><br><br>'+
      '選擇Sensorhub:&nbsp&nbsp<select id="show_groups_block_' + block_num + '" onchange="group_select_change(' + block_num + ')">' + '</select><br><br>' +
      '<div class="btn-group">' +
        '<button type="button" class="btn btn-success">新增規則</button>' +
        '<button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
          '<span class="caret"></span>' +
          '<span class="sr-only">Toggle Dropdown</span>' +
        '</button>' +
        '<button type="button" class="btn btn-danger" onclick="delete_rule_block(\'' + id_name + '\')" style="float:right">刪除規則組</button>' +
        '<ul class="dropdown-menu" role="menu" id="show_sensors_block_' + block_num + '">' +
        '</ul>' +
      '</div>' + 
    '</div>' +
  '</div><br>' +
  '</div>');
  $('#temp_id').attr("id", id_name);

  //代表來自資料庫的啟動時間，只在新增block時設定一次
  if(duration != 0){
    $('#add_rule_block_' + block_num).children('#duration').val(duration);
  }

  load_groups_in_select_rule(block_num);
}

function load_groups_in_select_rule(block_num){
  $.get(api_url + 'api/sensorgroup_in_area/' + getCookie("area") + '?token=' + token, function(data) {
    var groups = JSON.parse(data);
    for (let group_num = 0; group_num < groups.Count; group_num++) {
      $("#show_groups_block_"+block_num).append('<option value="' + groups.Items[group_num].groupId + '">' + groups.Items[group_num].name + '</option>');
      //初始化 -> load 第一組 sensorhub 裡的 sensors 
      if(group_num == 0){
        load_sensors_in_select_rule(block_num, groups.Items[group_num].groupId);
      }
    }
  });
}

function load_sensors_in_select_rule(block_num, groupId){
  $("#show_sensors_block_"+block_num).empty();
  $.get(api_url + 'api/sensors_in_group/' + groupId + '?token=' + token, function(data) {
    var sensors = JSON.parse(data);
    for (let sensor_num = 0; sensor_num < sensors.Count; sensor_num++) {
      console.log(sensors.Items[sensor_num].sensorId);
      var type = sensors.Items[sensor_num].sensorType;
      var name = sensors.Items[sensor_num].name;
      var sensorId = sensors.Items[sensor_num].sensorId;
      $("#show_sensors_block_"+block_num).append('<li><a href="#" name="' + sensors.Items[sensor_num].sensorId + 
      '" onclick="add_rules(\'' + type + '\', \'' + block_num + '\', \'' + name + '\', \'' + sensorId + '\')">' + name + '</a></li>');
    }
  });
}

function group_select_change(block_num){
  var groupId = $("#show_groups_block_"+block_num).val();
  console.log("change to: "+groupId);
  load_sensors_in_select_rule(block_num, groupId);
}

function delete_rule_block(id_name) {
  $("#" + id_name).remove();
}

function check_children(check) {
  var children = document.getElementById("control-tab-1").children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].id.includes(check)) {
      return true;
    }
  }
  return false;
}

function block_change(block_array) {
  var block = 0;
  var children = document.getElementById("control-tab-1").children;

  for (let i = 0; i < children.length; i++) {
    if (children[i].id.includes('rule_block_')) {
      num = parseInt(children[i].id.slice(11));
      block_array.push(num);
      if (block < num) {
        block = num;
      }
    }
  }
}

//------ 鬧鐘 ------
function add_clock(clock_record = 0){
  var clock_group = $("#clock_group").children();
  var clock_num = 1;
  //如果已經有鬧鐘，就算最後一個鬧鐘的clock_num(最大的clock_num) + 1
  if(clock_group.length != 0){
    clock_num = parseInt(clock_group[clock_group.length - 1].id.slice(6)) + 1;
  }

  $("#clock_group").append('<div id="clock_'+ clock_num +'">'+
    '<div class="col-sm-3">'+
      '選擇星期:&nbsp&nbsp'+
      '<select id="weekday">'+
        '<option value="0">星期一</option>'+
        '<option value="1">星期二</option>'+
        '<option value="2">星期三</option>'+
        '<option value="3">星期四</option>'+
        '<option value="4">星期五</option>'+
        '<option value="5">星期六</option>'+
        '<option value="6">星期日</option>'+
      '</select>'+
    '</div>'+
    '<div class="col-sm-1">'+
      '開始於:'+
    '</div>'+
    '<div class="col-sm-3">'+
      '<div class="input-group date timepicker">'+
        '<input type="text" class="form-control" id="start" value="10:00 AM"/>'+
        '<span class="input-group-addon">'+
          '<span class="glyphicon glyphicon-time"></span>'+
        '</span>'+
      '</div>'+
    '</div>'+
    '<div class="col-sm-1"></div>'+
    '<div class="col-sm-3">'+
      '啟動時間:&nbsp&nbsp'+
      '<select id="duration">'+
        '<option value="1">1分鐘</option>'+
        '<option value="5">5分鐘</option>'+
        '<option value="10">10分鐘</option>'+
        '<option value="15">15分鐘</option>'+
        '<option value="20">20分鐘</option>'+
        '<option value="25">25分鐘</option>'+
        '<option value="30">30分鐘</option>'+
        '<option value="35">35分鐘</option>'+
        '<option value="40">40分鐘</option>'+
        '<option value="45">45分鐘</option>'+
        '<option value="50">50分鐘</option>'+
        '<option value="55">55分鐘</option>'+
        '<option value="60">60分鐘</option>'+
      '</select>'+
    '</div>'+
    '<button type="button" onclick="delete_clock('+ clock_num +')" class="btn btn-danger btn-sm">刪除</button>'+
    '<div class="clearfix"></div>'+
    '<hr>'+
  '</div>');

  //代表來自資料庫的鬧鐘設定
  if(clock_record != 0){
    $("#clock_"+clock_num).find("#weekday").val(clock_record.weekday);
    $("#clock_"+clock_num).find("#start").val(clock_record.start);
    $("#clock_"+clock_num).find("#duration").val(clock_record.duration);
  }

  //一定要加，讓新加進來的timepicker也可以選時間
  $('.timepicker').datetimepicker({
    format: 'LT'
  });
}

function delete_clock(clock_num){
  $("#clock_"+clock_num).remove();
}

function submit_clock(){
  var clock_group = $("#clock_group").children();
  var clocks = [];
  for(let i=0; i<clock_group.length; i++){
    var clock_items = clock_group[i].children;
    var new_clock = {
      "weekday": clock_group[i].querySelector("#weekday").value,
      "start": clock_group[i].querySelector("#start").value,
      "duration": parseInt(clock_group[i].querySelector("#duration").value)
    };
    clocks.push(new_clock);
  }
  console.log(clocks);
  //將鬧鐘設定傳到資料庫
  $.post(api_url + 'api/control/clock_setting' + '?token=' + token, {
    "controllerId": getCookie("controller"),
    "status": clocks
  },function(){
    alert("時間設定完成！");
  });
}
//------ 鬧鐘 ------

//------ 手動 ------
function submit_duration(){
  console.log(document.getElementById("manual_items").children[0].value);
  $.post(api_url + 'api/control/work_cycle' + '?token=' + token, {
    "controllerId": getCookie("controller"),
    "status": document.getElementById("manual_items").children[0].value
  },function(){
    alert("手動啟動時間設定完成！");
  });
  
  setTimeout(function(){ 
    $.post(api_url + 'api/control/mode' + '?token=' + token, {
      "controllerId": getCookie("controller"),
      "status": "power"
    });
  }, 1000);
}
//------ 手動 ------

//大平窩預測澆水時間
function forcast_time(){
  $.get(api_url + 'api/forecast_time/e0c97039-5f58-4453-942e-a008fc4bec9c/9b746d04-20f6-454e-8f0b-ed8d3f3114b6?token=' + token, function(data) {
    if(data != "No data"){
      alert("預測澆水時間: "+data+"秒");
    }else{
      alert("目前無法預測澆水時間");
    }
  });
}


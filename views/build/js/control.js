var api_url = 'http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/';

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


function add_rules(TYPE, block_num, value = '數值', symbol = 'greater') {
  if (TYPE == 'AIR_TEMPERATURE') {
    var type = '空氣溫度&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
  } else if (TYPE == 'AIR_HUMIDITY') {
    var type = '空氣濕度&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
  } else if (TYPE == 'SOIL_TEMPERATURE') {
    var type = '土壤溫度&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
  } else if (TYPE == 'SOIL_HUMIDITY') {
    var type = '土壤濕度&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
  } else if (TYPE == 'SOIL_EC') {
    var type = '土壤電導度&nbsp;&nbsp;&nbsp;&nbsp;'
  } else if (TYPE == 'LIGHT_INTENSITY') {
    var type = '光照程度&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
  } else if (TYPE == 'CO2') {
    var type = '二氧化碳濃度 '
  }
  $('#add_rule_block_' + block_num).before('<div id="rule' + TYPE + '_block_' + block_num + '">' + type + '設定：' +
    '&emsp;&emsp;<select required="required" id=' + TYPE + '_symbol_' + block_num + '><option value="greater">大於</option><option value="less">小於</option></select>' +
    '&emsp;&emsp;<input style="text-align:center;width:70px" type="text" id="' + TYPE + '_value_' + block_num + '" value="' + value + '">' +
    '&emsp;&emsp;<button type="button" onclick="delete_rule(\'' + TYPE + '\', \'' + block_num + '\')" class="btn btn-danger btn-sm">刪除</button>' +
    '<br><br></div>');
  $('#' + TYPE + '_symbol_' + block_num).val(symbol).change();
}

function change_rules() {
  //var block = 0;
  var block_array = [];
  var controller = getCookie("controller");
  var rules = [];

  block_change(block_array);

  for (let block_num = 0; block_num < block_array.length; block_num++) {
    current_block = 'rule_block_' + block_array[block_num].toString();

    var children_element = document.getElementById(current_block).children[0].children;

    for (let i = 0; i < children_element.length - 1; i++) {
      var id = children_element[i].id;
      var type = id.slice(4).split('_block_')[0];
      var value = document.getElementById(type + '_value_' + block_array[block_num].toString()).value;
      //console.log(document.getElementById(type + '_bot_' + block_array[block_num].toString()).value);
      //console.log(type);
      var new_rule = {
        "block": parseFloat(block_array[block_num]),
        "type": type,
        "value": parseFloat(value),
        "symbol": document.getElementById(type + '_symbol_' + block_array[block_num].toString()).value
      };
      rules.push(new_rule);
    }
  }

  $.post(api_url + 'api/control/rules', {
    "controllerId": controller,
    "status": rules
  });

  $.post(api_url + 'api/control/rule/length', {
    "controllerId": controller,
    "status": rules.length
  });
  //console.log(rules);
}

function delete_rule(type, block_num) {
  $("#rule" + type + '_block_' + block_num).remove();
}

function add_rule_block(block_num = 0) {
  //var block_num = block.toString();
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
    '<div class="btn-group" id="add_rule_block_' + block_num + '">' +
      '<button type="button" class="btn btn-success">新增規則</button>' +
      '<button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
        '<span class="caret"></span>' +
        '<span class="sr-only">Toggle Dropdown</span>' +
      '</button>' +
      '<button type="button" class="btn btn-danger" onclick="delete_rule_block(\'' + id_name + '\')" style="float:right">刪除區塊</button>' +
      '<ul class="dropdown-menu" role="menu">' +
        '<li><a href="#" onclick="add_rules(\'AIR_TEMPERATURE\', \'' + block_num + '\')">空氣溫度</a></li>' +
        '<li><a href="#" onclick="add_rules(\'AIR_HUMIDITY\', \'' + block_num + '\')">空氣濕度</a></li>' +
        '<li class="divider"></li>' +
        '<li><a href="#" onclick="add_rules(\'SOIL_TEMPERATURE\', \'' + block_num + '\')">土壤溫度</a></li>' +
        '<li><a href="#" onclick="add_rules(\'SOIL_HUMIDITY\', \'' + block_num + '\')">土壤濕度</a></li>' +
        '<li><a href="#" onclick="add_rules(\'SOIL_EC\', \'' + block_num + '\')">土壤電導度</a></li>' +
        '<li class="divider"></li>' +
        '<li><a href="#" onclick="add_rules(\'LIGHT_INTENSITY\', \'' + block_num + '\')">光照程度</a></li>' +
        '<li><a href="#" onclick="add_rules(\'CO2\', \'' + block_num + '\')">二氧化碳濃度</a></li>' +
      '</ul>' +
    '</div>' +
  '</div><br>' +
  '</div>');
  $('#temp_id').attr("id", id_name);
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
  if(clock_group.length != 0){
    clock_num = parseInt(clock_group[clock_group.length - 1].id.slice(6)) + 1;
  }

  $("#clock_group").append('<div id="clock_'+ clock_num +'">'+
    '<div class="col-sm-3">'+
      '選擇星期:&nbsp&nbsp'+
      '<select>'+
        '<option value="1">星期一</option>'+
        '<option value="2">星期二</option>'+
        '<option value="3">星期三</option>'+
        '<option value="4">星期四</option>'+
        '<option value="5">星期五</option>'+
        '<option value="6">星期六</option>'+
        '<option value="7">星期日</option>'+
      '</select>'+
    '</div>'+
    '<div class="col-sm-1">'+
      '開始於:'+
    '</div>'+
    '<div class="col-sm-3">'+
      '<div class="input-group date timepicker">'+
        '<input type="text" class="form-control" value="10:00 AM"/>'+
        '<span class="input-group-addon">'+
          '<span class="glyphicon glyphicon-time"></span>'+
        '</span>'+
      '</div>'+
    '</div>'+
    '<div class="col-sm-1"></div>'+
    '<div class="col-sm-3">'+
      '啟動時間:&nbsp&nbsp'+
      '<select>'+
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

  //表示是來自資料庫的鬧鐘設定
  if(clock_record != 0){
    var clock_group = $("#clock_"+clock_num).children();
    clock_group[0].children[0].value = clock_record.weekday;
    clock_group[2].children[0].children[0].value = clock_record.start;
    clock_group[4].children[0].value = clock_record.duration;
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
      "weekday": clock_items[0].children[0].value,
      "start": clock_items[2].children[0].children[0].value,
      "duration": clock_items[4].children[0].value
    };
    clocks.push(new_clock);
  }
  console.log(clocks);
  //將鬧鐘設定傳到資料庫
  $.post(api_url + 'api/control/clock_setting', {
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
  $.post(api_url + 'api/control/work_cycle', {
    "controllerId": getCookie("controller"),
    "status": document.getElementById("manual_items").children[0].value
  },function(){
    alert("手動啟動時間設定完成！");
  });
}
//------ 手動 ------

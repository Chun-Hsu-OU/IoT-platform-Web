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

function change_action() {
  var controller = getCookie("controller");

  $.post(api_url + 'api/control/follow_rule', {
    "controllerId": controller,
    "status": document.getElementById('update_control').value
  });

  $.post(api_url + 'api/control/work_cycle', {
    "controllerId": controller,
    "status": document.getElementById('turnOnfor').value
  });
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

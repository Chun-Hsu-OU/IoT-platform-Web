var uuid = getCookie("checker");
var areaId = getCookie("area");
var groupId = getCookie("group");
var sensorId = getCookie("sensor");

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

function set_area_cookie(Id) {
  document.cookie = 'area=' + Id;
}

function set_controller_cookie(Id) {
  document.cookie = 'controller=' + Id;
}

function load_sidebars() {
  $.get(api_url + 'api/area/' + uuid + '?token=' + token, function(data, status) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(area) {
      if (area.visible == 1) {
        $('#showPlace').append('<li id=' + area['name'] + '><a onclick="set_area_cookie(\'' + area.areaId + '\')" href="http://nthu-smart-farming.kits.tw:8080/area_page.html">' + area.name + '</a></li>');
        $('#showController').append('<li id=' + area['name'] + '><a onclick="set_area_cookie(\'' + area.areaId + '\')" href="http://nthu-smart-farming.kits.tw:8080/show_controllers.html">' + area.name + '</a></li>');
        $('#showAnalysis').append('<li id=' + area['name'] + '><a onclick="set_area_cookie(\'' + area.areaId + '\')" href="http://nthu-smart-farming.kits.tw:8080/select_type.html">' + area.name + '</a></li>');
      }
    });
  });
}

function add_area() {
  var new_area_name = document.getElementById("new_area_name").value;
  var new_area_location = document.getElementById("new_area_location").value;
  var city = document.getElementById("city").value;

  if (new_area_name) {
    if(city != "none"){
      var city_string = $("#city option:selected").text();
      new_area_location = city_string + new_area_location;
    }else{
      if(!new_area_location){
        new_area_location = "無";
      }
    }

    $.post(api_url + 'api/add/area/' + '?token=' + token, {
      "ownerId": uuid,
      "name": new_area_name,
      "city": city,
      "location": new_area_location
    },function(){
      alert("新增場域成功！");
      location.reload();
    });
  }else{
    alert("請確實填入必填欄位");
  }
}

function add_group() {
  var new_group_name = document.getElementById("new_group_name").value;
  var group_select_selectBox = document.getElementById("group_select");
  var group_select = group_select_selectBox.options[group_select_selectBox.selectedIndex].value;
  var macAddr = document.getElementById("macAddr").value;

  //檢查每個欄位都有值
  if(new_group_name && group_select!="NoSelection" && macAddr){
    $.post(api_url + 'api/add/sensorGroup' + '?token=' + token, {
      "areaId": getCookie("area"),
      "name": new_group_name,
      "macAddr": macAddr
    },function(){
      alert("感測器群組新增成功！");
      location.reload();
    });
  }else{
    alert("請確實填入所有欄位");
  }
}

function add_controller() {
  var new_controller_name = document.getElementById("new_controller_name").value;
  var controller_in_area = document.getElementById("controller_in_area").value;
  var protocol = document.getElementById("protocol").value;
  var setting = document.getElementById("protocol_setting").value;
  //檢查每個欄位都有值
  if(new_controller_name && controller_in_area!="NoSelection" && protocol!="NoSelection" && setting){
    $.post(api_url + 'api/add/control' + '?token=' + token, {
      "ownerId": getCookie("checker"),
      "areaId": controller_in_area,
      "name": new_controller_name,
      "protocol": protocol,
      "setting": setting
    });
    setTimeout(function(){
      alert("控制器 '"+ new_controller_name +"' 新增成功！");
      location.reload();
    },1000);
  }else{
    alert("請確實填入所有欄位");
  }
}

function del_from_db() {
  var area = getCookie("area");
  var group = getCookie("group");
  var sensor = getCookie("sensor");

  var area_del_selectBox = document.getElementById("area_del");
  var area_Id = area_del_selectBox.options[area_del_selectBox.selectedIndex].value;

  var group_del_selectBox = document.getElementById("group_del");
  var group_Id = group_del_selectBox.options[group_del_selectBox.selectedIndex].value;

  var sensor_del_selectBox = document.getElementById("sensor_del");
  var sensor_Id = sensor_del_selectBox.options[sensor_del_selectBox.selectedIndex].value;

  if (area_Id == 'NoSelection' || group_Id == 'NoSelection' || sensor_Id == 'NoSelection') {
    console.log('No selection made');
    alert("請確實填入所有選項");
  } else if (area == "blank") {
    console.log("error");
    alert("錯誤！\n請確實填入所有選項");
  } else if (group == "blank") {
    $.post(api_url + 'api/delete_item/area' + '?token=' + token, {
      "ownerId": uuid,
      "areaId": area
    }, function() {
      alert("刪除 場域 成功!");
      location.reload();
    });
  } else if (sensor == "blank") {
    $.post(api_url + 'api/delete_item/group' + '?token=' + token, {
      "areaId": area,
      "groupId": group
    }, function() {
      alert("刪除 感測器群組 成功!");
      location.reload();
    });
  } else {
    $.post(api_url + 'api/delete_item/sensor' + '?token=' + token, {
      "groupId": group,
      "sensorId": sensor
    }, function() {
      alert("刪除 感測器 成功!");
      location.reload();
    });
  }
}

function group_select_func() {
  var selectBox = document.getElementById("group_select");
  var Id = selectBox.options[selectBox.selectedIndex].value;
  set_area_cookie(Id);
  //console.log(getCookie("area"));
}

function area_del_func() {
  //console.log("in area_del_function");
  var selectBox = document.getElementById("area_del");
  var Id = selectBox.options[selectBox.selectedIndex].value;
  if (Id == "None") {
    document.cookie = "area=blank";
  } else {
    set_area_cookie(Id);
    load_group_in_modal();
  }
}

function group_del_func() {
  var selectBox = document.getElementById("group_del");
  var Id = selectBox.options[selectBox.selectedIndex].value;
  console.log(Id);
  if (Id == "None") {
    document.cookie = "group=blank";
  } else {
    document.cookie = "group=" + Id;
    //console.log("chosen group "+ Id);
    load_sensor_in_modal();
  }
}

function sensor_del_func() {
  var selectBox = document.getElementById("sensor_del");
  var Id = selectBox.options[selectBox.selectedIndex].value;
  if (Id == "None") {
    document.cookie = "sensor=blank";
  } else {
    document.cookie = "sensor=" + Id;
  }
}

function check_admin() {
  admin = getCookie("admin");
  if (admin == "aDmiN") {
    window.location.replace('http://nthu-smart-farming.kits.tw:8080/homepage_admin.html');
  } else {
    window.location.replace('http://nthu-smart-farming.kits.tw:8080/homepage.html');
  }
}

function initial_setting(){
  $.get(api_url + 'api/account/single/' + uuid + '?token=' + token, function(data) {
    document.getElementById("new_username").value = data.name;
    document.getElementById("new_password").value = "";
    document.getElementById("new_password_confirm").value = "";
  });
}

function settings() {
    var new_username = document.getElementById("new_username").value;
    var new_password = document.getElementById("new_password").value;
    var new_password_confirm = document.getElementById("new_password_confirm").value;
    //檢查所有欄位都有值
    if (new_username && new_password && new_password_confirm) {
      //檢查密碼和確認密碼是否一樣
      if(new_password == new_password_confirm){
        $.post(api_url + 'api/account/settings' + '?token=' + token, {
          "uuid": uuid,
          "name": new_username,
          "password": new_password
        },function(){
          alert("修改使用者資料完成！");
          location.reload();
        });
      }else{
        alert("確認密碼與密碼不相同，請重新輸入");
      }
    }else{
      alert("請確實填入所有欄位");
    }
}

function load_area_in_modal() {
  $('#area_del').empty();
  $('#group_select').empty();
  $('#controller_in_area').empty();
  $.get(api_url + 'api/area/' + uuid + '?token=' + token, function(data) {
    var body = JSON.parse(data);

    $('#area_del').append('<option selected value="NoSelection">---請選擇---</option>');
    $('#area_del').append('<option value="None">None</option>');

    $('#group_select').append('<option selected value="NoSelection">---請選擇---</option>');
    // $('#group_select').append('<option value="None">None</option>');

    $('#controller_in_area').append('<option selected value="NoSelection">---請選擇---</option>');
    body.Items.forEach(function make(area) {
      if (area.visible == 1) {
        $('#area_del').append('<option value="' + area.areaId + '">' + area.name + '</option>');
        $('#group_select').append('<option value="' + area.areaId + '">' + area.name + '</option>');
        $('#controller_in_area').append('<option value="' + area.areaId + '">' + area.name + '</option>');
      }
    });
  });
}

function load_group_in_modal() {
  $('#group_del').empty();
  var areaId = getCookie("area");
  $.get(api_url + 'api/sensorgroup_in_area/' + areaId + '?token=' + token, function(data) {
    var body = JSON.parse(data);

    $('#group_del').append('<option selected value="NoSelection">---請選擇---</option>');
    $('#group_del').append('<option value="None">None</option>');

    body.Items.forEach(function make(group) {
      if (group.visible == 1) {
        $('#group_del').append('<option value="' + group.groupId + '">' + group.name + '</option>');
      }
    });
  });
}

function load_sensor_in_modal() {
  $('#sensor_del').empty();
  var groupId = getCookie("group");
  $.get(api_url + 'api/sensors_in_group/' + groupId + '?token=' + token, function(data) {
    var body = JSON.parse(data);

    $('#sensor_del').append('<option selected value="NoSelection">---請選擇---</option>');
    $('#sensor_del').append('<option value="None">None</option>');
    body.Items.forEach(function make(sensor) {
      if (sensor.visible == 1) {
        $('#sensor_del').append('<option value="' + sensor.sensorId + '">' + sensor.name + '</option>');
      }
    });
  });
}

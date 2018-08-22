var api_url = 'http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/';

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
  $.get(api_url + 'api/area/' + uuid, function(data, status) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(area) {
      if (area.visible == 1) {
        $('#showPlace').append('<li id=' + area['name'] + '><a onclick="set_area_cookie(\'' + area.areaId + '\')" href="http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:8080/area_page.html">' + area.name + '</a></li>');
      }
    });
  });

  $.get(api_url + 'api/search/control/owner/' + uuid, function(data) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(controller) {
      $('#showController').append('<li ><a onclick="set_controller_cookie(\'' + controller.controllerId + '\')" href="http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:8080/logic_control.html">' + controller.name + '</a></li>');
    });
  });
}

function click_add_area_enable_map(){
  console.log(document.getElementById("enable_map").checked);
  if(document.getElementById("enable_map").checked){
    document.getElementById("new_area_longitude").disabled = true;
    document.getElementById("new_area_latitude").disabled = true;
  }else{
    document.getElementById("new_area_longitude").disabled = false;
    document.getElementById("new_area_latitude").disabled = false;
  }
}

function add_area() {
  var new_area_name = document.getElementById("new_area_name").value;
  var new_area_location = document.getElementById("new_area_location").value;

  if (new_area_name && new_area_location) {
    if(document.getElementById("new_area_longitude").disabled && document.getElementById("new_area_latitude").disabled){
      var new_area_longitude = "None";
      var new_area_latitude = "None";
    }else{
      var new_area_longitude = document.getElementById("new_area_longitude").value;
      var new_area_latitude = document.getElementById("new_area_latitude").value;
      if(new_area_longitude == "" || new_area_latitude == ""){
        alert("請確實填入所有欄位");
        return;
      }
    }
    console.log("add area");
    $.post(api_url + 'api/add/area/', {
      "ownerId": uuid,
      "name": new_area_name,
      "location": new_area_location,
      "longitude": new_area_longitude,
      "latitude": new_area_latitude
    },function(){
      alert("新增場域成功！");
      location.reload();
    });
  }else{
    alert("請確實填入所有欄位");
  }
}

function add_group() {
  var new_group_name = document.getElementById("new_group_name").value;
  var new_group_description = document.getElementById("new_group_description").value;
  var new_group_product_selectBox = document.getElementById("new_group_product");
  var new_group_product = new_group_product_selectBox.options[new_group_product_selectBox.selectedIndex].value;
  var group_select_selectBox = document.getElementById("group_select");
  var group_select = group_select_selectBox.options[group_select_selectBox.selectedIndex].value;

  //檢查每個欄位都有值
  if(new_group_name && new_group_description && new_group_product!="NoSelection" && group_select!="NoSelection"){
    $.post(api_url + 'api/add/sensorGroup', {
      "areaId": getCookie("area"),
      "name": new_group_name,
      "description": new_group_description,
      "product": new_group_product
    },function(){
      alert("感測器群組新增成功！");
      location.reload();
    });
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
    $.post(api_url + 'api/delete_item/area', {
      "ownerId": uuid,
      "areaId": area
    }, function() {
      alert("刪除 場域 成功!");
      location.reload();
    });
  } else if (sensor == "blank") {
    $.post(api_url + 'api/delete_item/group', {
      "areaId": area,
      "groupId": group
    }, function() {
      alert("刪除 感測器群組 成功!");
      location.reload();
    });
  } else {
    $.post(api_url + 'api/delete_item/sensor', {
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
    window.location.replace('http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:8080/homepage_admin.html');
  } else {
    window.location.replace('http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:8080/homepage.html');
  }
}

function initial_setting(){
  $.get(api_url + 'api/account/single/' + uuid, function(data) {
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
        $.post(api_url + 'api/account/settings', {
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
  $.get(api_url + 'api/area/' + uuid, function(data) {
    var body = JSON.parse(data);

    $('#area_del').append('<option selected value="NoSelection">---請選擇---</option>');
    $('#area_del').append('<option value="None">None</option>');

    $('#group_select').append('<option selected value="NoSelection">---請選擇---</option>');
    // $('#group_select').append('<option value="None">None</option>');
    body.Items.forEach(function make(area) {
      if (area.visible == 1) {
        $('#area_del').append('<option value="' + area.areaId + '">' + area.name + '</option>');
        $('#group_select').append('<option value="' + area.areaId + '">' + area.name + '</option>');
      }
    });
  });
}

function load_group_in_modal() {
  $('#group_del').empty();
  //console.log(areaId);
  var areaId = getCookie("area");
  console.log(api_url + 'api/sensorgroup_in_area/' + areaId);
  $.get(api_url + 'api/sensorgroup_in_area/' + areaId, function(data) {
    var body = JSON.parse(data);
    //console.log(body);

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
  $.get(api_url + 'api/sensors_in_group/' + groupId, function(data) {
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

function update_sensor_item() {
  var update_name = document.getElementById("update_sensorname").value;
  var update_type = document.getElementById("update_sensorType").value;

  $.post(api_url + 'api/update/sensor', {
    "groupId": getCookie("group"),
    "sensorId": getCookie("sensor"),
    "name": update_name,
    "sensorType": update_type
  }, function() {
    window.location.replace('sensorhub.html');
  });
}

function update_sensorgroup_item() {
  var update_name = document.getElementById("update_sensorgroup_name").value;
  var update_description = document.getElementById("update_sensorgroup_description").value;
  var update_product = document.getElementById("update_product").value;

  $.post(api_url + 'api/update/group', {
    "groupId": getCookie("group"),
    "areaId": getCookie("area"),
    "name": update_name,
    "description": update_description,
    "product": update_product
  }, function() {
    window.location.replace('homepage.html');
  });
}

function update_area_item() {
  var update_name = document.getElementById("update_area_name").value;
  var update_location = document.getElementById("update_area_location").value;
  var update_longitude = document.getElementById("update_longitude").value;
  var update_latitude = document.getElementById("update_latitude").value;

  $.post(api_url + 'api/update/area', {
    "ownerId": getCookie("checker"),
    "areaId": getCookie("area"),
    "name": update_name,
    "location": update_location,
    "longitude": update_longitude,
    "latitude": update_latitude
  }, function() {
    window.location.replace('area_page.html');
  });
}

function add_sensor_item() {
  var add_name = document.getElementById("add_sensorname").value;
  var add_type = document.getElementById("add_sensorType").value;
  var add_number = document.getElementById("add_number").value;
  var add_macAddr = document.getElementById("add_macAddr").value;
  
  $.post(api_url + 'api/add/sensor', {
      "groupId": getCookie("group"),
      "name": add_name,
      "macAddr": add_macAddr,
      "sensorType": add_type,
      "num": add_number,
      "ownerId": getCookie("checker")
  }, function() {
    alert("新增感測器 '" + add_name + "'成功！");
    window.location.replace('sensorhub.html');
  });
}

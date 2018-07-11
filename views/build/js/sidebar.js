var uuid = getCookie("checker");
var areaId = getCookie("area");
var groupId = getCookie("group");
var sensorId = getCookie("sensor");

var api_url = 'http://ec2-13-125-205-170.ap-northeast-2.compute.amazonaws.com:3000/';
//var api_url = 'http://localhost:3000/'

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
        $('#showPlace').append('<li id=' + area['name'] + '><a onclick="set_area_cookie(\'' + area.areaId + '\')" href="area_page.html">' + area.name + '</a></li>');
      }
    });
  });

  $.get(api_url + 'api/search/control/owner/' + uuid, function(data) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(controller) {
      $('#showController').append('<li ><a onclick="set_controller_cookie(\'' + controller.controllerId + '\')" href="logic_control.html">' + controller.name + '</a></li>');
    });
  });
}

function add_area() {
  var new_area_name = document.getElementById("new_area_name").value;
  var new_area_location = document.getElementById("new_area_location").value;
  var new_area_map = document.getElementById("new_area_map").value;

  if (new_area_name != null && new_area_location != null && new_area_map != null) {
    $.post(api_url + 'api/add/area/', {
      "ownerId": uuid,
      "name": new_area_name,
      "location": new_area_location,
      "map_location": new_area_map
    });
  }
}

function add_group() {
  var new_group_name = document.getElementById("new_group_name").value;
  var new_group_description = document.getElementById("new_group_description").value;
  var new_group_product = document.getElementById("new_group_product").value;

  $.post(api_url + 'api/add/sensorGroup', {
    "areaId": getCookie("area"),
    "name": new_group_name,
    "description": new_group_description,
    "product": new_group_product
  });
}

function del_from_db() {
  var area = checkCookie("area");
  var group = checkCookie("group");
  var sensor = checkCookie("sensor");

  if (area == "blank") {
    console.log("error");
  } else if (group == "blank") {
    $.post(api_url + 'api/delete_item/area', {
      "ownerId": uuid,
      "areaId": area
    });
  } else if (sensor == "blank") {
    $.post(api_url + 'api/delete_item/group', {
      "areaId": area,
      "groupId": group
    });
  } else {
    $.post(api_url + 'api/delete_item/sensor', {
      "groupId": group,
      "sensorId": sensor
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
    window.location.replace('homepage_admin.html');
  } else {
    window.location.replace('homepage.html');
  }
}

function settings() {
  $.get(api_url + 'api/account/single/' + uuid, function(data) {
    //console.log("Data = " + data);
    var new_username = data.name;
    var new_password = data.password;

    if (document.getElementById("new_username").value) {
      new_username = document.getElementById("new_username").value;
    }
    if (document.getElementById("new_password_confirm").value) {
      new_password = document.getElementById("new_password_confirm").value;
    }

    $.post(api_url + 'api/account/settings', {
      "uuid": uuid,
      "name": new_username,
      "password": new_password
    });
  });
}

function load_area_in_modal() {
  $('#area_del').empty();
  $('#group_select').empty();
  $.get(api_url + 'api/area/' + uuid, function(data) {
    var body = JSON.parse(data);

    $('#area_del').append('<option value="None">None</option>');
    $('#group_select').append('<option value="None">None</option>');
    body.Items.forEach(function make(area) {
      $('#area_del').append('<option value="' + area.areaId + '">' + area.name + '</option>');
      $('#group_select').append('<option value="' + area.areaId + '">' + area.name + '</option>');
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

    $('#group_del').append('<option value="None">None</option>');
    body.Items.forEach(function make(group) {
      $('#group_del').append('<option value="' + group.groupId + '">' + group.name + '</option>');
    });
  });
}

function load_sensor_in_modal() {
  $('#sensor_del').empty();
  var groupId = getCookie("group");
  console.log("group is " + groupId);
  console.log(api_url + 'api/sensors_in_group/' + groupId);
  $.get(api_url + 'api/sensors_in_group/' + groupId, function(data) {
    var body = JSON.parse(data);

    $('#sensor_del').append('<option value="None">None</option>');
    body.Items.forEach(function make(sensor) {
      $('#sensor_del').append('<option value="' + sensor.sensorId + '">' + sensor.name + '</option>');
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

  $.post(api_url + 'api/update/group', {
    "ownerId": getCookie("checker"),
    "areaId": getCookie("area"),
    "name": update_name,
    "location": update_location
  }, function() {
    window.location.replace('homepage.html');
  });
}

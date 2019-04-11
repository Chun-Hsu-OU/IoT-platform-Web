var uuid = getCookie("checker");
var area_id = getCookie("area");

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
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

function get_name() {
  // console.log(typeof area_id);
  $.get(api_url + 'api/area/' + uuid + '?token=' + token, function (data, status) {
    var body = JSON.parse(data);
    body.Items.forEach(function make(area){
      if(area.areaId == area_id){
        $('#page_title').prepend('<h1>' + area['name'] + '<a href="#" data-toggle="modal" data-target="#set_area_modal"><span style="font-size:0.5em; color:#A9A9A9">   編輯</span></a></h1>');
      }
    });
  });
}

function get_sensorhubs(){
  // console.log("I'll get all sensorhubs in an area");
  $.get(api_url + 'api/sensorgroup_in_area/' + area_id + '?token=' + token, function (data, status) {
    var body = JSON.parse(data);
    body.Items.forEach(function make(sensorgroup){
      if(sensorgroup.visible == 1){
        $('#sensorhubs').append('<div class="animated flipInY col-sm-6 col-xs-12" id="' + sensorgroup.groupId + '_A"></div>');
        //console.log('<div class="animated flipInY col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + sensorgroup.groupId + '_A"></div>');
        $('#' + sensorgroup.groupId + '_A').append('<div class="tile-stats" id="' + sensorgroup.groupId + '_B"></div>');
        $('#' + sensorgroup.groupId + '_B').append('<a href="#" data-toggle="modal" data-target="#set_sensorgroup_modal" onclick="set_g_cookie(\''+ sensorgroup.groupId +'\');change_update_group_modal(\''+ sensorgroup.groupId +'\')">'+
        '<img class="edit" src="images/edit.png">'+
        '</a>');
        // $('#B').append('<div class="count"></div>');
        $('#' + sensorgroup.groupId + '_B').append('<br>');
        $('#' + sensorgroup.groupId + '_B').append('<a onclick="set_g_cookie(\''+
        sensorgroup.groupId+'\');set_macAddr_cookie(\'' +  sensorgroup.macAddr + 
        '\')" href="sensorhub.html"><span class="font_style">' + sensorgroup.name + '</span></a>');
        
        $('#' + sensorgroup.groupId + '_B').append('<p>查看詳細數據</p>');
        $('#' + sensorgroup.groupId + '_B').append('<br>');
      }
    });
  });
}

function change_update_group_modal(id){
  $.get(api_url + 'api/sensorgroup_in_area/' + getCookie("area") + '?token=' + token, function(data) {
    var body = JSON.parse(data);
    for (group_num = 0; group_num < body.Count; group_num++) {
      if (body.Items[group_num].groupId == id) {
        document.getElementById('update_sensorgroup_name').value = body.Items[group_num].name;
        document.getElementById('update_macAddr').value = body.Items[group_num].macAddr;
      }
    }
  });
}

function update_sensorgroup_item() {
  var update_name = document.getElementById("update_sensorgroup_name").value;
  var update_macAddr = document.getElementById("update_macAddr").value;

  $.post(api_url + 'api/update/group' + '?token=' + token, {
    "groupId": getCookie("group"),
    "areaId": getCookie("area"),
    "name": update_name,
    "macAddr": update_macAddr
  }, function() {
    window.location.replace('area_page.html');
  });

  //如果macAddr有改過，sensorhub下面所有sensor的macAddr都要改
  if($("#mac_has_change").val() == "1"){

    $.get(api_url + 'api/sensors_in_group/' + getCookie("group") + '?token=' + token, function(data) {
    
      var body = JSON.parse(data);
      for (group_num = 0; group_num < body.Count; group_num++) {
        $.post(api_url + 'api/update/sensor/macAddr' + '?token=' + token, {
          "groupId": getCookie("group"),
          "sensorId": body.Items[group_num].sensorId,
          "macAddr": $("#update_macAddr").val()
        }, function() {

        });
      }
      
    });
  }
  
}

function update_area_item() {
  var update_name = document.getElementById("update_area_name").value;
  var update_location = document.getElementById("update_area_location").value;

  $.post(api_url + 'api/update/area' + '?token=' + token, {
    "ownerId": getCookie("checker"),
    "areaId": getCookie("area"),
    "name": update_name,
    "location": update_location
  }, function() {
    window.location.replace('area_page.html');
  });
}

function set_g_cookie(Id){
  document.cookie = "group=" + Id;
}

function set_macAddr_cookie(Id){
  document.cookie = "macAddr=" + Id;
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 23.5974163, lng: 119.8960478}
  });
  var geocoder = new google.maps.Geocoder();
  var infowindow = new google.maps.InfoWindow;

  geocodeAddress(geocoder, map, infowindow);
}

function geocodeAddress(geocoder, resultsMap, infowindow) {
  $.get(api_url + 'api/area/' + uuid + '?token=' + token, function (data, status) {
    var body = JSON.parse(data);
    body.Items.forEach(function make(area){
      if(area.areaId == area_id){
        console.log(area.location);
        if(area.location != "無"){
          geocoder.geocode({'address': area.location}, function(results, status) {
            if (status === 'OK') {
              resultsMap.setCenter(results[0].geometry.location);
              var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
              });
              infowindow.setContent(results[0].formatted_address);
              infowindow.open(resultsMap, marker);
            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
          });
        }else{
          $("#map").hide();
        }
      }
    });
  });
}
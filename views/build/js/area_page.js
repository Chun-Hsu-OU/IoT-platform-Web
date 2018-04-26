var uuid = getCookie("checker");
var area_id = getCookie("area");
var api_url = 'http://ec2-13-125-205-170.ap-northeast-2.compute.amazonaws.com:3000/';

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
  //console.log(typeof area_id);
  $.get(api_url + 'api/area/' + uuid, function (data, status) {
    var body = JSON.parse(data);
    body.Items.forEach(function make(area){
      if(area.areaId == area_id){
        $('#page_title').append('<h3>' + area['name'] + '</h3>');
      }
    });
  });
}

function get_sensorhubs(){
  console.log("I'll get all sensorhubs in an area");
  $.get(api_url + 'api/sensorgroup_in_area/' + area_id, function (data, status) {
    var body = JSON.parse(data);
    body.Items.forEach(function make(sensorgroup){
      if(sensorgroup.visible == 1){
        $('#sensorhubs').append('<div class="animated flipInY col-lg-6 col-md-6 col-sm-12 col-xs-12" id="A"></div>');
        $('#A').append('<div class="tile-stats" id="B"></div>');
        $('#B').append('<div class="icon"><i class="fa fa-tasks"></i></div>');
        //$('#B').append('<div class="count"></div>');
        $('#B').append('<br>');
        $('#B').append('<a onclick="set_g_cookie(\''+sensorgroup.groupId+'\')" href="sensorhub.html"><h3>' + sensorgroup.name + '</h3></a>');
        $('#B').append('<p>查看詳細數據</p>');
        $('#B').append('<br>');
      }
    });
  });
}

function set_g_cookie(Id){
  document.cookie = "group=" + Id;
}

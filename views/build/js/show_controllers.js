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
        $('#page_title').prepend('<h1>' + area['name'] + '</h1>');
      }
    });
  });
}

function get_controllers(){
  // console.log("I'll get all sensorhubs in an area");
  $.get(api_url + 'api/search/control/area/' + area_id + '?token=' + token, function (data, status) {
    var body = JSON.parse(data);
    body.Items.forEach(function make(controller){
      if(controller.visible == 1){
        $('#controllers').append('<div class="animated flipInY col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + controller.controllerId + '_A"></div>');
        //console.log('<div class="animated flipInY col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + sensorgroup.groupId + '_A"></div>');
        $('#' + controller.controllerId + '_A').append('<div class="tile-stats" id="' + controller.controllerId + '_B"></div>');
        $('#' + controller.controllerId + '_B').append('<div class="icon"><a href="#" class="btn btn-danger" onClick="return check(\'' + controller.controllerId + '\');"><span class="glyphicon glyphicon-remove"></span>刪除</a></div>');
        // $('#B').append('<div class="count"></div>');
        $('#' + controller.controllerId + '_B').append('<br>');
        $('#' + controller.controllerId + '_B').append('<a onclick="set_controller_cookie(\''+controller.controllerId+'\')" href="logic_control.html"><span style="font-size: 25px;margin-left: 10px">' + controller.name + '</span></a>');
        $('#' + controller.controllerId + '_B').append('<br>');
      }
    });
  });
}



function set_controller_cookie(Id){
    document.cookie = "controller=" + Id;
}

function check(id){
  if (!confirm("確定要刪除此控制器?"))
  return false;

  $.post(api_url + 'api/delete_item/control' + '?token=' + token, {
    "controllerId": id
  }, function(){
      alert("已刪除控制器！");
      location.reload();
  });
}
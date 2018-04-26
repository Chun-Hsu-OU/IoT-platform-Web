var uuid = getCookie("checker");
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


function make_area(){
  $.get(api_url + 'api/area/' + uuid, function (data, status) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(area){
      console.log(area['name']);
      if(area.visible == 1){
        console.log('<li id=\'' + area['name'] + '\'><a onclick="set_cookie(\''+area.areaId+'\')">' + area.name + '</a></li>');
        $('#showPlace').append('<li id=' + area['name'] + '><a onclick="set_area_cookie(\''+area.areaId+'\')" href="area_page.html">' + area.name + '</a></li>');
      }
    });
  });
}

function set_area_cookie(Id) {
  document.cookie = "area=" + Id;
}

function add_area() {
  var new_area = document.getElementById("area_name").value;

  if(document.getElementById("area_name").value != null) {
    $.post(api_url + 'api/add/area/',
    {
      "ownerId": uuid,
      "name": new_area
    });
  }
}

function add_group() {
  var new_group = document.getElementById("group_name").value;

  if(document.getElementById("group_name").value != null) {
    $.post(api_url + 'api/add/sensorGroup',
    {
      "areaId": getCookie("area"),
      "name": new_group
    });
  }
}

function load_area_in_modal() {
  $.get(api_url + 'api/area/' + uuid, function (data) {
    var body = JSON.parse(data);

    body.Items.forEach(function make(area){
      $('#group_select').append('<option value="\''+area.areaId+'\'">' + area.name + '</option>');
    });
  });
}

function group_select_func() {
  var selectBox = document.getElementById("group_select");
  var Id = selectBox.options[selectBox.selectedIndex].value;
  set_area_cookie(Id);
  //console.log(getCookie("area"));
}

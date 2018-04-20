var uuid = getCookie("checker");
var api_url = 'http://localhost:3000/';

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

function set_area_cookie(Id){
  document.cookie = "area=" + Id;
}

function add_area(){
  var new_area = document.getElementById("area_name").value;

  $.post(api_url + 'api/add/area/',
  {
    "ownerId": uuid,
    "name": new_area
  });
}

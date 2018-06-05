// Loads user name
var uuid = getCookie("checker");
var api_url = 'http://ec2-13-125-205-170.ap-northeast-2.compute.amazonaws.com:3000/';
//var api_url = 'http://localhost:3000/'
var area = getCookie("area");
var sensorhub = getCookie("group");

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
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

function get_username() {
  $.get(api_url + 'api/account/single/' + uuid, function(data) {
    //console.log(data);
    //var body = JSON.parse(data);
    document.getElementById("username").innerHTML = data.name;
  });

  $.get(api_url + 'api/sensorgroup_in_area/' + area, function(data) {
    var body = JSON.parse(data);
    body.Items.forEach(function (hub) {
      if (hub.groupId == sensorhub){
        //document.getElementById("sensorhub_page_title").innerHTML = hub.name;
        $( "#sensorhub_page_title" ).append('<h1>' + hub.name + '</h1>');
        $( "#sensorhub_description" ).append('<h2>' + hub.description + '</h2>');
      }
    });
  });
}

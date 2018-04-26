// Loads user name
var uuid = getCookie("checker");
var api_url = 'http://localhost:3000/';

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
  $.get(api_url + 'api/account/' + uuid, function(data) {
    console.log(data);
    document.getElementById("username").innerHTML = data;
  });
}

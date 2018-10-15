var api_url = 'http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/';
// Loads user name
var uuid = getCookie("checker");

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
}

//日誌下拉式選單抓使用者有哪些場域
function get_area_name(){
    $.get(api_url + 'api/area/' + uuid, function(data) {
        //console.log(data);
        var body = JSON.parse(data);
        for(let i=0; i<body.Items.length; i++){
            $("#select_area").append('<option value="' + body.Items[i].name + '">' + body.Items[i].name + '</option>');
        }
    });
}

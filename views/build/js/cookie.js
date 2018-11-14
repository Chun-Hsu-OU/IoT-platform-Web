function del() {
    document.cookie = "checker=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "area=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "group=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "sensor=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "cookies=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "controller=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "macAddr=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "sensorType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "groups=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "groups_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
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

function checkCookie() {
    user = getCookie("checker");
    if (user == "") {
        //console.log("has no cookie");
        alert("Please login first");
        window.location.href = 'login.html';
        //fs.readFile('login');
    } else {
        //console.log("has cookie");
    }
}

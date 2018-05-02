api_url = 'http://localhost:3000/'

function get_users(){
  $.get(api_url + 'api/account/all', function(data) {
    var body = JSON.parse(data);
    console.log("data = " + data);
    body.Items.forEach(function make(users){
      if(users.visible == 1){
        console.log(users);
        $('#admin_page').append('<div class="animated flipInY col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + users.uuid + '_A"></div>');
        console.log('<div class="animated flipInY col-lg-6 col-md-6 col-sm-12 col-xs-12" id="' + users.uuid + '_A"></div>');
        $('#' + users.uuid + '_A').append('<div class="tile-stats" id="' + users.uuid + '_B"></div>');
        $('#' + users.uuid + '_B').append('<div class="icon"><i class="fa fa-tasks"></i></div>');
        // $('#B').append('<div class="count"></div>');
        $('#' + users.uuid + '_B').append('<br>');
        $('#' + users.uuid + '_B').append('<a onclick="set_user_cookie(\''+users.uuid+'\')" href="homepage.html"><h3>' + users.name + '</h3></a>');
        $('#' + users.uuid + '_B').append('<p>查看詳細數據</p>');
        $('#' + users.uuid + '_B').append('<br>');
      }
    });
  });
}

function set_user_cookie(Id) {
  document.cookie = "checker=" + Id;
}

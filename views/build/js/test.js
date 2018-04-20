//set the default value
var txtId = 1;

//add input block in showBlock
/* $("#new_place").click(function () {
	console.log("12345")
	var first = document.getElementById("first").value;
	var second = document.getElementById("second").value;
    $("#showPlace").append('<li><a>' + first + '<span class="fa fa-chevron-down"></span></a></li>');
    //txtId++;
}); */

function myFunction() {
  var first = document.getElementById("first").value;
  var lastname = document.getElementById("lastname").value;
  $("#showPlace").append('<li id=' + txtId + '><a>' + first + '<span class="fa fa-chevron-down"></span></a></li>');
  $("#1").append('<ul class="nav child_menu"><li><a href="spinach.html">' + lastname + '</a></li></ul>');
  txtId++;
}

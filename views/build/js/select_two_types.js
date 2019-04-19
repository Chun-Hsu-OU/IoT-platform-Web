
$(document).ready(function() {
var count = 0;

$("input[name='type']").change(function () {
    if($(this).prop("checked")){
        count++;
        if(count == 2){
            $("input[name='type']").each(function(){
                if(!$(this).prop("checked")){
                    $(this).attr("disabled", true);
                }
            });
        }
    }else{
        count--;
        if(count < 2){
            $("input[name='type']").each(function(){
                if(!$(this).prop("checked")){
                    $(this).attr("disabled", false);
                }
            });
        }
    }
});

});


function submit(){
    var types = [];
    $("input[name='type']").each(function(){
        if($(this).prop("checked")){
            types.push($(this).attr('id'));
        }
    });

    if(types.length == 2){
        var types_json = JSON.stringify(types);
        set_sensortype_cookie(types_json);
        window.location.href = "select_two_type_sensorhubs.html";
    }else{
        alert("請選擇兩個感測器種類");
    }
}

function set_sensortype_cookie(type){
    document.cookie = "sensorType=" + type;
}
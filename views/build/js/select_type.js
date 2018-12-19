function select_all(){
    if($("#all").prop("checked")){
        $("input[name='type']").each(function(){
            $(this).prop("checked",true);
        });
    }else{
        $("input[name='type']").each(function(){
            $(this).prop("checked",false);
        });
    }
}

function submit(){
    var types = [];
    $("input[name='type']").each(function(){
        if($(this).prop("checked")){
            types.push($(this).attr('id'));
        }
    });

    if(types.length > 0){
        var types_json = JSON.stringify(types);
        set_sensortype_cookie(types_json);
        window.location.href = "select_sensorhubs.html";
    }else{
        alert("請選擇一個以上的感測器種類");
    }
}

function set_sensortype_cookie(type){
    document.cookie = "sensorType=" + type;
}
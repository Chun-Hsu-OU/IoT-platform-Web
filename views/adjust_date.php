<?php
    function view_log($url){
        $ch			= curl_init();
        $options    = array(
                                CURLOPT_URL				=>    $url,
                                // CURLOPT_HEADER			=>    false,
                                CURLOPT_RETURNTRANSFER  =>    true,
                                CURLOPT_CUSTOMREQUEST   =>    "GET", //啟用GET
                                CURLOPT_HTTPHEADER      =>    array('Content-Type: application/json'),
                            );
        
        curl_setopt_array($ch,$options) ; //把陣列放入設定
        $result = curl_exec($ch); //開始執行
        curl_close($ch);
        return $result;
    }

    $ownerId = $_POST["ownerId"];
    $year = $_POST["year"];
    $month = str_pad($_POST["month"],2,'0',STR_PAD_LEFT);
    
    $str = view_log("http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/api/search/log/ownerId/$ownerId");
    $str = json_decode($str);

    $data = [];
    for($i=0;$i<count($str->Items);$i++){
        $y = substr(date("Y/m/d H:i:s",$str->Items[$i]->set_time), 0, 4);
        $m = substr(date("Y/m/d H:i:s",$str->Items[$i]->set_time), 5, 2);
        if($str->Items[$i]->visible==1 && $m==$month && $y==$year){
            array_push($data, $str->Items[$i]);
        }
    }
    echo json_encode($data);
?>
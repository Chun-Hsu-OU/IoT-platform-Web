<?php
    $public = include('config.php');

    function delete_log($url,$postdataarray){
        $ch			= curl_init();
        $options    = array(
                                CURLOPT_URL				=>    $url,
                                // CURLOPT_HEADER			=>    false,
                                CURLOPT_RETURNTRANSFER  =>    true,
                                CURLOPT_CUSTOMREQUEST   =>    "POST", //啟用post
                                CURLOPT_HTTPHEADER      =>    array('Content-Type: application/json',
                                                                    'token: '.$_COOKIE['token']
                                                                ),
                                CURLOPT_POSTFIELDS		=>    $postdataarray
                            );
        
        curl_setopt_array($ch,$options) ; //把陣列放入設定
        $result = curl_exec($ch); //開始執行
        curl_close($ch);
        return $result;
    }

    $data = array(
        "timestamp" => (int)$_GET["timestamp"],
        "ownerId" => $_GET["ownerId"]
    );

    $data = json_encode($data);
                    
    delete_log($public['api_url']."api/delete_item/log",$data);

    echo "<script>
            alert('刪除日誌成功！');
          </script>";
    //跳回 <日誌列表>
    $url = "log_list.php?checker=".$_GET["ownerId"];
    echo "<script type='text/javascript'>";
    echo "window.location.href='$url'";
    echo "</script>";
?>
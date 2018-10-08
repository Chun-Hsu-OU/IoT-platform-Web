<?php
    //設定時區
    date_default_timezone_set('Asia/Taipei');
    require_once('PHPMailer-master/PHPMailer-master/PHPMailerAutoload.php');
    function insert_log($url,$postdataarray){
        $ch			= curl_init();
        $options    = array(
                                CURLOPT_URL				=>    $url,
                                // CURLOPT_HEADER			=>    false,
                                CURLOPT_RETURNTRANSFER  =>    true,
                                CURLOPT_CUSTOMREQUEST   =>    "POST", //啟用post
                                CURLOPT_HTTPHEADER      =>    array('Content-Type: application/json'),
                                CURLOPT_POSTFIELDS		=>    $postdataarray
                            );
        
        curl_setopt_array($ch,$options) ; //把陣列放入設定
        $result = curl_exec($ch); //開始執行
        curl_close($ch);
        return $result;
    }

    function file_upload($url,$file_name,$file_path,$file_route){
        $ch			= curl_init();
        $cfile = new CURLFile($file_path,'image/jpeg',$file_name);
        $data = array(
            'element1' => $file_route,
            'element2' => $cfile
        );
        $options    = array(
                                CURLOPT_URL				=>    $url,
                                // CURLOPT_HEADER			=>    false,
                                CURLOPT_RETURNTRANSFER  =>    true,
                                CURLOPT_CUSTOMREQUEST   =>    "POST", //啟用post
                                // CURLOPT_HTTPHEADER      =>    array('Content-Type: application/json'),
                                CURLOPT_POSTFIELDS		=>    $data
                            );
        
        curl_setopt_array($ch,$options) ; //把陣列放入設定
        $result = curl_exec($ch); //開始執行
        curl_close($ch);
        return $result;
    }

    function sendLineNotify($initData, $token,$url = 'https://notify-api.line.me/api/notify') {
        $ch = curl_init();
        $header[] = 'Authorization: Bearer';
        $header[] = $token;
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url,
            CURLOPT_POST => TRUE,
            CURLOPT_RETURNTRANSFER => TRUE,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_HTTPHEADER => array(implode(' ',$header)),
            CURLOPT_POSTFIELDS => http_build_query($initData)
        ));
        $result = curl_exec($ch);
        curl_close($ch);
        $aResult = json_decode ($result, TRUE);
        return $aResult;
    }
    
    /*    新增日誌    */
    if(!empty($_POST)){
        //轉成unix time
        $set_time = strtotime($_POST["set_time"]);
        //新增日誌給files欄位的資料
        $file_list = array();
        
        //將照片檔名串接
        $ImageCount = count($_FILES['image']['name']);
        // echo $ImageCount."<br>";
        //確定有檔案上傳
        if($ImageCount>=1 && $_FILES['image']['name'][0]!=null){
            for($i=0;$i<$ImageCount;$i++){
                array_push($file_list,$_FILES['image']['name'][$i]);
                // echo $_FILES['image']['name'][$i]."<br>";
            }
        }
        //將影片檔名串接
        $videoCount = count($_FILES['video']['name']);
        //確定有檔案上傳
        if($videoCount>=1 && $_FILES['video']['name'][0]!=null){
            for($i=0;$i<$videoCount;$i++){
                array_push($file_list,$_FILES['video']['name'][$i]);
                // echo $_FILES['video']['name'][$i]."<br>";
            }
        }

        //偵測為開啟通知，則發送email
        if($_POST["notify"] == 1){
            /* 送出Line通知 */
            $initData['message'] = "\n場域：{$_POST["area"]}\n\n作物：{$_POST["crop"]}\n\n病情描述：{$_POST["description"]}";
            // $initData['imageThumbnail'] = $_FILES['image']['tmp_name'][0];
            // $initData['imageFullsize'] = $_FILES['image']['tmp_name'][0];
            // $initData['stickerPackageId'] = '2';
            // $initData['stickerId'] = '174'; 
            $token = '34eNzoKHyzvHW5KXGil50FSI8I6iM7Ik3QAGZCnXlWO';
            sendLineNotify($initData, $token);

            /* 寄出email */
            $C_email=$_POST["email"];
            $mail= new PHPMailer();                          //建立新物件
            $mail->IsSMTP();                                    //設定使用SMTP方式寄信
            $mail->SMTPAuth = true;                        //設定SMTP需要驗證
            $mail->SMTPSecure = "ssl";                    // Gmail的SMTP主機需要使用SSL連線
            // $mail->SMTPDebug = 2;          
            $mail->Host = "smtp.gmail.com";             //Gamil的SMTP主機
            $mail->Port = 465;                                 //Gamil的SMTP主機的埠號(Gmail為465)。
            $mail->CharSet = "utf-8";                       //郵件編碼
            $mail->Username = "hsnl33564@gmail.com"; //Gamil帳號
            $mail->Password = "Hsnl-iot33564";                 //Gmail密碼
            $mail->From = "hsnl33564@gmail.com";        //寄件者信箱
            $mail->FromName = "清華大學智慧農業物聯網平台"; //寄件者姓名
            $mail->Subject ="未知病蟲害即時通報"; //郵件標題
            $mail->Body = "<b style='color:blue'>場域：</b><br>".$_POST["area"]."<br><br><b style='color:blue'>作物：</b><br>".$_POST["crop"]."<br><br><b style='color:blue'>病情描述：</b><br>".$_POST["description"]; //郵件內容
            $mail->IsHTML(true);                             //郵件內容為html
            $mail->AddAddress($C_email);            //收件者郵件及名稱
            if(!$mail->Send()){
                echo "Error: " . $mail->ErrorInfo;
                echo "Message was not sent<br/ >";
            }else{
                echo "<script>
                    alert('未知病蟲害通報已送出!');
                </script>";
            }
        }
        
        // echo $set_time."<br>";
        // print_r($file_list);

        $data = array(
            "area" => $_POST["area"],
            "memo" => $_POST["memo"],
            "ownerId" => $_POST["ownerId"],
            "set_time" => $set_time,
            "type" => $_POST["type"],
            "author" => $_POST["author"],
            "crop" => $_POST["crop"],
            "machine" => $_POST["tool"],
            "diseases" => $_POST["disease"],
            "files" => $file_list
        );
        $data = json_encode($data);
                        
        $str_insert_log = insert_log("http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/api/add/log",$data);
        $str_insert_log = explode(" ",$str_insert_log);
        //最後一個元素是timestamp
        $timestamp = $str_insert_log[count($str_insert_log)-1];


        /*    上傳檔案    */
        //串接file_route(給aws s3 API 使用)
        $file_route = $_POST["ownerId"]."/".$timestamp;

        //上傳照片
        $ImageCount = count($_FILES['image']['name']);
        for($i=0;$i<$ImageCount;$i++){
            $file_name = $_FILES['image']['name'][$i];
            // echo $file_name."<br>";
            $file_path = $_FILES['image']['tmp_name'][$i];
            file_upload("http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/api/add/file",$file_name,$file_path,$file_route);
            // echo "<script type='text/javascript'>";
            // echo "console.log('".$result."')";
            // echo "</script>";
        }

        //上傳影片
        $videoCount = count($_FILES['video']['name']);
        for($i=0;$i<$videoCount;$i++){
            $file_name = $_FILES['video']['name'][$i];
            // echo $file_name."<br>";
            $file_path = $_FILES['video']['tmp_name'][$i];
            file_upload("http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/api/add/file",$file_name,$file_path,$file_route);
        }

        //提醒新增成功
        echo "<script type='text/javascript'>";
        echo "alert('新增日誌成功!')";
        echo "</script>";

        // 跳回 <日誌列表>
        $url = "log_list.php?checker=".$_POST["ownerId"];
        echo "<script type='text/javascript'>";
        echo "window.location.href='$url'";
        echo "</script>";
    }
?>
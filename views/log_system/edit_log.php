<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!-- Meta, title, CSS, favicons, etc. -->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>NTHU智慧農業平台</title>
  <link rel="Shortcut Icon" type="image/x-icon" href="images/agronomy.ico">
  <!-- Bootstrap -->
  <link href="../vendors/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="../vendors/bootstrap/dist/js/bootstrap.min.js" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="../vendors/font-awesome/css/font-awesome.min.css" rel="stylesheet">
  <!-- Font Awesome v4.7 -->
  <link href="../vendors/font-awesome-4.7.0/css/font-awesome.min.css" rel="stylesheet">
  <!-- Font Awesome v5.0.13 -->
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">
  <!-- Weather icon -->
  <link href="../vendors/weather-icons-master/css/weather-icons.min.css" rel="stylesheet">
  <link href="../vendors/weather-icons-master/css/weather-icons-wind.min.css" rel="stylesheet">
  <!-- NProgress -->
  <link href="../vendors/nprogress/nprogress.css" rel="stylesheet">
  <!-- iCheck -->
  <link href="../vendors/iCheck/skins/flat/green.css" rel="stylesheet">

  <!-- bootstrap-progressbar -->
  <link href="../vendors/bootstrap-progressbar/css/bootstrap-progressbar-3.3.4.min.css" rel="stylesheet">
  <!-- JQVMap -->
  <link href="../vendors/jqvmap/dist/jqvmap.min.css" rel="stylesheet" />
  <!-- bootstrap-daterangepicker -->
  <link href="../vendors/bootstrap-daterangepicker/daterangepicker.css" rel="stylesheet">

  <!-- Custom Theme Style -->
  <link href="../build/css/custom.min.css" rel="stylesheet">

  <script src="../vendors/jquery/dist/jquery.min.js"></script>

  <!-- Scripts by CTLiu -->
  <script src="../build/js/sidebar.js"></script>
  <script src="../build/js/area_page.js"></script>
  <script src="../build/js/loading.js"></script>
  <script src="../build/js/config.js"></script>

  <!-- css by CHOu -->
  <link rel="stylesheet" href="mystyle.css">
  <!-- datetimepicker -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.1/moment.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.7.14/js/bootstrap-datetimepicker.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datetimepicker/4.7.14/css/bootstrap-datetimepicker.min.css">
  <script>
    function check(){
        if (!confirm("確定要刪除?"))
        return false;
    }
  </script>
  <?php 
    //設定時區
    date_default_timezone_set('Asia/Taipei');
    session_start(); 
    $public = include('config.php');
  ?>
</head>
<style>
  .x_title span {
    color: #a94442;
  }

  .count {
    font-size: 20px;
  }
</style>

<script>
  window.onload = load_sidebars();
  window.onload = get_name();
  window.onload = get_sensorhubs();
  window.onload = get_username();
  window.onload = load_area_in_modal();
  window.onload = load_group_in_modal();
  window.onload = load_sensor_in_modal();
  window.onload = get_area_name();
</script>

 <!-- onload="checkCookie()" -->
<body class="nav-md">
  <div class="container body">
    <div class="main_container">
      <div class="col-md-3 left_col">
        <div class="left_col scroll-view">
          <div class="navbar nav_title" style="border: 0;">
            <a onclick="check_admin()" class="site_title">
              <img src="../images/agronomy.png" height="45px">
              <span style="font-size: 18px">NTHU智慧農業平台</span>
            </a>
          </div>

          <div class="clearfix"></div>

          <!-- menu profile quick info -->
          <div class="profile clearfix">
            <div class="profile_pic">
              <img src="../images/farmer.png" height="50px" alt="..." class="img-circle profile_img">
            </div>
            <div class="profile_info">
              <span>Welcome,</span>
              <h2 id="username"></h2>
            </div>
          </div>
          <!-- /menu profile quick info -->

          <br />

          <!-- sidebar menu -->
          <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
            <div class="menu_section">
              <h3></h3>
              <ul class="nav side-menu">
                <li><a href="http://nthu-smart-farming.kits.tw:8080/homepage.html"><i class="fa fa-home"></i> 首頁 </a>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a><i class="fa fa-plus"></i> 新增/刪除項目 <span class="fa fa-chevron-down"></span></a>
                  <ul class="nav child_menu">
                    <li><a data-toggle="modal" data-target="#new_area_Modal">新增場域</a></li>
                    <li><a data-toggle="modal" data-target="#new_group_Modal">新增感應器群組</a></li>
                    <li><a data-toggle="modal" data-target="#new_controller_Modal">新增控制器</a></li>
                    <li><a data-toggle="modal" data-target="#del_Modal">刪除項目</a></li>
                  </ul>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a><i class="fa fa-area-chart"></i> 場域空間 <span class="fa fa-chevron-down"></span></a>
                  <ul class="nav child_menu" id="showPlace">
                  </ul>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a><i class="fa fa-sliders"></i> 邏輯控制 <span class="fa fa-chevron-down"></span></a>
                  <ul class="nav child_menu" id="showController">
                  </ul>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a><i class="fa fa-line-chart"></i>數據分析 <span class="fa fa-chevron-down"></span></a>
                  <ul class="nav child_menu" id="showAnalysis">
                  </ul>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a href="log_list.php?checker=<?= $_SESSION["ownerId"] ?>"><i class="fa fa-calendar"></i> 日誌系統 </a>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a data-toggle="modal" data-target="#Setting_Modal" onclick="initial_setting()"><i class="fa fa-cog"></i> 使用者設定 </a>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a onclick="del()" href="http://nthu-smart-farming.kits.tw:8080/login.html"><i class="fa fa-sign-out"></i> 使用者登出 </a>
                </li>
              </ul>
            </div>
          </div>
          <!-- /sidebar menu -->
        </div>
      </div>

      <!-- top navigation -->
      <div class="top_nav">
        <div class="nav_menu">
          <nav>
            <div class="nav toggle">
              <a id="menu_toggle"><i class="fa fa-bars"></i></a>
            </div>

            <ul class="nav navbar-nav navbar-right">
              <li role="presentation" class="dropdown">
                <a href="javascript:;" class="dropdown-toggle info-number" data-toggle="dropdown" aria-expanded="false">
                    <i class="fa fa-exclamation-circle"></i>
                    <span class="badge bg-red"></span>
                  </a>
                <ul id="menu1" class="dropdown-menu list-unstyled msg_list" role="menu">
                  <li>
                    <a>
                        <span class="image"><img src="images/Apple_User.png" alt="Profile Image" /></span>
                        <span>
                          <span><strong>Temperature</strong></span>
                          <span class="time">1 mins ago</span>
                        </span>
                        <span class="message">
                          Temperature was too high!.....
                        </span>
                      </a>
                  </li>
                  <li>
                    <a>
                        <span class="image"><img src="images/Apple_User.png" alt="Profile Image" /></span>
                        <span>
                          <span><strong>Humidity</strong></span>
                          <span class="time">2 mins ago</span>
                        </span>
                        <span class="message">
                          Humidity was too high!.......
                        </span>
                      </a>
                  </li>
                  <li>
                    <a>
                        <span class="image"><img src="images/Apple_User.png" alt="Profile Image" /></span>
                        <span>
                          <span><strong>Battery</strong></span>
                          <span class="time">3 mins ago</span>
                        </span>
                        <span class="message">
                          Battery was too low!.........
                        </span>
                      </a>
                  </li>
                  <li>
                    <div class="text-center">
                      <a>
                          <strong>See All Alerts</strong>
                          <i class="fa fa-angle-right"></i>
                        </a>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <!-- /top navigation -->

      <!-- page content -->
      <div class="right_col" role="main">
        <div class="">
        <?php session_start();?>
          <?php
              function view_log($url){
                  $ch			= curl_init();
                  $options    = array(
                                          CURLOPT_URL				=>    $url,
                                          // CURLOPT_HEADER			=>    false,
                                          CURLOPT_RETURNTRANSFER  =>    true,
                                          CURLOPT_CUSTOMREQUEST   =>    "GET", //啟用GET
                                          CURLOPT_HTTPHEADER      =>    array('Content-Type: application/json',
                                                                              'token: '.$_COOKIE['token']
                                                                        )
                                      );
                  
                  curl_setopt_array($ch,$options) ; //把陣列放入設定
                  $result = curl_exec($ch); //開始執行
                  curl_close($ch);
                  return $result;
              }

              function edit_log($url,$postdataarray){
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
                                          CURLOPT_HTTPHEADER      =>    array('token: '.$_COOKIE['token']),
                                          CURLOPT_POSTFIELDS		=>    $data
                                      );
                  
                  curl_setopt_array($ch,$options) ; //把陣列放入設定
                  $result = curl_exec($ch); //開始執行
                  curl_close($ch);
                  return $result;
              }

              //先將前面傳來的get參數儲存下來，編輯要用post送出
              if(!empty($_GET)){
                  $ownerId = $_GET["ownerId"];
                  $timestamp = $_GET["timestamp"];
              }

              /*    編輯表單，表單還未送出    */
              if(empty($_POST)){
                  $str = view_log($public['api_url']."api/search/log/ownerId/$ownerId");
              
                  $str = json_decode($str);
                  // print_r($str);
                  for($i=0;$i<count($str->Items);$i++){
                      //以timestamp判斷要抓取的日誌資料
                      if($str->Items[$i]->timestamp==$timestamp){
                          $author = $str->Items[$i]->author;
                          $area = $str->Items[$i]->area;
                          $type = $str->Items[$i]->type;
                          $memo = $str->Items[$i]->memo;
                          $crop = $str->Items[$i]->crop;
                          $machine = $str->Items[$i]->machine;
                          $diseases = $str->Items[$i]->diseases;

                          //unix time => date form string
                          $time = str_pad($str->Items[$i]->set_time, 13, "0", STR_PAD_RIGHT); 
                          // $time = substr(str_replace(" ","T",$time), 0, -3);

                          $files = $str->Items[$i]->files;
                      }
                  }
          ?>
          <div class="right">
            <a href="log_list.php?checker=<?=$ownerId?>" class="btn btn-primary" role="button">
              <span class="glyphicon glyphicon-home"></span>回日誌列表
            </a>
          </div>
          <!-- <div class="center"> -->
              <h1>編輯日誌資訊</h1>
              <form method="post" action="edit_log.php" enctype="multipart/form-data">
                  <input type="hidden" name="ownerId" value="<?= $ownerId ?>">
                  <input type="hidden" name="timestamp" value="<?= $timestamp ?>">
                  <?php for($i=0;$i<count($files);$i++){ ?>
                  <input type="hidden" name="files[]" value="<?= $files[$i] ?>">
                  <?php } ?>
                  <!-- 紀錄者 -->
                  <div class="form-group col-md-4 col-sm-4 col-xs-4">
                    <label for="author"><h4>紀錄者:</h4></label>
                    <input type="text" class="form-control" id="author" value="<?= $author ?>" placeholder="紀錄者姓名" name="author" required>
                  </div>
                  <div class="clearfix"></div>
                  <!-- 場域 -->
                  <div class="form-group col-md-4 col-sm-4 col-xs-4">
                    <label for="area"><h4>場域:</h4></label>
                    <input type="text" class="form-control" id="area"  value="<?= $area ?>" placeholder="場域名稱" name="area" required>
                    <select class="form-control" id="select_area" onchange="changeArea()">
                    </select>
                  </div>
                  <script>
                    function changeArea() {
                      var area = document.getElementById("select_area").value;
                      document.getElementById("area").value = area;
                    }
                  </script>
                  <div class="clearfix"></div>
                  <!-- 作物 -->
                  <div class="form-group col-md-4 col-sm-4 col-xs-4">
                    <label for="type"><h4>作物:</h4></label>
                    <input type="text" class="form-control" id="crop" placeholder="可手動輸入作物" name="crop" value="<?= $crop ?>" required>
                    <select class="form-control" id="select_crop" onchange="changeCrop()">
                      <option value="蘆筍">蘆筍</option>
                      <option value="冰菜">冰菜</option>
                      <option value="巨大國王高麗菜">巨大國王高麗菜</option>
                      <option value="結球萵苣">結球萵苣</option>
                      <option value="菠菜">菠菜</option>
                      <option value="萵苣">萵苣</option>
                      <option value="稻米">稻米</option>
                      <option value="小麥">小麥</option>
                      <option value="玉米">玉米</option>
                      <option value="芋頭">芋頭</option>
                      <option value="甘藷">甘藷</option>
                      <option value="茶葉">茶葉</option>
                      <option value="甘蔗">甘蔗</option>
                      <option value="花生">花生</option>
                      <option value="棉花">棉花</option>
                      <option value="香蕉">香蕉</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <script>
                    function changeCrop() {
                      if(document.getElementById("select_crop").value == "other"){
                        document.getElementById("crop").value = "";
                      }else{
                        var crop = document.getElementById("select_crop").value;
                        document.getElementById("crop").value = crop;
                      }
                    }
                  </script>
                  <div class="clearfix"></div>
                  <!-- 工作事項 -->
                  <div class="form-group col-md-4 col-sm-4 col-xs-4">
                    <label for="type"><h4>工作事項:</h4></label>
                    <input type="text" class="form-control" id="type" value="<?= $type ?>" name="type" required>
                    <select class="form-control" id="select_type" onchange="changeType()">
                      <option value="整地">整地</option>
                      <option value="水土保持">水土保持</option>
                      <option value="育苗">育苗</option>
                      <option value="播種">播種</option>
                      <option value="定植">定植</option>
                      <option value="灌溉">灌溉</option>
                      <option value="施肥">施肥</option>
                      <option value="培土">培土</option>
                      <option value="雜草防除">雜草防除</option>
                      <option value="蔬果">蔬果</option>
                      <option value="套袋">套袋</option>
                      <option value="枝蔓修剪">枝蔓修剪</option>
                      <option value="人工授粉">人工授粉</option>
                      <option value="病蟲害防治">病蟲害防治</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <script>
                    function changeType() {
                      if(document.getElementById("select_type").value == "other"){
                        document.getElementById("type").value = "";
                      }else{
                        var type = document.getElementById("select_type").value;
                        document.getElementById("type").value = type;
                      }
                    }
                  </script>
                  <div class="clearfix"></div>
                  <!-- 農機具 -->
                  <div class="form-group col-md-4 col-sm-4 col-xs-4">
                    <label for="type"><h4>農機具:</h4></label>
                    <input type="text" class="form-control" id="tool" name="tool" placeholder="可手動輸入農機具" value="<?= $machine ?>" required>
                    <select class="form-control" id="select_tool" onchange="changeTool()">
                      <option value="無">無</option>
                      <option value="耕耘機">耕耘機</option>
                      <option value="農用曳引機">農用曳引機</option>
                      <option value="插秧機">插秧機</option>
                      <option value="蔬菜移植機">蔬菜移植機</option>
                      <option value="育苗機械">育苗機械</option>
                      <option value="中耕管理機">中耕管理機</option>
                      <option value="動力割操機">動力割草機</option>
                      <option value="動力剪枝機">動力剪枝機</option>
                      <option value="肥料撒佈機">肥料撒佈機</option>
                      <option value="動力噴霧機">動力噴霧機</option>
                      <option value="聯合收穫機">聯合收穫機</option>
                      <option value="動力採茶機">動力採茶機</option>
                      <option value="動力脫殼機">動力脫殼機</option>
                      <option value="玉米去苞葉機">玉米去苞葉機</option>
                      <option value="雜糧脫粒機">雜糧脫粒機</option>
                      <option value="碾米機">碾米機</option>
                      <option value="風穀機">風穀機</option>
                      <option value="茶葉揉捻機">茶葉揉捻機</option>
                      <option value="茶葉攪拌機">茶葉攪拌機</option>
                      <option value="水果分級選別機">水果分級選別機</option>
                      <option value="製繩機">製繩機</option>
                      <option value="樹枝打碎機">樹枝打碎機</option>
                      <option value="農地搬運車">農地搬運車</option>
                      <option value="履帶式搬運車">履帶式搬運車</option>
                      <option value="狼尾草收穫機">狼尾草收穫機</option>
                      <option value="畜牧用曳引機">畜牧用曳引機</option>
                      <option value="鏟斗機">鏟斗機</option>
                      <option value="完全日糧攪拌機">完全日糧攪拌機</option>
                      <option value="飼料給飼車">飼料給飼車</option>
                      <option value="動力噴霧消毒機">動力噴霧消毒機</option>
                      <option value="高溫高壓清洗機">高溫高壓清洗機</option>
                      <option value="保溫加熱機">保溫加熱機</option>
                      <option value="鏈鋸">鏈鋸</option>
                      <option value="整地後機械">整地後機械</option>
                      <option value="鑽孔機">鑽孔機</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <script>
                    function changeTool() {
                      if(document.getElementById("select_tool").value == "other"){
                        document.getElementById("tool").value = "";
                      }else{
                        var tool = document.getElementById("select_tool").value;
                        document.getElementById("tool").value = tool;
                      }
                    }
                  </script>
                  <div class="clearfix"></div>
                  <!-- 病蟲害 -->
                  <div class="form-group col-md-4 col-sm-4 col-xs-4">
                    <label for="disease"><h4>病蟲害:</h4></label>
                    <input type="text" class="form-control" id="disease" placeholder="可手動輸入病蟲害" name="disease" value="<?= $diseases ?>" required>
                    <select class="form-control" id="select_disease" onchange="changeDisease()">
                      <option value="無">無</option>
                      <option value="未知">未知</option>
                      <option value="木瓜輪點病">木瓜輪點病</option>
                      <option value="香蕉黃葉病">香蕉黃葉病</option>
                      <option value="水稻福壽螺">水稻福壽螺</option>
                      <option value="松材線蟲">松材線蟲</option>
                      <option value="非洲菊斑潛蠅">非洲菊斑潛蠅</option>
                      <option value="水稻水象鼻蟲">水稻水象鼻蟲</option>
                      <option value="梨衰弱病">梨衰弱病</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <script>
                    function changeDisease() {
                      if(document.getElementById("select_disease").value == "other"){
                        document.getElementById("disease").value = "";
                      }else{
                        var disease = document.getElementById("select_disease").value;
                        document.getElementById("disease").value = disease;
                      }
                    }
                  </script>
                  <div class="clearfix"></div>
                  <!-- 備忘錄 -->
                  <div class="form-group col-md-6 col-sm-6 col-xs-6">
                    <label for="memo"><h4>備忘錄:</h4></label>
                    <textarea class="form-control" rows="5" id="comment" name="memo"><?= $memo ?></textarea>
                  </div>
                  <div class="clearfix"></div>
                  <!-- 時間 -->
                  <div class='col-md-4 col-sm-4 col-xs-4'>
                      <div class="form-group">
                          <label for="memo"><h4>時間:</h4></label>
                          <div class='input-group date' id='datetimepicker1'>
                            <input type='text' class="form-control" name="set_time" required/>
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>                                               
                          </div>
                      </div>
                  </div>
                  <script type="text/javascript">
                      $(function () {
                          $('#datetimepicker1').datetimepicker({
                              date: new Date(<?= $time ?>)
                          });
                      });
                  </script>
                  <div class="clearfix"></div>

                  <div class='col-md-6 col-sm-6 col-xs-6'>
                    <div class="form-group">
                      <label for="image"><h4>上傳照片:</h4></label>
                      <br>
                      <?php
                          if(!empty($files)){
                              echo "<div id='have_img'>目前照片有：</div>";
                              echo "<script>
                                          document.getElementById('have_img').style.visibility = 'hidden';
                                      </script>";
                              for($j=0;$j<count($files);$j++){
                                  $name_part = explode(".",$files[$j]);
                                  $form = $name_part[1];
                                  if(strtolower($form)=="jpg" || strtolower($form)=="png"){
                                      echo "<script>
                                          document.getElementById('have_img').style.visibility = 'visible';
                                      </script>";
                                      echo $files[$j]."<br>";
                                  }
                              }
                          }
                      ?>
                      <label class="file btn btn-info">
                        <input id="image" name="image[]" style="display:none;" type="file" multiple>
                        <i class="fa fa-photo"></i> 上傳圖片
                      </label>
                    </div>
                  </div>
                  <div class="clearfix"></div>
                  <div class="preview_img col-md-6 col-sm-6 col-xs-6">
                    <p>現在沒有任何照片上傳</p>
                  </div>
                  <div class="clearfix"></div>

                  <div class='col-md-6 col-sm-6 col-xs-6'>
                    <div class="form-group">
                      <label for="image"><h4>上傳影片:</h4></label>
                      <br>
                      <?php
                          if(!empty($files)){
                              echo "<div id='have_video'>目前影片有：</div>";
                              echo "<script>
                                          document.getElementById('have_video').style.visibility = 'hidden';
                                      </script>";
                              for($j=0;$j<count($files);$j++){
                                  $name_part = explode(".",$files[$j]);
                                  $form = $name_part[1];
                                  if(strtolower($form)=="mp4"){
                                      echo "<script>
                                          document.getElementById('have_video').style.visibility = 'visible';
                                      </script>";
                                      echo $files[$j]."<br>";
                                  }
                              }
                          }
                      ?>
                      <label class="file btn btn-info">
                        <input id="video" name="video[]" style="display:none;" type="file" multiple>
                        <i class="fas fa-video"></i> 上傳影片
                      </label>
                    </div>
                  </div>
                  <div class="clearfix"></div>
                  <div class="preview_video col-md-6 col-sm-6 col-xs-6">
                    <p>現在沒有任何影片上傳</p>
                  </div>
                  <div class="clearfix"></div>

                    <!-- File custom script -->
                    <script>
                    var input_img = document.querySelector('#image');
                    var preview_img = document.querySelector('.preview_img');
                    input_img.style.opacity = 0;
                    input_img.addEventListener('change', updateImageDisplay);

                    var input_video = document.querySelector('#video');
                    var preview_video = document.querySelector('.preview_video');
                    input_video.style.opacity = 0;
                    input_video.addEventListener('change', updateVideoDisplay);

                    //『照片』--- 檢查照片格式和預覽
                    function updateImageDisplay(){
                      while(preview_img.firstChild) {
                        preview_img.removeChild(preview_img.firstChild);
                      }

                      var curFiles = input_img.files;
                      if(curFiles.length === 0) {
                        var para = document.createElement('p');
                        para.textContent = '現在沒有任何照片上傳';
                        preview_img.appendChild(para);
                      } else {
                        var list = document.createElement('ol');
                        preview_img.appendChild(list);
                        for(var i = 0; i < curFiles.length; i++) {
                          var listItem = document.createElement('li');
                          var para = document.createElement('p');
                          if(validImageType(curFiles[i])) {
                            para.innerHTML = curFiles[i].name + "<br>大小：" + returnFileSize(curFiles[i].size);
                            var image = document.createElement('img');
                            image.src = window.URL.createObjectURL(curFiles[i]);

                            listItem.appendChild(image);
                            listItem.appendChild(para);

                          } else {
                            para.innerHTML = curFiles[i].name + '<br>不符合照片格式，請重新上傳jpg或png的檔案！';
                            listItem.appendChild(para);
                          }

                          list.appendChild(listItem);
                        }
                      }
                    }

                    //『影片』--- 檢查影片格式和預覽
                    function updateVideoDisplay(){
                      while(preview_video.firstChild) {
                        preview_video.removeChild(preview_video.firstChild);
                      }

                      var curFiles = input_video.files;
                      if(curFiles.length === 0) {
                        var para = document.createElement('p');
                        para.textContent = '現在沒有任何照片上傳';
                        preview_video.appendChild(para);
                      } else {
                        var list = document.createElement('ol');
                        preview_video.appendChild(list);
                        for(var i = 0; i < curFiles.length; i++) {
                          var listItem = document.createElement('li');
                          var para = document.createElement('p');
                          if(validVideoType(curFiles[i])) {
                            para.innerHTML = curFiles[i].name + "<br>大小：" + returnFileSize(curFiles[i].size);
                            var video = document.createElement('video');
                            video.setAttribute('controls', ' ');
                            video.src = window.URL.createObjectURL(curFiles[i]);

                            source = document.createElement('source');
                            source.setAttribute('type', 'video/mp4');
                            source.setAttribute('src', window.URL.createObjectURL(curFiles[i]));
                            video.appendChild(source);

                            listItem.appendChild(video);
                            listItem.appendChild(para);

                          } else {
                            para.innerHTML = curFiles[i].name + '<br>不符合影片格式，請重新格式為mp4的檔案！';
                            listItem.appendChild(para);
                          }

                          list.appendChild(listItem);
                        }
                      }
                    }

                    var ImageTypes = [
                      'image/jpeg',
                      'image/pjpeg',
                      'image/png'
                    ]

                    function validImageType(file) {
                      for(var i = 0; i < ImageTypes.length; i++) {
                        if(file.type === ImageTypes[i]) {
                          return true;
                        }
                      }

                      return false;
                    }

                    var VideoTypes = [
                      'video/mp4'
                    ]

                    function validVideoType(file) {
                      for(var i = 0; i < VideoTypes.length; i++) {
                        if(file.type === VideoTypes[i]) {
                          return true;
                        }
                      }

                      return false;
                    }

                    function returnFileSize(number) {
                      if(number < 1024) {
                        return number + 'bytes';
                      } else if(number >= 1024 && number < 1048576) {
                        return (number/1024).toFixed(1) + 'KB';
                      } else if(number >= 1048576) {
                        return (number/1048576).toFixed(1) + 'MB';
                      }
                    }
                  </script>
                  <p>
                      <b style="color: red;">*[注意] 上傳多個檔案需要較久的上傳時間，請耐心等候！</b>
                  </p>
                  <button type="submit" class="btn btn-success">送出</button>
              </form>
                  

              <!-- 處理編輯日誌資訊 -->
              <?php
              /*    表單送出，處理更新    */
              }else{
                  $set_time = strtotime($_POST["set_time"]);

                  //編輯日誌給files欄位的資料
                  $file_list = array();
                  if($_POST["files"] != NULL){
                      $file_list = $_POST["files"];
                      // print_r($file_list);
                  }
                  // array_splice($file_list,0,1);//因最前面元素為"Array",要刪除並將後面元素遞補上去
                  // echo gettype($file_list);

                  //將照片檔名串接
                  $ImageCount = count($_FILES['image']['name']);
                  // echo "<br>";
                  // echo "照片數量：".($_FILES['image']['name'][0]==null)."<br>";
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

                  //去掉重複檔名(很重要，要不然顯示會出現多個一樣檔案)
                  $file_list = array_unique($file_list);

                  // print_r($file_list);
                  // echo count($_FILES)."<br>";
                  // echo "ownerId: ".($_POST["ownerId"])."<br>";
                  // echo "timestamp: ".($_POST["timestamp"])."<br>";
                  // echo "area: ".($_POST["area"])."<br>";
                  // echo "memo: ".($_POST["memo"])."<br>";
                  // echo "author: ".($_POST["author"])."<br>";
                  // echo "set_time: ".strtotime($_POST["set_time"])."<br>";
                  // echo "type: ".($_POST["type"])."<br>";
                  // echo "files: ".print_r($file_list)."<br>";
                  // echo "image: ".print_r($_FILES['image']['name'])."<br>";
                  // echo "video: ".print_r($_FILES['video']['name'])."<br>";

                  $data = array(
                      "ownerId" => $_POST["ownerId"],
                      "timestamp" => (int)$_POST["timestamp"],
                      "area" => $_POST["area"],
                      "memo" => $_POST["memo"],
                      "author" => $_POST["author"],
                      "set_time" => $set_time,
                      "type" => $_POST["type"],
                      "files" => $file_list,
                      "machine" => $_POST["tool"],
                      "crop" => $_POST["crop"],
                      "diseases" => $_POST["disease"]
                  );

                  $data = json_encode($data);
                  edit_log($public['api_url']."api/update/log",$data);
              
                  /*    上傳檔案    */
                  //串接file_route(給aws s3 API 使用)
                  $file_route = $_POST["ownerId"]."/".$_POST["timestamp"];
              
                  //上傳照片
                  $ImageCount = count($_FILES['image']['name']);
                  for($i=0;$i<$ImageCount;$i++){
                      $file_name = $_FILES['image']['name'][$i];
                      // echo $file_name."<br>";
                      $file_path = $_FILES['image']['tmp_name'][$i];
                      file_upload($public['api_url']."api/add/file",$file_name,$file_path,$file_route);
                  }

                  //上傳影片
                  $videoCount = count($_FILES['video']['name']);
                  for($i=0;$i<$videoCount;$i++){
                      $file_name = $_FILES['video']['name'][$i];
                      // echo $file_name."<br>";
                      $file_path = $_FILES['video']['tmp_name'][$i];
                      file_upload($public['api_url']."api/add/file",$file_name,$file_path,$file_route);
                  }

                  //提醒編輯成功
                  echo "<script type='text/javascript'>";
                  echo "alert('編輯日誌成功!')";
                  echo "</script>";

                  //跳回 <日誌列表>
                  $url = "log_list.php?checker=".$_POST["ownerId"];
                  echo "<script type='text/javascript'>";
                  echo "window.location.href='$url'";
                  echo "</script>";
              }
              ?>
          </div>
        </div>
      </div>


      <!-- /page content -->
      <div class="container">
            <div class="modal fade" id="new_area_Modal" role="dialog">
              <div class="modal-dialog">
                <!-- Modal content-->
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">新增場域</h4>
                  </div>
                  <div class="modal-body">
                    <form>
                      <span style="color: red">*&nbsp;</span>場域名稱:<br>
                      <input type="text" id="new_area_name">
                      <br><br>
                      場域地址:<br>
                      <select required="required" id="city">
                        <option value="none">---請選擇縣市---</option>
                        <option value="keelung">基隆市</option>
                        <option value="new_taipei">新北市</option>
                        <option value="taipei">台北市</option>
                        <option value="taoyuan">桃園縣</option>
                        <option value="hsinchu">新竹縣</option>
                        <option value="yilan">宜蘭縣</option>
                        <option value="miaoli">苗栗縣</option>
                        <option value="taichung">台中市</option>
                        <option value="changhua">彰化縣</option>
                        <option value="nantou">南投縣</option>
                        <option value="hualien">花蓮縣</option>
                        <option value="yunlin">雲林縣</option>
                        <option value="chiayi">嘉義縣</option>
                        <option value="tainan">台南市</option>
                        <option value="kaohsiung">高雄市</option>
                        <option value="taitung">台東縣</option>
                        <option value="pingtung">屏東縣</option>
                        <option value="kinmen">金門縣</option>
                        <option value="penghu">澎湖縣</option>
                      </select>
                      <input type="text" id="new_area_location" size="40">
                      <br><br>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" data-dismiss="modal" onclick="add_area()">Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="container">
            <div class="modal fade" id="new_group_Modal" role="dialog">
              <div class="modal-dialog">
                <!-- Modal content-->
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">新增感測器群組</h4>
                  </div>
                  <div class="modal-body">
                    <form>
                      <span style="color: red">*&nbsp;</span>感測器群組名稱:<br>
                      <input type="text" id="new_group_name">
                      <br><br>
                      <span style="color: red">*&nbsp;</span>LoRa 模組 MacAddress：<br>
                      <input type="text" id="macAddr" value="">
                      <br><br> 
                      <span style="color: red">*&nbsp;</span>建制於場域:<br>
                      <select required="required" id="group_select" onchange="group_select_func(value);">
                  </select>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" data-dismiss="modal" onclick="add_group()">Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="container">
            <div class="modal fade" id="new_controller_Modal" role="dialog">
              <div class="modal-dialog">
                <!-- Modal content-->
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">新增控制器</h4>
                  </div>
                  <div class="modal-body">
                    <form>
                      <span style="color: red">*&nbsp;</span>控制器名稱:<br>
                      <input type="text" id="new_controller_name">
                      <br><br> 
                      <span style="color: red">*&nbsp;</span>建制於場域:<br>
                      <select required="required" id="controller_in_area">
                      </select>
                      <br><br> 
                      傳輸協議:<br>
                      <select required="required" id="protocol">
                        <option value="NoSelection">---請選擇---</option>
                        <option value="socket">socket</option>
                        <option value="lora-p2p">lora-p2p</option>
                        <option value="nb-iot">nb-iot</option>
                        <option value="self-control">自控</option>
                      </select>
                      <br><br> 
                      協議相關設定:<br>
                      <input type="text" id="protocol_setting">
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" data-dismiss="modal" onclick="add_controller()">Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="container">
            <div class="modal fade" id="Setting_Modal" role="dialog">
              <div class="modal-dialog">
                <!-- Modal content-->
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">使用者資訊設定</h4>
                  </div>
                  <div class="modal-body">
                    <form>
                      新的使用者名稱:<br>
                      <input type="text" id="new_username">
                      <br><br> 新的密碼:
                      <br>
                      <input type="text" id="new_password">
                      <br><br> 確認新的密碼:
                      <br>
                      <input type="text" id="new_password_confirm">
                      <br><br>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="settings()">Admit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="container">
            <div class="modal fade" id="del_Modal" role="dialog">
              <div class="modal-dialog">
                <!-- Modal content-->
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">刪除項目</h4>
                  </div>
                  <div class="modal-body">
                    <form>
                      欲刪除場域:<br>
                      <select required id="area_del" onchange="area_del_func()">
                  </select><br> 欲刪除感測器群組:
                      <br>
                      <select required id="group_del" onchange="group_del_func()">
                  </select><br> 欲刪除感測器:
                      <br>
                      <select required id="sensor_del" onchange="sensor_del_func()">
                  </select><br>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal" onclick="del_from_db()">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      <!-- jQuery -->
      <!-- Bootstrap -->
      <script src="../vendors/bootstrap/dist/js/bootstrap.min.js"></script>
      <!-- FastClick -->
      <script src="../vendors/fastclick/lib/fastclick.js"></script>
      <!-- NProgress -->
      <script src="../vendors/nprogress/nprogress.js"></script>
      <!-- Chart.js -->
      <script src="../vendors/Chart.js/dist/Chart.min.js"></script>
      <!-- gauge.js -->
      <script src="../vendors/gauge.js/dist/gauge.min.js"></script>
      <!-- bootstrap-progressbar -->
      <script src="../vendors/bootstrap-progressbar/bootstrap-progressbar.min.js"></script>
      <!-- iCheck -->
      <script src="../vendors/iCheck/icheck.min.js"></script>
      <!-- Skycons -->
      <script src="../vendors/skycons/skycons.js"></script>
      <!-- Flot -->
      <script src="../vendors/Flot/jquery.flot.js"></script>
      <script src="../vendors/Flot/jquery.flot.pie.js"></script>
      <script src="../vendors/Flot/jquery.flot.time.js"></script>
      <script src="../vendors/Flot/jquery.flot.stack.js"></script>
      <script src="../vendors/Flot/jquery.flot.resize.js"></script>
      <!-- Flot plugins -->
      <script src="../vendors/flot.orderbars/js/jquery.flot.orderBars.js"></script>
      <script src="../vendors/flot-spline/js/jquery.flot.spline.min.js"></script>
      <script src="../vendors/flot.curvedlines/curvedLines.js"></script>
      <!-- DateJS -->
      <script src="../vendors/DateJS/build/date.js"></script>
      <!-- JQVMap -->
      <script src="../vendors/jqvmap/dist/jquery.vmap.js"></script>
      <script src="../vendors/jqvmap/dist/maps/jquery.vmap.world.js"></script>
      <script src="../vendors/jqvmap/examples/js/jquery.vmap.sampledata.js"></script>
      <!-- bootstrap-daterangepicker -->
      <script src="../vendors/moment/min/moment.min.js"></script>
      <script src="../vendors/bootstrap-daterangepicker/daterangepicker.js"></script>
      <!-- ECharts -->
      <script src="../vendors/echarts/dist/echarts.min.js"></script>

      <!-- Custom Theme Scripts -->
      <script src="../build/js/custom.js"></script>
      <!-- Scripts by CTL -->
      <script src="../build/js/cookie.js"></script>
</body>

</html>

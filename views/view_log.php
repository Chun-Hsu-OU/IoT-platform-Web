<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!-- Meta, title, CSS, favicons, etc. -->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>查看日誌</title>
  <link rel="Shortcut Icon" type="image/x-icon" href="images/platform-icon.ico" />
  <!-- Bootstrap -->
  <link href="vendors/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="vendors/bootstrap/dist/js/bootstrap.min.js" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="vendors/font-awesome/css/font-awesome.min.css" rel="stylesheet">
  <!-- Font Awesome v4.7 -->
  <link href="vendors/font-awesome-4.7.0/css/font-awesome.min.css" rel="stylesheet">
  <!-- Weather icon -->
  <link href="vendors/weather-icons-master/css/weather-icons.min.css" rel="stylesheet">
  <link href="vendors/weather-icons-master/css/weather-icons-wind.min.css" rel="stylesheet">
  <!-- NProgress -->
  <link href="vendors/nprogress/nprogress.css" rel="stylesheet">
  <!-- iCheck -->
  <link href="vendors/iCheck/skins/flat/green.css" rel="stylesheet">

  <!-- bootstrap-progressbar -->
  <link href="vendors/bootstrap-progressbar/css/bootstrap-progressbar-3.3.4.min.css" rel="stylesheet">
  <!-- JQVMap -->
  <link href="vendors/jqvmap/dist/jqvmap.min.css" rel="stylesheet" />
  <!-- bootstrap-daterangepicker -->
  <link href="vendors/bootstrap-daterangepicker/daterangepicker.css" rel="stylesheet">

  <!-- Custom Theme Style -->
  <link href="build/css/custom.min.css" rel="stylesheet">

  <script src="vendors/jquery/dist/jquery.min.js"></script>

  <!-- Scripts by CTLiu -->
  <script src="build/js/sidebar.js"></script>
  <script src="build/js/area_page.js"></script>
  <script src="build/js/loading.js"></script>

  <!-- css by CHOu -->
  <link rel="stylesheet" href="mystyle.css">
  <script>
    function check(){
        if (!confirm("確定要刪除?"))
        return false;
    }
  </script>
  <?php 
  session_start();
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
</script>

 <!-- onload="checkCookie()" -->
<body class="nav-md">
  <div class="container body">
    <div class="main_container">
      <div class="col-md-3 left_col">
        <div class="left_col scroll-view">
          <div class="navbar nav_title" style="border: 0;">
            <a onclick="check_admin()" class="site_title"><i class="fa fa-pagelines"></i> <span>HSNL IoT Platform</span></a>
          </div>

          <div class="clearfix"></div>

          <!-- menu profile quick info -->
          <div class="profile clearfix">
            <div class="profile_pic">
              <img src="images/Apple_User.png" alt="..." class="img-circle profile_img">
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
                <li><a href="http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:8080/homepage.html"><i class="fa fa-home"></i> 首頁 </a>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a><i class="fa fa-plus"></i> 新增/刪除項目 <span class="fa fa-chevron-down"></span></a>
                  <ul class="nav child_menu">
                    <li><a data-toggle="modal" data-target="#new_area_Modal">新增場域</a></li>
                    <li><a data-toggle="modal" data-target="#new_group_Modal">新增感應器群組</a></li>
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
                <li><a href="log_list.php?checker=<?= $_SESSION["ownerId"] ?>"><i class="fa fa-calendar"></i> 日誌系統 </a>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a data-toggle="modal" data-target="#Setting_Modal"><i class="fa fa-cog"></i> 使用者設定 </a>
                </li>
              </ul>
              <ul class="nav side-menu">
                <li><a onclick="del()" href="http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:8080/login.html"><i class="fa fa-sign-out"></i> 使用者登出 </a>
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
        <?php
              function view_log($url){
                  $ch			= curl_init();
                  $options    = array(
                                          CURLOPT_URL				=>    $url,
                                          // CURLOPT_HEADER			=>    false,
                                          CURLOPT_RETURNTRANSFER  =>    true,
                                          CURLOPT_CUSTOMREQUEST   =>    "GET", //啟用GET
                                          CURLOPT_HTTPHEADER      =>    array('Content-Type: application/json')
                                      );
                  
                  curl_setopt_array($ch,$options) ; //把陣列放入設定
                  $result = curl_exec($ch); //開始執行
                  curl_close($ch);
                  return $result;
              }

              function view_file($url){
                $ch			= curl_init();
                $options    = array(
                                        CURLOPT_URL				=>    $url,
                                        // CURLOPT_HEADER			=>    false,
                                        CURLOPT_RETURNTRANSFER  =>    true,
                                        CURLOPT_CUSTOMREQUEST   =>    "GET", //啟用get
                                        CURLOPT_HTTPHEADER      =>    array('Content-Type: octet-stream')
                                        // CURLOPT_POSTFIELDS		=>    $data
                                    );
                
                curl_setopt_array($ch,$options) ; //把陣列放入設定
                $result = curl_exec($ch); //開始執行
                curl_close($ch);
                return $result;
              }
              $ownerId = $_GET["ownerId"];
              $timestamp = $_GET["timestamp"];
              $str = view_log("http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/api/search/log/ownerId/$ownerId");
              
              $str = json_decode($str);  
              for($i=0;$i<count($str->Items);$i++){
                  if($str->Items[$i]->timestamp==$timestamp){
        ?>
          <div class="right">
            <a href="log_list.php?checker=<?=$ownerId?>" class="btn btn-primary" role="button">
              <span class="glyphicon glyphicon-home"></span>回日誌列表
            </a>
          </div>
          <div>
              <h1>查看日誌資訊</h1>
              <table border="3" width="1000px">
                  <colgroup span="1" bgcolor="F2F2F2"></colgroup>
                  <colgroup span="1" bgcolor="F9F9F9"></colgroup>
                  <tr>
                      <td width="20%" align="right"><h3>記錄者:</h3></td>
                      <td align="center"><h3><?= $str->Items[$i]->author ?></h3></td>
                  </tr>
                  <tr>
                      <td width="20%" align="right"><h3>場域:</h3></td>
                      <td align="center"><h3><?= $str->Items[$i]->area ?></h3></td>
                  </tr>
                  <tr>
                      <td width="20%" align="right"><h3>作物:</h3></td>
                      <td align="center"><h3><?= $str->Items[$i]->crop ?></h3></td>
                  </tr>
                  <tr>
                      <td width="20%" align="right"><h3>工作事項:</h3></td>
                      <td align="center"><h3><?= $str->Items[$i]->type ?></h3></td>
                  </tr>
                  <tr>
                      <td width="20%" align="right"><h3>農機具:</h3></td>
                      <td align="center"><h3><?= $str->Items[$i]->machine ?></h3></td>
                  </tr>
                  <tr>
                      <td width="20%" align="right"><h3>病蟲害:</h3></td>
                      <td align="center"><h3><?= $str->Items[$i]->diseases ?></h3></td>
                  </tr>
                  <tr>
                      <td width="20%" align="right"><h3>備忘錄:</h3></td>
                      <td align="center"><h3><?= $str->Items[$i]->memo ?></h3></td>
                  </tr>
                  <tr>
                      <td width="20%" align="right"><h3>記錄時間:</h3></td>
                      <td align="center"><h3><?= date("Y/m/d H:i:s",$str->Items[$i]->set_time) ?></h3></td>
                  </tr>

                  <?php
                        $files = $str->Items[$i]->files;
                        $image_num = 1;
                        $video_num = 1;
                        if(!empty($files)){
                          for($j=0;$j<count($files);$j++){
                            $name_part = explode(".",$files[$j]);
                            $form = $name_part[1];
                            if(strtolower($form)=="jpeg" || strtolower($form)=="jpg" || strtolower($form)=="png"){
                  ?>
                  <tr>
                      <td width="20%" align="right"><h3>照片<?= $image_num ?>:</h3></td>
                      <td align="center">
                        <?php 
                            $result = urlencode($files[$j]);
                            $rawData = view_file("http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/api/search/file/$ownerId/$timestamp/$result");
                            if(strtolower($form)=="jpeg" || strtolower($form)=="jpg"){
                              echo "<img width='800px' height='500px' src='data:image/jpeg;base64, $rawData' />";
                            }else{
                              echo "<img width='800px' height='500px' src='data:image/png;base64, $rawData' />";
                            }
                            $image_num++;
                        ?>
                      </td>
                  </tr>
          
                  <?php
                            }elseif(strtolower($form)=="mp4"){
                  ?>
                      <tr>
                        <td width="20%" align="right"><h3>影片<?= $video_num ?>:</h3></td>
                        <td align="center">
                          <?php 
                              $result = urlencode($files[$j]);
                              $rawData = view_file("http://ec2-13-125-253-199.ap-northeast-2.compute.amazonaws.com:3000/api/search/file/$ownerId/$timestamp/$result");
                              // echo "<img width='800px' height='500px' src='data:image/png;base64, $rawData' />";
                              echo "<video width='800px' height='500px' controls>
                                <source src='data:video/mp4;base64, $rawData' />
                                影片載入錯誤，請重新整理.
                              </video>";
                              $video_num++;
                          ?>
                        </td>
                      </tr>
                  <?php            
                            }
                          }
                        }
                      }
                    }
                  ?>

                  
                  <!-- <?php
                      if(!empty($row["picture_url"])){
                          $imgs = explode(",",$row["picture_url"]);
                          for($i=0;$i<count($imgs);$i++){
                              
                  ?>
                  <tr>
                      <td width="30%" align="right"><h3>照片<?=$i+1?>:</h3></td>
                      <td align="center"><img src="http://localhost/LogSystem/<?=$imgs[$i]?>" alt="照片" width="500px" height="300px"></td>
                  </tr>
                  <?php
                          }
                      }
                  ?>
                  <?php
                      if(!empty($row["video_url"])){
                          $videos = explode(",",$row["video_url"]);
                          for($i=0;$i<count($videos);$i++){
                  ?>
                  <tr>
                      <td width="30%" align="right"><h3>影片<?=$i+1?>:</h3></td>
                      <td align="center">
                          <video width="500px" height="300px" controls>
                              <source src="http://localhost/LogSystem/<?=$videos[$i]?>" type="video/mp4">
                              影片
                          </video>
                      </td>
                  </tr>
                  <?php
                          }
                      }
                  ?> -->
              </table>
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
                  場域名稱:<br>
                  <input type="text" id="new_area_name">
                  <br><br>
                  場域位置:<br>
                  <input type="text" id="new_area_location">
                  <br><br>
                  場域地圖:<br>
                  <input type="text" id="new_area_map">
                  <br><br>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-success" data-dismiss="modal" onclick="add_area()">Add</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
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
                  感測器群組名稱:<br>
                  <input type="text" id="new_group_name">
                  <br><br>
                  感測器群組描述:<br>
                  <input type="text" id="new_group_description">
                  <br><br>
                  作物種類：<br>
                  <select required="required" id="new_group_product">
                    <option value="Green_Onion">蔥</option>
                    <option value="Others">其他</option>
                  </select>
                  <br><br> 建制於場域:<br>
                  <select required="required" id="group_select" onchange="group_select_func(value);">
                  </select>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-success" data-dismiss="modal" onclick="add_group()">Add</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
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
                <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="settings()">Admit</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
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
                <button type="button" class="btn btn-danger" data-dismiss="modal" onclick="del_from_db()">Delete</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- jQuery -->
      <!-- Bootstrap -->
      <script src="vendors/bootstrap/dist/js/bootstrap.min.js"></script>
      <!-- FastClick -->
      <script src="vendors/fastclick/lib/fastclick.js"></script>
      <!-- NProgress -->
      <script src="vendors/nprogress/nprogress.js"></script>
      <!-- Chart.js -->
      <script src="vendors/Chart.js/dist/Chart.min.js"></script>
      <!-- gauge.js -->
      <script src="vendors/gauge.js/dist/gauge.min.js"></script>
      <!-- bootstrap-progressbar -->
      <script src="vendors/bootstrap-progressbar/bootstrap-progressbar.min.js"></script>
      <!-- iCheck -->
      <script src="vendors/iCheck/icheck.min.js"></script>
      <!-- Skycons -->
      <script src="vendors/skycons/skycons.js"></script>
      <!-- Flot -->
      <script src="vendors/Flot/jquery.flot.js"></script>
      <script src="vendors/Flot/jquery.flot.pie.js"></script>
      <script src="vendors/Flot/jquery.flot.time.js"></script>
      <script src="vendors/Flot/jquery.flot.stack.js"></script>
      <script src="vendors/Flot/jquery.flot.resize.js"></script>
      <!-- Flot plugins -->
      <script src="vendors/flot.orderbars/js/jquery.flot.orderBars.js"></script>
      <script src="vendors/flot-spline/js/jquery.flot.spline.min.js"></script>
      <script src="vendors/flot.curvedlines/curvedLines.js"></script>
      <!-- DateJS -->
      <script src="vendors/DateJS/build/date.js"></script>
      <!-- JQVMap -->
      <script src="vendors/jqvmap/dist/jquery.vmap.js"></script>
      <script src="vendors/jqvmap/dist/maps/jquery.vmap.world.js"></script>
      <script src="vendors/jqvmap/examples/js/jquery.vmap.sampledata.js"></script>
      <!-- bootstrap-daterangepicker -->
      <script src="vendors/moment/min/moment.min.js"></script>
      <script src="vendors/bootstrap-daterangepicker/daterangepicker.js"></script>
      <!-- ECharts -->
      <script src="vendors/echarts/dist/echarts.min.js"></script>

      <!-- Custom Theme Scripts -->
      <script src="build/js/custom.js"></script>
      <!-- Scripts by CTL -->
      <script src="build/js/cookie.js"></script>
</body>

</html>

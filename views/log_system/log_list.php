<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!-- Meta, title, CSS, favicons, etc. -->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>NTHU智慧農業平台</title>
  <link rel="Shortcut Icon" type="image/x-icon" href="../images/agronomy.ico">

  <!-- Bootstrap -->
  <link href="../vendors/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="../vendors/bootstrap/dist/js/bootstrap.min.js" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="../vendors/font-awesome/css/font-awesome.min.css" rel="stylesheet">
  <!-- Font Awesome v4.7 -->
  <link href="../vendors/font-awesome-4.7.0/css/font-awesome.min.css" rel="stylesheet">
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

  <!-- bootstrap-daterangepicker -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-daterangepicker/3.0.3/daterangepicker.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-daterangepicker/3.0.3/moment.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-daterangepicker/3.0.3/daterangepicker.js"></script>

  <!--使用JS-XLSX操作xlsx-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.2/xlsx.full.min.js"></script>

  <!--使用FileSaver下載資料成為檔案-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js"></script>

  <!-- Scripts -->
  <script src="../build/js/sidebar.js"></script>
  <script src="../build/js/area_page.js"></script>
  <script src="../build/js/loading.js"></script>
  <script src="../build/js/config.js"></script>
  <script src="js/export_logs.js"></script>

  <!-- css -->
  <link rel="stylesheet" href="mystyle.css">
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
    $_SESSION["ownerId"] = $_GET["checker"];
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
            <?php
                $ownerId = $_GET["checker"];
            ?>
            <div class="container">
                <h1 class="text">日誌列表</h1>
                <a href="insert_log.php?ownerId=<?= $ownerId ?>" class="btn btn-primary">
                    <span class="glyphicon glyphicon-plus"></span>新增日誌
                </a>
                <div style="float: right">
                  <button type="button" class="btn btn-success" data-toggle="modal" data-target="#export_logs">
                    <span class="glyphicon glyphicon-share"></span>&nbsp;匯出日誌
                  </button>
                </div>
            </div>
            <!-- 調整月份 -->
            <form>
            <div style="width: 450px">
              <div class="form-group col-md-6 col-sm-6 col-xs-6">
                <label for="month"><h4>查詢年份:</h4></label>
                <select class="form-control" id="select_year">
                </select>
              </div>

              <div class="form-group col-md-6 col-sm-6 col-xs-6">
                <label for="month"><h4>查詢月份:</h4></label>
                <select class="form-control" id="select_month">
                  <option value="1">1月</option>
                  <option value="2">2月</option>
                  <option value="3">3月</option>
                  <option value="4">4月</option>
                  <option value="5">5月</option>
                  <option value="6">6月</option>
                  <option value="7">7月</option>
                  <option value="8">8月</option>
                  <option value="9">9月</option>
                  <option value="10">10月</option>
                  <option value="11">11月</option>
                  <option value="12">12月</option>
                </select>
              </div>
            </div>
            </form>
            
            <script>
              $(document).ready(function(){
                var d = new Date();
                for(let i=2018;i<=d.getFullYear();i++){
                  $("#select_year").append("<option value="+ i +">"+ i +"年</option>");
                }

                $("#select_year").val(d.getFullYear());
                $("#select_month").val(d.getMonth()+1);
                $("#select_month,#select_year").change(function(){
                  $("#list").empty();
                  $("#noData").remove();
                  $.ajax({
                    type: "POST",
                    url: "adjust_date.php",
                    data: {
                      ownerId: "<?= $ownerId ?>",
                      year: $("#select_year").val(),
                      month: $("#select_month").val()
                    },
                    success: function(result){
                      // alert(result);
                      var data = JSON.parse(result);
                      $("#list").append('<tr style="background-color: #CCDDFF"><th width="15%">場域</th><th width="15%">作物</th><th width="15%">工作項目</th><th width="15%">日期</th><th>功能</th></tr>');
                      if(data.length == 0){
                        $("#list").after("<div id='noData' style='text-align: center;font-size: 25px;color: red'>目前尚無資料</div>");
                      }
                      for(let i=0;i<data.length;i++){
                        // console.log(data[i].area);
                        var date = new Date(Number(data[i].set_time * 1000));
                        var month = (Number(date.getMonth()+1) < 10 ? '0' : '')+(date.getMonth()+1);
                        var day = (Number(date.getDate()) < 10 ? '0' : '')+date.getDate();
                        //工作事項用圖來顯示
                        if(data[i].type == "灌溉"){
                          var type_imgORname = '<img src="../images/irrigation.png">';
                        }else if(data[i].type == "定植"){
                          var type_imgORname = '<img src="../images/field_planting.png">';
                        }else if(data[i].type == "播種"){
                          var type_imgORname = '<img src="../images/sowing.png">';
                        }else if(data[i].type == "施肥"){
                          var type_imgORname = '<img src="../images/fertilize.png">';
                        }else{
                          var type_imgORname = "";
                        }
                        
                        var type_html = type_imgORname + "<div style='text-align: center;width: 50px'>" + data[i].type + "</div>";
                        //作物沒資料就顯示"未設定作物名稱"
                        if(typeof(data[i].crop) == "undefined"){
                          var crop = "未設定作物名稱";
                        }else{
                          var crop = data[i].crop;
                        }

                        $("#list").append("<tr><td>" + data[i].area + "</td><td>" + crop + "</td>" + 
                        "<td>" + type_html + "</td><td>" + month + "/" + day + "</td>" + 
                        "<td><a href='view_log.php?ownerId=" + "<?= $ownerId ?>" + "&timestamp=" + data[i].timestamp + "' class='btn btn-success'>" + 
                        "<span class='glyphicon glyphicon-search'></span>查看</a>" + 
                        "<a href='edit_log.php?ownerId=" + "<?= $ownerId ?>" + "&timestamp=" + data[i].timestamp + "' class='btn btn-primary'>" + 
                        "<span class='glyphicon glyphicon-pencil'></span>編輯</a>" + 
                        "<a href='delete_log.php?ownerId=" + "<?= $ownerId ?>" + "&timestamp=" + data[i].timestamp + "' class='btn btn-danger' onClick='return check();'>" + 
                        "<span class='glyphicon glyphicon-remove'></span>刪除</a></td></tr>");
                      }
                    }
                  })
                });
                  
              });
            </script>

            <div style="margin-top: 20px">
                <div class="container">
                    <table class="table table-hover" id="list">
                        <tr style="background-color: #CCDDFF">
                            <th width="15%">場域</th>
                            <th width="15%">作物</th>
                            <th width="15%">工作項目</th>
                            <th width="15%">日期</th>
                            <th>功能</th>
                        </tr>
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
                                                                                      ),
                                                    );
                                
                                curl_setopt_array($ch,$options) ; //把陣列放入設定
                                $result = curl_exec($ch); //開始執行
                                curl_close($ch);
                                return $result;
                            }
                            $str = view_log($public['api_url']."api/search/log/ownerId/$ownerId");
            
                            $str = json_decode($str);
                            // echo count($str->Items);
                            for($i=0;$i<count($str->Items);$i++){
                                $year = substr(date("Y/m/d H:i:s",$str->Items[$i]->set_time), 0, 4);
                                $month = substr(date("Y/m/d H:i:s",$str->Items[$i]->set_time), 5, 2);
                                
                                if($str->Items[$i]->visible==1 && $month==date("m") && $year==date("Y")){
                        ?>
                        <tr>
                            <td><?= $str->Items[$i]->area ?></td>
                            <td><?= $str->Items[$i]->crop ?></td>
                            <td><?php
                              if($str->Items[$i]->type == "灌溉"){
                                $type_imgORname = '<img src="../images/irrigation.png">';
                              }else if($str->Items[$i]->type == "定植"){
                                $type_imgORname = '<img src="../images/field_planting.png">';
                              }else if($str->Items[$i]->type == "播種"){
                                $type_imgORname = '<img src="../images/sowing.png">';
                              }else if($str->Items[$i]->type == "施肥"){
                                $type_imgORname = '<img src="../images/fertilize.png">';
                              }else{
                                $type_imgORname = "";
                              }

                              echo $type_imgORname;
                              echo "<div style='text-align: center;width: 50px' >";
                              echo $str->Items[$i]->type;
                              echo "</div>";
                             ?>
                            </td>
                            <td><?= substr(date("Y/m/d H:i:s",$str->Items[$i]->set_time), 5, 5) ?></td>
                            <td>
                                <a href="view_log.php?ownerId=<?= $ownerId ?>&timestamp=<?= $str->Items[$i]->timestamp ?>" class="btn btn-success">
                                    <span class="glyphicon glyphicon-search"></span>查看
                                </a>
                                <a href="edit_log.php?ownerId=<?= $ownerId ?>&timestamp=<?= $str->Items[$i]->timestamp ?>" class="btn btn-primary">
                                    <span class="glyphicon glyphicon-pencil"></span>編輯
                                </a>
                                <a href="delete_log.php?ownerId=<?= $ownerId ?>&timestamp=<?= $str->Items[$i]->timestamp ?>" class="btn btn-danger" onClick="return check();">
                                    <span class="glyphicon glyphicon-remove"></span>刪除
                                </a>
                            </td>
                        </tr>
                        <?php
                                }
                            }
                        ?>
                    </table>
                </div>
            </div>
        </div>
      </div>


      <!-- /page content -->
      <div class="container">
        <div class="modal fade" id="export_logs" role="dialog">
          <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">匯出日誌</h4>
              </div>
              
                <div class="modal-body">
                  <!-- <form action="export_logs.php" method="post"> -->
                      <span style="color: red">*&nbsp;</span>選擇要匯出的時間範圍:<br>
                      <div class="input-prepend input-group" style="width: 60%">
                          <span class="add-on input-group-addon"><i class="glyphicon glyphicon-calendar fa fa-calendar"></i></span>
                          <input id="daterange_picker" type="text" class="form-control" name="daterange_picker" value="" />
                      </div>
                      <span style="color: red">*&nbsp;</span>檔案名稱: <br>
                      <input type="text" name="filename" size="40" id="filename" placeholder="輸入檔名(不用加副檔名)"><br>
                      <input type="hidden" name="ownerId" id="export_id" value="<?= $ownerId ?>"><br>
                      <input type="hidden" name="fromDate" id="fromDate">
                      <input type="hidden" name="toDate" id="toDate">
                      <!-- <input type="submit" value="匯出Excel"> -->
                  <!-- </form> -->
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                  <button type="submit" class="btn btn-success" data-dismiss="modal" onclick="export_logs()">匯出Excel</button>
                </div>

              <script>
                $('input[name="daterange_picker"]').daterangepicker({
                    timePicker: true,
                    timePickerIncrement: 5,
                    locale: {
                        format: 'MM/DD/YYYY HH:mm'
                    }
                });

                $('#daterange_picker').on('apply.daterangepicker', function(ev, picker) {
                    
                    var fromDate = new Date(picker.startDate.format('YYYY-MM-DD HH:mm'));
                    var fromEpoch = fromDate.getTime();
                    var toDate = new Date(picker.endDate.format('YYYY-MM-DD HH:mm'));
                    var toEpoch = toDate.getTime();

                    document.getElementById("fromDate").value = fromEpoch;
                    document.getElementById("toDate").value = toEpoch;
                });
              </script>

            </div>
          </div>
        </div>
      </div>

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

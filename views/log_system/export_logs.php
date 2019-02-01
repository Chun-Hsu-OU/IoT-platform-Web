<?php
require 'vendor/autoload.php';

// 引入 namespace
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

//設定時區
date_default_timezone_set('Asia/Taipei');

//引入api_url
$public = include('config.php');

// function console_log( $data ){
//     echo '<script>';
//     echo 'console.log('. json_encode( $data ) .')';
//     echo '</script>';
// }

function logs_in_daterange($url){
    $ch			= curl_init();
    $options    = array(
                            CURLOPT_URL				=>    $url,
                            CURLOPT_RETURNTRANSFER  =>    true,
                            CURLOPT_CUSTOMREQUEST   =>    "GET", //啟用GET
                            CURLOPT_HTTPHEADER      =>    array('Content-Type: application/json',
                                                                // 'token: '.$_COOKIE['token']
                                                                'token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkdGltZSI6MTU0NDU5NTI1OTA3MCwidXVpZCI6ImQ1YmU5NWMxLTRiODQtNGI0OS04MmViLTI5YTRiYTdiYjUyMSIsInBhc3N3b3JkIjoid2VsbHMiLCJlbWFpbCI6IndlbGxzIiwibWFuYWdlZCI6MSwibmFtZSI6IndlbGxzIiwiaWF0IjoxNTQ5MDMwODQ3LCJleHAiOjE1NDkxMTcyNDd9.Xt3aANf45HvXVZAHpXZCAdWMGKsFcaotU0Kixybrvig'
                                                            ),
                        );
    
    curl_setopt_array($ch,$options) ; //把陣列放入設定
    $result = curl_exec($ch); //開始執行
    curl_close($ch);
    return $result;
}

// 创建
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// 取得相關參數(使用者id、匯出日誌開始時間、匯出日誌結束時間)
$ownerId = $_POST["ownerId"];
$fromDate = $_POST["fromDate"];
$toDate = $_POST["toDate"];

// console_log($public['api_url']);
// console_log($_COOKIE['token']);
// console_log($_POST["ownerId"]);
// console_log($_POST["fromDate"]);
// console_log($_POST["toDate"]);

// 取得檔案名稱
$fileName = $_POST["filename"].".xlsx";
// $fileName = "測試.xlsx";

//將查到的日誌一列一列寫到excel
$sheet->setCellValueByColumnAndRow(1, 1, '記錄者');
$sheet->setCellValueByColumnAndRow(2, 1, '場域');
$sheet->setCellValueByColumnAndRow(3, 1, '作物');
$sheet->setCellValueByColumnAndRow(4, 1, '工作事項');
$sheet->setCellValueByColumnAndRow(5, 1, '農機具');
$sheet->setCellValueByColumnAndRow(6, 1, '病蟲害');
$sheet->setCellValueByColumnAndRow(7, 1, '備忘錄');
$sheet->setCellValueByColumnAndRow(8, 1, '記錄時間');

$str = logs_in_daterange($public['api_url']."api/export/log/$ownerId/$fromDate/$toDate");
// $str = logs_in_daterange($public['api_url']."api/export/log/557f27e1-e918-41dd-b044-f431b718b0e1/1535731200000/1538319600000");
// echo $str;
$logs = json_decode($str);
for($i=0;$i<count($logs->Items);$i++){
    $sheet->setCellValueByColumnAndRow(1, $i+2, $logs->Items[$i]->author);
    $sheet->setCellValueByColumnAndRow(2, $i+2, $logs->Items[$i]->area);
    $sheet->setCellValueByColumnAndRow(3, $i+2, $logs->Items[$i]->crop);
    $sheet->setCellValueByColumnAndRow(4, $i+2, $logs->Items[$i]->type);
    $sheet->setCellValueByColumnAndRow(5, $i+2, $logs->Items[$i]->machine);
    $sheet->setCellValueByColumnAndRow(6, $i+2, $logs->Items[$i]->diseases);
    $sheet->setCellValueByColumnAndRow(7, $i+2, $logs->Items[$i]->memo);
    $sheet->setCellValueByColumnAndRow(8, $i+2, date("Y/m/d H:i:s",$logs->Items[$i]->set_time));
}

//告诉浏览器输出07Excel文件
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//告诉浏览器输出文件名称
header('Content-Disposition: attachment;filename="'.$fileName.'"');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
?>
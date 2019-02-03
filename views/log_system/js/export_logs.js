function export_logs(){
    // 取得相關參數(使用者id、匯出日誌開始時間、匯出日誌結束時間)
    var ownerId = document.getElementById("export_id").value;
    var fromDate = document.getElementById("fromDate").value;
    var toDate = document.getElementById("toDate").value;

    //檔名
    var filename = document.getElementById("filename").value + '.xlsx';

    //表名
    var sheetname = '日誌資料';

    //API抓一段時間的日誌資料
    var logs = httpGet(api_url + "api/export/log/" + ownerId + "/" + 
                        fromDate + "/" + toDate + "?token=" + token);
    logs = JSON.parse(logs);

    //將每一筆資料放入陣列
    var data = [];
    data[0] = ['記錄者', '場域', '作物', '工作事項', '農機具', '病蟲害', '備忘錄', '記錄時間'];
    for(let i=0; i<logs.Items.length; i++){
        var temp = [];
        temp.push(logs.Items[i].author);
        temp.push(logs.Items[i].area);
        temp.push(logs.Items[i].crop);
        temp.push(logs.Items[i].type);
        temp.push(logs.Items[i].machine);
        temp.push(logs.Items[i].diseases);
        temp.push(logs.Items[i].memo);
        temp.push(timeConverter(logs.Items[i].set_time));

        //一筆資料整理好就加進去
        data.push(temp);
    }

    // console.log("api_url: "+api_url);
    // console.log("token: "+token);
    // console.log("filename: "+filename);
    // console.log("ownerId: "+document.getElementById("export_id").value);
    // console.log("from: "+document.getElementById("fromDate").value);
    // console.log("to: "+document.getElementById("toDate").value);

    //下載
    downloadxlsx(filename, sheetname, data);
}

function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function timeConverter(unix_timestamp){
    var date = new Date(unix_timestamp * 1000);

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    var str = date.getFullYear() + "-" + month + "-" + day + " " +  hour + ":" + min + ":" + sec;

    return str;
}

function downloadxlsx(filename, sheetname, data) {
    //儲存xlsx檔

    //參數
    //filename為要下載儲存之xlsx檔名，，sheetname為資料表名，data為要下載之資料，需為二維陣列。以下為使用範例：
    //var filename = 'download.xlsx';
    //var sheetname = 'test';
    //var data = [
    //    ['name', 'number', 'date'],
    //    ['abc', 1, new Date().toLocaleString()],
    //    ['def', 123.456, new Date('2015-03-25T13:30:12Z')],
    //];
    //downloadxlsx(filename, sheetname, data);

    //說明
    //所使用函式可參考js-xlsx的GitHub文件[https://github.com/SheetJS/js-xlsx]


    //datenum
    function datenum(v, date1904) {
        if (date1904) v += 1462;
        var epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }


    //sheet_from_array_of_arrays
    function sheet_from_array_of_arrays(data, opts) {
        var ws = {};
        var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
        for (var R = 0; R != data.length; ++R) {
            for (var C = 0; C != data[R].length; ++C) {
                if (range.s.r > R) range.s.r = R;
                if (range.s.c > C) range.s.c = C;
                if (range.e.r < R) range.e.r = R;
                if (range.e.c < C) range.e.c = C;
                var cell = { v: data[R][C] };
                if (cell.v == null) continue;
                var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                }
                else cell.t = 's';

                ws[cell_ref] = cell;
            }
        }
        if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
    }


    //s2ab
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }


    //Workbook
    function Workbook() {
        if (!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }


    //write
    var wb = new Workbook();
    var ws = sheet_from_array_of_arrays(data);
    wb.SheetNames.push(sheetname);
    wb.Sheets[sheetname] = ws;
    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });


    //saveAs
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), filename)


}

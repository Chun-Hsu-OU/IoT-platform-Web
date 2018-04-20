var Type_graph = echarts.init(document.getElementById('SensorType_graph'));
var Work_graph = echarts.init(document.getElementById('Sensor_working'));
var Data_flow = echarts.init(document.getElementById('Sensor_flow'));

var uuid = getCookie("checker");
var api_url = 'http://localhost:3000/';
var Type = ['LIGHT_INTENSITY', 'CO2', 'AIR_HUMIDITY', 'AIR_TEMPERATURE', 'SOIL_TEMPERATURE'];
var num = [0, 0, 0, 0, 0];

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function make_count() {
  $.get(api_url + 'api/sensors_owned/' + uuid, function(data) {
    var body = JSON.parse(data);
    body.Items.forEach(function make(item) {
      if (item.visible == 1) {
        for (i = 0; i < Type.length; i++) {
          if (item.sensorType == Type[i]) {
            num[i]++;
          }
        }
      }
    });
    num = [1, 1, 1, 1, 1];

    option = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data: Type
      },
      series: [{
        name: '感測器種類',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false,
            position: 'center'
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '15',
              fontWeight: 'bold'
            }
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: [{
            value: num[0],
            name: Type[0]
          },
          {
            value: num[1],
            name: Type[1]
          },
          {
            value: num[2],
            name: Type[2]
          },
          {
            value: num[3],
            name: Type[3]
          },
          {
            value: num[4],
            name: Type[4]
          }
        ]
      }]
    };
    Type_graph.setOption(option);
  });
}

function sensors_working() {
  option1 = {
    tooltip: {
      formatter: "{a} <br/>{b} : {c}%"
    },
    series: [{
      name: '正常率',
      type: 'gauge',
      detail: {
        formatter: '{value}%'
      },
      data: [{
        value: 100,
        name: '正常率'
      }]
    }]
  };

  setInterval(function() {
    Work_graph.setOption(option1, true);
  }, 2000);
}

function dataflow() {
  option2 = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: Type
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
    },
    series: [{
        name: Type[0],
        type: 'bar',
        stack: '總流量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [320, 302, 301, 334, 390, 330, 320]
      },
      {
        name: Type[1],
        type: 'bar',
        stack: '總流量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: Type[2],
        type: 'bar',
        stack: '總流量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [220, 182, 191, 234, 290, 330, 310]
      },
      {
        name: Type[3],
        type: 'bar',
        stack: '總流量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [150, 212, 201, 154, 190, 330, 410]
      },
      {
        name: Type[4],
        type: 'bar',
        stack: '總流量',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: [820, 832, 901, 934, 1290, 1330, 1320]
      }
    ]
  };

  Data_flow.setOption(option2);
}

sensors_working();
make_count();
dataflow();

import * as echarts from 'echarts';



var chartDom = document.getElementById('echart-candlestick');
var myChart = echarts.init(chartDom);
var option;
let data = [];


const upColor = '#00da3c';
const downColor = '#ec0000';

function splitData(dataObject) {
  let categoryData = [];
  let values = [];
  let volumes = [];
  let rawData = dataObject[0].values;  // Extracting the 'values' array from the data object


    for (let i = 0; i < rawData.length; i++) {
        let onetimestamp = rawData[i][0].split(' ')[0];  // The date is the first element
        let open = rawData[i][1];  // The 'Open' value
        let high = rawData[i][2];  // The 'High' value
        let low = rawData[i][3];  // The 'Low' value
        let close = rawData[i][4];  // The 'Close' value
        let volume = rawData[i][5];  // The 'Volume' value

        categoryData.push(onetimestamp);  // Add the date to categoryData
        values.push([open, high, low, close]);  // Add the price points to values
        volumes.push([i, volume, open > close ? 1 : -1]);  // Add the volume information to volumes
    

        volumes.push([i, volume, open > close ? 1 : -1]);  // Add the volume information to volumes
    }
    
    return {
      categoryData: categoryData,
        values: values,
        volumes: volumes
    };
}
function calculateMA(dayCount, data) {
  var result = [];
  for (var i = 0, len = data.values.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-');
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      sum += data.values[i - j][1];
    }
    result.push(+(sum / dayCount).toFixed(3));
  }
  return result;
}


export function updateResults(rawData){
  data = splitData(rawData);
  configureChart()
}

export function configureChart(){
console.log("Configuring Echart")
myChart.setOption(
  (option = {
    animation: false,
    legend: {
      bottom: 10,
      left: 'center',
      data: ['OHLC', 'MA5', 'MA10', 'MA20', 'MA30']
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      textStyle: {
        color: '#000'
      },
      position: function (pos, params, el, elRect, size) {
        const obj = {
          top: 10
        };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      }
      // extraCssText: 'width: 170px'
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: 'all'
        }
      ],
      label: {
        backgroundColor: '#777'
      }
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false
        },
        brush: {
          type: ['lineX', 'clear']
        }
      }
    },
    brush: {
      xAxisIndex: 'all',
      brushLink: 'all',
      outOfBrush: {
        colorAlpha: 0.1
      }
    },
    visualMap: {
      show: false,
      seriesIndex: 5,
      dimension: 2,
      pieces: [
        {
          value: 1,
          color: downColor
        },
        {
          value: -1,
          color: upColor
        }
      ]
    },
    grid: [
      {
        left: '10%',
        right: '8%',
        height: '50%'
      },
      {
        left: '10%',
        right: '8%',
        top: '63%',
        height: '16%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: data.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        axisPointer: {
          z: 100
        }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: data.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true
        }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        top: '85%',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: 'OHLC',
        type: 'candlestick',
        data: data.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: undefined,
          borderColor0: undefined
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: calculateMA(5, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: calculateMA(10, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: calculateMA(20, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'MA30',
        type: 'line',
        data: calculateMA(30, data),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        }
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.volumes
      }
    ]
  }),
  true
);
myChart.dispatchAction({
  type: 'brush',
  areas: [
    {
      brushType: 'lineX',
      coordRange: ['2020-01-01', '2020-12-30'],
      xAxisIndex: 0
    }
  ]
});
}
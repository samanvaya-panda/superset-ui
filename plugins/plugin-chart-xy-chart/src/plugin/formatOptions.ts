import { EChartsOption } from 'echarts';

function handleSeries(optionSeries: any, echartSeries: any, index: string = 'value') {
  echartSeries.forEach((item: { [x: string]: any }) => {
    optionSeries.forEach((option: { [x: string]: any }) => {
      if (item[index] === option[index]) {
        for (var op in option) {
          item[op] = option[op];
        }
      }
    });
  });
}

function handleOption(customOption: any, echartOption: any) {
  for (var option in customOption) {
    if (!(option in echartOption)) {
      echartOption[option] = customOption[option];
    } else if (option === 'data') {
      if ('type' in echartOption) handleSeries(customOption[option], echartOption[option]);
      else handleSeries(customOption[option], echartOption[option], 'name');
    }
  }
}

export function formatOptions(options: string, echartOptions: EChartsOption) {
  console.log('formatOptions', options);
  if (options === '' || options === undefined) return echartOptions;

  const customOptions = JSON.parse(options);

  for (var option in customOptions) {
    console.log(option);
    switch (option) {
      case 'series':
        handleSeries(customOptions[option], echartOptions[option], 'name');
        break;
      case 'xAxis':
        handleOption(customOptions[option], echartOptions[option]);
        break;
      case 'yAxis':
        handleOption(customOptions[option], echartOptions[option]);
        break;
      case 'legend':
        handleOption(customOptions[option], echartOptions[option]);
      default:
        echartOptions[option] = customOptions[option];
        console.log('default');
        break;
    }
  }
  console.log(echartOptions);
  return echartOptions;
}

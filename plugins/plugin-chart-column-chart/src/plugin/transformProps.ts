/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  CategoricalColorNamespace,
  DataRecordValue,
  getMetricLabel,
  getNumberFormatter,
  getTimeFormatter,
  NumberFormats,
  NumberFormatter,
} from '@superset-ui/core';
import { CallbackDataParams } from 'echarts/types/src/util/types';
import { EChartsOption, BarSeriesOption } from 'echarts';
import {
  DEFAULT_FORM_DATA as DEFAULT_PIE_FORM_DATA,
  EchartsPieChartProps,
  EchartsPieFormData,
  EchartsPieLabelType,
  PieChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';
import {
  extractGroupbyLabel,
  getChartPadding,
  getColtypesMapping,
  getLegendProps,
} from '../utils/series';
import { defaultGrid, defaultTooltip } from '../defaults';

//Rendering of labels

export function formatLabel({
  params,
  labelType,
  numberFormatter,
}: {
  params: CallbackDataParams;
  labelType: EchartsPieLabelType;
  numberFormatter: NumberFormatter;
}): string {
  const { name = '', value } = params;
  const formattedValue = numberFormatter(value as number);

  switch (labelType) {
    case EchartsPieLabelType.Key:
      return name;
    case EchartsPieLabelType.Value:
      return formattedValue;
    case EchartsPieLabelType.KeyValue:
      return `${name}: ${formattedValue}`;
    default:
      return name;
  }
}

export default function transformProps(chartProps: EchartsPieChartProps): PieChartTransformedProps {
  const { formData, height, hooks, filterState, queriesData, width } = chartProps;
  const { data = [] } = queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    colorScheme,
    groupby,
    legendMargin,
    legendOrientation,
    legendType,
    metric = '',
    stack,
    columns,
    numberFormat,
    dateFormat,
    showLabels,
    showLegend,
    showLabelsThreshold,
    emitFilter,
  }: EchartsPieFormData = { ...DEFAULT_LEGEND_FORM_DATA, ...DEFAULT_PIE_FORM_DATA, ...formData };

  console.log('columns', columns);
  console.log('groupby', groupby);
  // const metricsLabel = metrics.map(metric => getMetricLabel(metric));
  const metricLabel = getMetricLabel(metric);

  // const keys = data.map(datum =>
  //   extractGroupbyLabel({
  //     datum,
  //     groupby,
  //     coltypeMapping,
  //     timeFormatter: getTimeFormatter(dateFormat),
  //   }),
  // );
  const labelMap = data.reduce((acc: Record<string, DataRecordValue[]>, datum) => {
    const label = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    });
    return {
      ...acc,
      [label]: groupby.map(col => datum[col]),
    };
  }, {});

  const keys = Object.keys(labelMap);
  // console.log("keys", keys);
  // console.log("labelMap", Object.keys(labelMap));

  const breakdownMap = {};
  if (columns.length === 1) {
    data.forEach(datum => {
      var key = columns.map(col => datum[col]);
      if (!(key[0] in breakdownMap)) {
        breakdownMap[key[0]] = key;
      }
    });
  }

  console.log('Breakdown', breakdownMap);
  console.log('labelMap', labelMap);

  const { setDataMask = () => {} } = hooks;

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);
  const numberFormatter = getNumberFormatter(numberFormat);

  var transformedData;
  if (columns.length === 0) {
    const transformData = data.map(datum => {
      const name = extractGroupbyLabel({
        datum,
        groupby,
        coltypeMapping,
        timeFormatter: getTimeFormatter(dateFormat),
      });

      return {
        // value: metricsLabel.map(metricsLabel => datum[metricsLabel]),
        value: datum[metricLabel],
        name,
        itemStyle: {
          color: colorFn(name),
        },
      };
    });
    transformedData = transformData;
  } else if (columns.length === 1) {
    const transformData = {};
    data.forEach(datum => {
      var key = columns.map(col => datum[col])[0];
      if (!(key in transformData)) {
        transformData[key] = [];
      }
      transformData[key].push({
        value: datum[metricLabel],
        name: groupby.map(col => datum[col])[0],
        itemStyle: {
          color: colorFn(key),
        },
      });
    });
    transformedData = transformData;
  }

  const selectedValues = [];
  // console.log("data", transformedData[0].value);
  // const selectedValues = (filterState.selectedValues || []).reduce(
  //   (acc: Record<string, number>, selectedValue: string) => {
  //     const index = transformedData.findIndex(({ name }) => name === selectedValue);
  //     return {
  //       ...acc,
  //       [index]: selectedValue,
  //     };
  //   },
  //   {},
  // );

  // console.log("data", data);
  // console.log("transformedData", transformedData);

  const formatter = (params: CallbackDataParams) =>
    formatLabel({
      params,
      numberFormatter,
      labelType,
    });

  const defaultLabel = {
    formatter,
    show: showLabels,
    color: '#000000',
  };
  // const series: BarSeriesOption[] = [
  //   {
  //     type: 'bar',
  //     ...getChartPadding(showLegend, legendOrientation, legendMargin),
  //     animation: false,
  //     stack: 'total',
  //     label: {
  //       show: true,
  //     },
  //     emphasis: {
  //       label: {
  //         show: true,
  //         fontWeight: 'bold',
  //         backgroundColor: 'white',
  //       },
  //     },
  //     data: transformedData,
  //   },
  // ];

  // console.log(transformedData.name);
  console.log('data', data);
  console.log('transformedData', transformedData);
  const series: BarSeriesOption[] = [];
  if (columns.length) {
    for (var key in breakdownMap) {
      series.push({
        name: key,
        type: 'bar',
        ...getChartPadding(showLegend, legendOrientation, legendMargin),
        animation: false,
        stack,
        label: {
          show: true,
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: 'bold',
            backgroundColor: 'white',
          },
          // focus:'series',
        },
        data: transformedData[key],
      });
    }
  } else {
    series.push({
      name: metricLabel,
      type: 'bar',
      ...getChartPadding(showLegend, legendOrientation, legendMargin),
      animation: false,
      stack,
      label: {
        show: true,
      },
      emphasis: {
        label: {
          show: true,
          fontWeight: 'bold',
          backgroundColor: 'white',
        },
        // focus:'series',
      },
      data: transformedData,
    });
  }

  console.log('Series', series);
  //console.log("Legend", labelMap.keys());

  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    tooltip: {
      ...defaultTooltip,
      trigger: 'item',
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: keys,
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend),
      data: metricLabel,
    },
    series: series,
  };

  // console.log(echartOptions);

  return {
    formData,
    width,
    height,
    echartOptions,
    setDataMask,
    emitFilter,
    labelMap,
    groupby,
    selectedValues,
  };
}

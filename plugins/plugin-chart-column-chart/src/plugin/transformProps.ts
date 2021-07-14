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
  getTimeFormatter,
} from '@superset-ui/core';
import { EChartsOption, BarSeriesOption, DataZoomComponentOption } from 'echarts';
import {
  DEFAULT_FORM_DATA as DEFAULT_COLUMN_FORM_DATA,
  ColumnChartProps,
  FormData,
  TransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA, DEFAULT_LABEL_FORM_DATA } from '../types';
import {
  extractGroupbyLabel,
  getChartPadding,
  getColtypesMapping,
  getLegendProps,
} from '../utils/series';
import { defaultGrid, defaultTooltip } from '../defaults';

function parseRichLabel(value: string) {
  const splitArray = value.split(', ');
  return parseLabel(splitArray, '_');
}

function parseLabel(value: DataRecordValue[] | string[], sep: string = ', ') {
  var parsedString: string = '';
  value.forEach((label, index) => {
    if (index < 1) parsedString += label;
    else parsedString += sep + label;
  });
  return parsedString;
}

export default function transformProps(chartProps: ColumnChartProps): TransformedProps {
  const { formData, height, hooks, queriesData, filterState, width } = chartProps;
  const { data = [] } = queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);
  console.log(formData);
  const {
    colorScheme,
    groupby,
    legendMargin,
    legendOrientation,
    legendType,
    metric = '',
    stack,
    columns,
    dateFormat,
    // showLabels,
    showLegend,
    showLabel,
    labelName,
    isBold,
    labelColor,
    emitFilter,
    zoom,
    showNumber,
  }: FormData = {
    ...DEFAULT_LEGEND_FORM_DATA,
    ...DEFAULT_LABEL_FORM_DATA,
    ...DEFAULT_COLUMN_FORM_DATA,
    ...formData,
  };

  const metricLabel = getMetricLabel(metric);

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
  var seriesLabel: any = {};
  keys.forEach((key, index) => {
    seriesLabel[key] = index;
  });
  // console.log('seriesLabel', seriesLabel);

  var richLabels: any = {
    formatter: function (value: string) {
      return '{' + parseRichLabel(value) + '|' + value + '}';
    },
    rich: {},
  };

  // console.log("labelName", labelName);
  if (labelName && showLabel) {
    var richText: any = {};
    var unq_labels = labelName.split('; ');
    unq_labels.forEach(label => {
      richText[label] = {
        fontSize: 15,
        color: labelColor,
      };
      if (isBold) richText[label]['fontWeight'] = 'bold';
    });

    richLabels.rich = richText;
  }
  // console.log("richLabels", richLabels);
  // console.log("labelMap", Object.keys(labelMap));

  const breakdownMap: string[] = [];
  if (columns.length) {
    data.forEach(datum => {
      const key: string = parseLabel(columns.map(col => datum[col]));
      if (!breakdownMap.includes(key)) {
        breakdownMap.push(key);
      }
    });
  }

  // console.log('Breakdown', breakdownMap, Object.keys(breakdownMap).length);
  // console.log('labelMap', labelMap);

  const { setDataMask = () => {} } = hooks;

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  var transformedData: any = {};
  if (columns.length === 0) {
    const transformData: BarSeriesOption[] = data.map(datum => {
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
        // itemStyle: {
        //   color: colorFn(name),
        // },
      };
    });
    transformedData = transformData;
  } else {
    var transformData: any = {};
    data.forEach(datum => {
      const key: string = parseLabel(columns.map(col => datum[col]));
      if (!(key in transformData)) {
        transformData[key] = new Array(keys.length).fill(null);
      }
      const label: string = parseLabel(groupby.map(col => datum[col]));
      // console.log(key, label);
      transformData[key][seriesLabel[label]] = datum[metricLabel];
    });
    transformedData = transformData;
  }

  // var selectedValues: any;
  // console.log("data", transformedData[0].value);
  const selectedValues = (filterState.selectedValues || []).reduce(
    (acc: Record<string, number>, selectedValue: string) => {
      const index = transformedData.findIndex((name: string) => name === selectedValue);
      return {
        ...acc,
        [index]: selectedValue,
      };
    },
    {},
  );

  // console.log('transformedData', transformedData);
  // console.log('selectedValue', selectedValues);
  const series: BarSeriesOption[] = [];
  var legendData: any = [];

  if (columns.length) {
    breakdownMap.forEach(key => {
      // console.log(transformData[key]);
      series.push({
        name: key,
        itemStyle: {
          color: colorFn(key),
        },
        type: 'bar',
        ...getChartPadding(showLegend, legendOrientation, legendMargin),
        animation: false,
        stack,
        label: {
          show: showNumber,
        },
        emphasis: {
          // label: {
          //   show: true,
          //   fontWeight: 'bold',
          //   backgroundColor: 'white',
          // },
          // focus:'series',
        },
        data: transformedData[key],
      });
      legendData.push(key);
    });
  } else {
    series.push({
      name: metricLabel,
      type: 'bar',
      ...getChartPadding(showLegend, legendOrientation, legendMargin),
      animation: false,
      stack,
      label: {
        show: showNumber,
      },
      emphasis: {
        // label: {
        //   show: true,
        //   fontWeight: 'bold',
        //   backgroundColor: 'white',
        // },
        // focus:'series',
      },
      data: transformedData,
    });
    legendData = [metricLabel];
  }

  // console.log('legend', legendData);
  // console.log('series', series);

  const zoomIn: DataZoomComponentOption[] = [];
  if (zoom) {
    zoomIn.push(
      {
        id: 'dataZoomX',
        type: 'slider',
        xAxisIndex: [0],
        filterMode: 'filter',
      },
      {
        id: 'dataZoomY',
        type: 'slider',
        yAxisIndex: [0],
        filterMode: 'empty',
      },
    );
  }

  const echartOptions: EChartsOption = {
    dataZoom: zoomIn,
    grid: {
      ...defaultGrid,
    },
    tooltip: {
      ...defaultTooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: keys,
      axisLabel: richLabels,
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend),
      data: legendData,
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

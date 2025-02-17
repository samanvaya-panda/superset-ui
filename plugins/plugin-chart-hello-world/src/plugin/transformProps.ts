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

const percentFormatter = getNumberFormatter(NumberFormats.PERCENT_2_POINT);

export function formatPieLabel({
  params,
  labelType,
  numberFormatter,
}: {
  params: CallbackDataParams;
  labelType: EchartsPieLabelType;
  numberFormatter: NumberFormatter;
}): string {
  const { name = '', value, percent } = params;
  const formattedValue = numberFormatter(value as number);
  const formattedPercent = percentFormatter((percent as number) / 100);

  switch (labelType) {
    case EchartsPieLabelType.Key:
      return name;
    case EchartsPieLabelType.Value:
      return formattedValue;
    case EchartsPieLabelType.Percent:
      return formattedPercent;
    case EchartsPieLabelType.KeyValue:
      return `${name}: ${formattedValue}`;
    case EchartsPieLabelType.KeyValuePercent:
      return `${name}: ${formattedValue} (${formattedPercent})`;
    case EchartsPieLabelType.KeyPercent:
      return `${name}: ${formattedPercent}`;
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
    donut,
    groupby,
    innerRadius,
    labelsOutside,
    labelLine,
    labelType,
    legendMargin,
    legendOrientation,
    legendType,
    metric = '',
    numberFormat,
    dateFormat,
    outerRadius,
    showLabels,
    showLegend,
    showLabelsThreshold,
    emitFilter,
  }: EchartsPieFormData = { ...DEFAULT_LEGEND_FORM_DATA, ...DEFAULT_PIE_FORM_DATA, ...formData };
  const metricLabel = getMetricLabel(metric);
  const minShowLabelAngle = (showLabelsThreshold || 0) * 3.6;

  const keys = data.map(datum =>
    extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    }),
  );
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

  const { setDataMask = () => {} } = hooks;

  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);
  const numberFormatter = getNumberFormatter(numberFormat);

  const transformedData: BarSeriesOption[] = data.map(datum => {
    const name = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    });

    return {
      value: datum[metricLabel],
      name,
      itemStyle: {
        color: colorFn(name),
      },
    };
  });

  const selectedValues = (filterState.selectedValues || []).reduce(
    (acc: Record<string, number>, selectedValue: string) => {
      const index = transformedData.findIndex(({ name }) => name === selectedValue);
      return {
        ...acc,
        [index]: selectedValue,
      };
    },
    {},
  );
  // console.log(selectedValues);
  // console.log(filterState);
  const formatter = (params: CallbackDataParams) =>
    formatPieLabel({
      params,
      numberFormatter,
      labelType,
    });

  const defaultLabel = {
    formatter,
    show: showLabels,
    color: '#000000',
  };

  const series: BarSeriesOption[] = [
    {
      type: 'bar',
      ...getChartPadding(showLegend, legendOrientation, legendMargin),
      animation: false,
      stack: 'total',
      label: {
        show: true,
      },
      emphasis: {
        label: {
          show: true,
          fontWeight: 'bold',
          backgroundColor: 'white',
        },
      },
      data: transformedData,
    },
  ];

  console.log('series', series);
  const echartOptions: EChartsOption = {
    grid: {
      ...defaultGrid,
    },
    tooltip: {
      ...defaultTooltip,
      trigger: 'item',
      formatter: (params: any) =>
        formatPieLabel({
          params,
          numberFormatter,
          labelType: EchartsPieLabelType.KeyValuePercent,
        }),
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
      data: keys,
    },
    series,
  };

  console.log(echartOptions);
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

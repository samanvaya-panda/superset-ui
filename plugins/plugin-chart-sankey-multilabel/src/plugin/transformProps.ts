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
import { EChartsOption, SankeySeriesOption } from 'echarts';
import {
  DEFAULT_FORM_DATA as DEFAULT_COLUMN_FORM_DATA,
  SankeyMultilabelChartProps,
  FormData,
  TransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';
import {
  extractGroupbyLabel,
  getChartPadding,
  getColtypesMapping,
  getLegendProps,
} from '../utils/series';
import { defaultGrid, defaultTooltip } from '../defaults';

export default function transformProps(chartProps: SankeyMultilabelChartProps) {
  const { formData, height, hooks, queriesData, width } = chartProps;
  const { data = [] } = queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);
  console.log(queriesData, queriesData[1]);
  const {
    colorScheme,
    groupby,
    metric = '',
    dateFormat,
    // showLabels,
    showLegend,
    // showLabelsThreshold,
    emitFilter,
  }: FormData = { ...DEFAULT_LEGEND_FORM_DATA, ...DEFAULT_COLUMN_FORM_DATA, ...formData };

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

  const { setDataMask = () => {} } = hooks;

  const echartOptions: EChartsOption = {
    series: {
      type: 'sankey',
      layout: 'none',
      emphasis: {
        focus: 'adjacency',
      },
      data: [
        {
          name: 'a',
        },
        {
          name: 'b',
        },
        {
          name: 'a1',
        },
        {
          name: 'a2',
        },
        {
          name: 'b1',
        },
        {
          name: 'c',
        },
      ],
      links: [
        {
          source: 'a',
          target: 'a1',
          value: 5,
        },
        {
          source: 'a',
          target: 'a2',
          value: 3,
        },
        {
          source: 'b',
          target: 'b1',
          value: 8,
        },
        {
          source: 'a',
          target: 'b1',
          value: 3,
        },
        {
          source: 'b1',
          target: 'a1',
          value: 1,
        },
        {
          source: 'b1',
          target: 'c',
          value: 2,
        },
      ],
    },
  };
  var selectedValues: any;

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

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
import { DEFAULT_LABEL_FORM_DATA } from '../types';
import { extractGroupbyLabel, getColtypesMapping } from '../utils/series';

// function transfromGroupBy(groupby: string[]){
//   console.log('groupby', groupby);
//   if(groupby.length <= 2)
//     return [groupby];
//   const groupbyArray = [[groupby[0], groupby[1]]];
//   for(var i = 1; i < groupby.length-1; i++){
//     groupbyArray.push([groupby[i], groupby[i+1]]);
//   }
//   return groupbyArray;
// }

function customizeLabel(
  labels: any[],
  unqLabels: string[],
  labelColor: string,
  isBold: boolean = false,
) {
  labels.forEach(nodelabel => {
    unqLabels.forEach(newLabel => {
      if (nodelabel.name === newLabel) {
        let labelStyle = {
          color: labelColor,
          fontSize: 15,
          fontWeight: 'normal',
        };
        if (isBold) labelStyle.fontWeight = 'bold';
        nodelabel.label = labelStyle;
      }
    });
  });
}

export default function transformProps(chartProps: SankeyMultilabelChartProps) {
  const { formData, height, hooks, queriesData, width } = chartProps;
  const { data = [] } = queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);
  console.log(queriesData);
  const {
    colorScheme,
    groupby,
    metric = '',
    dateFormat,
    showLabel,
    isBold,
    labelName,
    labelColor,
    emitFilter,
  }: FormData = { ...DEFAULT_LABEL_FORM_DATA, ...DEFAULT_COLUMN_FORM_DATA, ...formData };

  const metricLabel = getMetricLabel(metric);
  const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  const labelMap: any = {};
  const labels: any = [];
  var edges: any = [];
  var values: any = {};
  // try{
  data.forEach(datum => {
    const label = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    });
    const labelArray = groupby.map(col => datum[col]);

    labelMap[label] = labelArray;
    if (!labels.some(item => item.name === labelArray[0])) {
      labels.push({
        name: labelArray[0],
        itemStyle: {
          color: colorFn(labelArray[0] as string),
        },
      });
      values[labelArray[0]] = 0;
    }

    for (var i = 0; i < labelArray.length - 1; i++) {
      if (!labels.some(item => item.name === labelArray[i + 1])) {
        labels.push({
          name: labelArray[i + 1],
          itemStyle: {
            color: colorFn(labelArray[i + 1] as string),
          },
          label: {},
        });
        values[labelArray[i + 1]] = 0;
      }

      const index = edges.findIndex(
        edge => edge.source === labelArray[i] && edge.target === labelArray[i + 1],
      );
      if (index >= 0) {
        edges[index].value += datum[metricLabel];
        values[labelArray[i]] += datum[metricLabel];
        if (i + 1 == labelArray.length - 1) values[labelArray[i + 1]] += datum[metricLabel];
      } else {
        edges.push({
          source: labelArray[i],
          target: labelArray[i + 1],
          value: datum[metricLabel],
          sourcePercent: 0,
          targetPercent: 0,
        });
        values[labelArray[i]] += datum[metricLabel];
        if (i + 1 == labelArray.length - 1) values[labelArray[i + 1]] += datum[metricLabel];
      }
    }
  });

  edges.forEach(edge => {
    const sourceVal = values[edge.source];
    const targetVal = values[edge.target];

    edge.sourcePercent = (100 * edge.value) / sourceVal;
    edge.targetPercent = (100 * edge.value) / targetVal;
  });

  if (showLabel && labelName) {
    const unqLabels = labelName.split('; ');
    customizeLabel(labels, unqLabels, labelColor, isBold);
  }
  // console.log(values, edges);
  // }
  // catch(error){
  // 	console.log('Pick at least 2 labels for source/target');
  // }

  // console.log('labelMap', labelMap);
  // console.log(labels, edges);

  const { setDataMask = () => {} } = hooks;

  const echartOptions: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        // console.log(params);
        let data = params.data;
        if (data.name === undefined) {
          let name = '<p>' + 'Path Value: ' + data.value + '</p>';
          let sourcePercent = '<p>' + data.sourcePercent.toFixed(1) + '% of ' + data.source + '<p>';
          let targetPercent = '<p>' + data.targetPercent.toFixed(1) + '% of ' + data.target + '<p>';
          return name + sourcePercent + targetPercent;
        } else {
          let name = '<p>' + params.name + '&emsp;' + params.value + '</p>';
          return name;
        }
      },
    },
    series: {
      type: 'sankey',
      emphasis: {
        focus: 'adjacency',
      },
      data: labels,
      links: edges,
      top: '1%',
      left: '1%',
      right: '1%',
      bottom: '1%',

      levels: [
        {
          depth: groupby.length - 1,
          label: {
            position: 'left',
          },
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

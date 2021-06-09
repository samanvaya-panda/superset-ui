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
import { EChartsOption } from 'echarts';
import {
  ChartDataResponseResult,
  ChartProps,
  DataRecordValue,
  QueryFormData,
  SetDataMaskHook,
} from '@superset-ui/core';
import {
  DEFAULT_LEGEND_FORM_DATA,
  EchartsLegendFormData,
  LegendOrientation,
  LegendType,
} from '../types';

export type FormData = QueryFormData &
  EchartsLegendFormData & {
    colorScheme?: string;
    currentOwnValue?: string[] | null;
    defaultValue?: string[] | null;
    groupby: string[];
    metric: '';
    columns: string[];
    stack: '';
    numberFormat: string;
    dateFormat: string;
    showLabelsThreshold: number;
    emitFilter: boolean;
  };

export interface ColumnChartProps extends ChartProps {
  formData: FormData;
  queriesData: ChartDataResponseResult[];
}

// @ts-ignore
export const DEFAULT_FORM_DATA: FormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  groupby: [],
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  numberFormat: 'SMART_NUMBER',
  showLabelsThreshold: 5,
  emitFilter: false,
  dateFormat: 'smart_date',
};

export interface TransformedProps {
  formData: FormData;
  height: number;
  width: number;
  echartOptions: EChartsOption;
  emitFilter: boolean;
  setDataMask: SetDataMaskHook;
  labelMap: Record<string, DataRecordValue[]>;
  groupby: string[];
  selectedValues: Record<number, string>;
}

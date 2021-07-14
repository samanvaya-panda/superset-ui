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

export type EchartsStylesProps = {
  height: number;
  width: number;
};

export interface EchartsProps {
  height: number;
  width: number;
  echartOptions: EChartsOption;
  eventHandlers?: EventHandlers;
  selectedValues?: Record<number, string>;
  forceClear?: boolean;
}

export enum LegendOrientation {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
}

export enum LegendType {
  Scroll = 'scroll',
  Plain = 'plain',
}

export type EchartsOptionFormData = {
  advancedOption: boolean;
  optionEditor: string;
};

export const DEFAULT_OPTION_FORM_DATA: EchartsOptionFormData = {
  advancedOption: false,
  optionEditor: '',
};

export type EchartsLegendFormData = {
  legendMargin: number | null | string;
  legendOrientation: LegendOrientation;
  legendType: LegendType;
  showLegend: boolean;
};

export const DEFAULT_LEGEND_FORM_DATA: EchartsLegendFormData = {
  legendMargin: null,
  legendOrientation: LegendOrientation.Top,
  legendType: LegendType.Scroll,
  showLegend: false,
};

export type EventHandlers = Record<string, { (props: any): void }>;

export enum LabelPositionEnum {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
  Inside = 'inside',
  InsideLeft = 'insideLeft',
  InsideRight = 'insideRight',
  InsideTop = 'insideTop',
  InsideBottom = 'insideBottom',
  InsideTopLeft = 'insideTopLeft',
  InsideBottomLeft = 'insideBottomLeft',
  InsideTopRight = 'insideTopRight',
  InsideBottomRight = 'insideBottomRight',
}

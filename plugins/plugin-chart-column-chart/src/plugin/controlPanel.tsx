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
import React from 'react';
import { FeatureFlag, isFeatureEnabled, t, validateNonEmpty } from '@superset-ui/core';
import {
  ControlPanelConfig,
  ControlPanelsContainerProps,
  D3_FORMAT_DOCS,
  D3_FORMAT_OPTIONS,
  D3_TIME_FORMAT_OPTIONS,
  sections,
} from '@superset-ui/chart-controls';
import { DEFAULT_FORM_DATA } from './types';
import { legendSection } from '../controls';

const { labelType, showLabels, stack, numberFormat } = DEFAULT_FORM_DATA;

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metric'],
        ['adhoc_filters'],
        ['groupby'],
        ['columns'],
        ['row_limit'],
        [
          {
            name: 'sort_by_metric',
            config: {
              default: true,
              type: 'CheckboxControl',
              label: t('Sort by metric'),
              description: t('Whether to sort results by the selected metric in descending order.'),
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        ['color_scheme'],
        [
          {
            name: 'stack',
            config: {
              type: 'CheckboxControl',
              label: t('Stack series'),
              renderTrigger: true,
              default: stack,
              description: t('Stack series on top of each other'),
            },
          },
        ],
        ...legendSection,
        // eslint-disable-next-line react/jsx-key
        [<h1 className="section-header">{t('Labels')}</h1>],
        [
          {
            name: 'label_type',
            config: {
              type: 'SelectControl',
              label: t('Label Type'),
              default: labelType,
              renderTrigger: true,
              choices: [
                ['key', 'Category Name'],
                ['value', 'Value'],
                ['percent', 'Percentage'],
                ['key_value', 'Category and Value'],
                ['key_percent', 'Category and Percentage'],
                ['key_value_percent', 'Category, Value and Percentage'],
              ],
              description: t('What should be shown on the label?'),
            },
          },
        ],
        [
          {
            name: 'number_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Number format'),
              renderTrigger: true,
              default: numberFormat,
              choices: D3_FORMAT_OPTIONS,
              description: `${t('D3 format syntax: https://github.com/d3/d3-format')} ${t(
                'Only applies when "Label Type" is set to show values.',
              )}`,
            },
          },
        ],
        [
          {
            name: 'date_format',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Date format'),
              renderTrigger: true,
              choices: D3_TIME_FORMAT_OPTIONS,
              default: 'smart_date',
              description: D3_FORMAT_DOCS,
            },
          },
        ],
        [
          {
            name: 'show_labels',
            config: {
              type: 'CheckboxControl',
              label: t('Show Labels'),
              renderTrigger: true,
              default: showLabels,
              description: t('Whether to display the labels.'),
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    row_limit: {
      default: 100,
    },
    columns: {
      label: t('Breakdowns'),
      description: t('Defines how each series is broken down'),
    },
  },
};

export default config;

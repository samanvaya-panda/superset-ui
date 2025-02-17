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
import { t, validateNonEmpty } from '@superset-ui/core';
import { ControlPanelConfig, sections } from '@superset-ui/chart-controls';
import { DEFAULT_FORM_DATA } from './types';
import { legendSection, labelSection } from '../controls';

const { stack, zoom, showNumber } = DEFAULT_FORM_DATA;

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
        [
          {
            name: 'zoom',
            config: {
              type: 'CheckboxControl',
              label: t('Zoom In'),
              renderTrigger: true,
              default: zoom,
              description: t('Zoom in to view the bars better'),
            },
          },
        ],
        [
          {
            name: 'show_number',
            config: {
              type: 'CheckboxControl',
              label: t('Number on bars'),
              renderTrigger: true,
              default: showNumber,
              description: t('Show numbers on bars'),
            },
          },
        ],
        ...legendSection,
        ...labelSection,
      ],
    },
  ],
  controlOverrides: {
    groupby: {
      validators: [validateNonEmpty],
    },

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

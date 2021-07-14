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
import { legendSection, optionSection } from '../controls';

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
      controlSetRows: [['color_scheme'], ...legendSection, ...optionSection],
    },
  ],
  controlOverrides: {
    metric: {
      label: t('Y-Axis'),
      description: t('Defines the measure of quantity on x-axis'),
    },
    groupby: {
      label: t('X-Axis'),
      validators: [validateNonEmpty],
      description: t('Can be integer or category type'),
    },
    columns: {
      label: t('Breakdowns'),
      description: t('For stacking up multiple lines together'),
    },
    row_limit: {
      default: 100,
    },
  },
};

// const config: ControlPanelConfig = {
//   controlPanelSections: [
//     sections.legacyTimeseriesTime,
//     {
//       label: t('Query'),
//       expanded: true,
//       controlSetRows: [
//         ['metric'],
//         ['adhoc_filters'],
//         ['groupby'],
//         ['columns'],
//         ['row_limit'],
//         [
//           {
//             name: 'sort_by_metric',
//             config: {
//               default: true,
//               type: 'CheckboxControl',
//               label: t('Sort by metric'),
//               description: t('Whether to sort results by the selected metric in descending order.'),
//             },
//           },
//         ],
//       ],
//     },
//     {
//       label: t('Chart Options'),
//       expanded: true,
//       controlSetRows: [
//         ['color_scheme'],
//         ...legendSection,
//         ...optionSection,
//         [<input type="file" id="json_file"/>],
//         // [
//         //   {
//         //     name: 'custom_file',
//         //     config: {
//         //       default: true,
//         //       type: 'CollectionControl',
//         //       label: t('Upload custom options'),
//         //       description: t('Uploading custom echart options'),
//         //     },
//         //   },
//         // ],
//         // [
//         //   {
//         //     name: 'custom_tile',
//         //     config: {
//         //       default: true,
//         //       type: 'AnnotationLayerControl',
//         //       label: t('Upload custom options'),
//         //       description: t('Uploading custom echart options'),
//         //     },
//         //   },
//         // ],
//       ],
//     },
//   ],
//   controlOverrides: {
//     metric:{
//       label: t('Y-Axis'),
//       description: t('Defines the measure of quantity on x-axis')
//     },
//     groupby: {
//       label: t('X-Axis'),
//       validators: [validateNonEmpty],
//       description: t('Can be integer or category type')
//     },
//     columns:{
//       label: t('Breakdowns'),
//       description: t('For stacking up multiple lines together')
//     },
//     row_limit: {
//       default: 100,
//     },
//   },
// };

export default config;

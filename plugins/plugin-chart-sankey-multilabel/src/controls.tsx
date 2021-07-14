import React from 'react';
import { t } from '@superset-ui/core';
import { ControlPanelsContainerProps } from '@superset-ui/chart-controls';
import { DEFAULT_LABEL_FORM_DATA } from './types';

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
const { showLabel, labelName, isBold, labelColor } = DEFAULT_LABEL_FORM_DATA;

const showLabelControl = {
  name: 'show_label',
  config: {
    type: 'CheckboxControl',
    label: t('Label Customisations'),
    renderTrigger: true,
    default: showLabel,
    description: t('Make customisations to labels'),
  },
};

const labelChoice = {
  name: 'labelName',
  config: {
    type: 'TextControl',
    label: t('Enter Label Name'),
    renderTrigger: true,
    default: labelName,
    description: t('Name of the label which is to be customised'),
    visibility: ({ controls }: ControlPanelsContainerProps) => Boolean(controls?.show_label?.value),
  },
};

const boldChoice = {
  name: 'isBold',
  config: {
    type: 'CheckboxControl',
    label: t('Bold'),
    renderTrigger: true,
    default: isBold,
    description: t('Whether label should be bold'),
    visibility: ({ controls }: ControlPanelsContainerProps) => Boolean(controls?.show_label?.value),
  },
};

const colorChoice = {
  name: 'labelColor',
  config: {
    type: 'SelectControl',
    label: t('Color'),
    choices: [
      ['red', 'Red'],
      ['blue', 'Blue'],
      ['green', 'Green'],
      ['black', 'Black'],
    ],
    renderTrigger: true,
    default: labelColor,
    description: t('Select a color for the label'),
    visibility: ({ controls }: ControlPanelsContainerProps) => Boolean(controls?.show_label?.value),
  },
};

export const labelSection = [
  [<h1 className="section-header">{t('Label')}</h1>],
  [showLabelControl],
  [labelChoice],
  [boldChoice],
  [colorChoice],
];

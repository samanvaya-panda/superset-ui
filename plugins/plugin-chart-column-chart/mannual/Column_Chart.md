# Building an Echart column chart plugin in Apache Superset

This is a follow-up document to the [Hello World](https://preset.io/blog/2020-07-02-hello-world/)
plugin blog. After creating the new plugin, the directory structure of `plugin-chart-hello-world`
would look something like this:

```
.
├── package.json
├── README.md
├── src
│   ├── HelloWorld.tsx
│   ├── images
│   │   └── thumbnail.png
│   ├── index.ts
│   ├── plugin
│   │   ├── buildQuery.ts
│   │   ├── controlPanel.ts
│   │   ├── index.ts
│   │   └── transformProps.ts
│   └── types.ts
├── test
│   ├── index.test.ts
│   └── plugin
│       ├── buildQuery.test.ts
│       └── transformProps.test.ts
├── tsconfig.json
└── types
    └── external.d.ts
```

Before creating the column chart, we need to get some initial files from `plugin-chart-echarts`. Go
to `plugin-chart-echarts/src` folder and copy all the files and folders to
` plugin-chart-hello-world/src` except the folders corresponding to some chart name i.e BoxPlot,
Funnel, etc(Folder names starting with caps). The resulting directory structure of
`plugin-chart-hello-world/src` would become:

```
src/
├── components
│   └── Echart.tsx
├── constants.ts
├── controls.tsx
├── defaults.ts
├── HelloWorld.tsx
├── images
│   └── thumbnail.png
├── index.ts
├── plugin
│   ├── buildQuery.ts
│   ├── controlPanel.tsx
│   ├── transformProps.ts
│   └── types.ts
├── types.ts
└── utils
    ├── annotation.ts
    ├── controls.ts
    ├── prophet.ts
    └── series.ts
```

Now, to build the column chart plugin, we would only require to make changes in the `src` folder. We
are going to create a column chart with minimal features such as single metric, group by, single
breakdown, legends and stacking parallel bars. These features are defined in
`src/plugin/ContolPanel.tsx`. We start by importing and defining some of the required modules and
variables:

```ts
import { t } from '@superset-ui/core';
import { ControlPanelConfig, sections } from '@superset-ui/chart-controls';
import { DEFAULT_FORM_DATA } from './types';
import { legendSection } from '../controls';
const { stack } = DEFAULT_FORM_DATA;
```

Next we define the controls that are going to appear in superset for our chart(metric, group by,
breakdown, etc) and finally we export them:

```ts
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
```

Next, we need to define how we would query data for different features in the superset. For this, we
set up `src/plugin/buildQuery.ts` as:

```ts
import { buildQueryContext, QueryFormData } from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { metric, sort_by_metric } = formData;
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      ...(sort_by_metric && { orderby: [[metric, false]] }),
    },
  ]);
}
```

Next we need to modify the `transformProps.ts` file to manage the rendering of different features in
superset. Import some of the modules and variables that would be required.

```ts
import {
  CategoricalColorNamespace,
  DataRecordValue,
  getMetricLabel,
  getTimeFormatter,
} from '@superset-ui/core';
import { EChartsOption, BarSeriesOption } from 'echarts';
import {
  DEFAULT_FORM_DATA as DEFAULT_COLUMN_FORM_DATA,
  ColumnChartProps,
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
```

Next in the `transformProps` function, we extract the paramters(metric, groupby, stack option, etc.)
as selected by the user in superset:

```ts
const { formData, height, hooks, queriesData, width } = chartProps;
const { data = [] } = queriesData[0];
const coltypeMapping = getColtypesMapping(queriesData[0]);

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
  showLegend,
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

const keys = Object.keys(labelMap);
var breakdownMap = new Map();
if (columns.length === 1) {
  data.forEach(datum => {
    const key: any = columns.map(col => datum[col]);
    if (!(key[0] in breakdownMap)) {
      breakdownMap.set(key[0], key);
    }
  });
}
```

Then we transform the data using the groupby labels, metric and breakdown labels to render it
appropriately.

```ts
const { setDataMask = () => {} } = hooks;
const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

var transformedData: any;
if (columns.length === 0) {
  const transformData = data.map(datum => {
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
    };
  });
  transformedData = transformData;
} else if (columns.length === 1) {
  let transformData = new Map();
  data.forEach(datum => {
    const key: any = columns.map(col => datum[col])[0];
    if (!(typeof key in transformData)) {
      transformData.set(key, []);
    }
    transformData.set(key, {
      value: datum[metricLabel],
      name: groupby.map(col => datum[col])[0],
    });
  });
  transformedData = transformData;
}

var selectedValues: any;
```

We then create the series data and define the BarSeriesOption as:

```ts
const series: BarSeriesOption[] = [];
var legendData = [];

if (columns.length) {
  for (var key in breakdownMap) {
    series.push({
      name: key,
      type: 'bar',
      ...getChartPadding(showLegend, legendOrientation, legendMargin),
      animation: false,
      stack,
      label: {
        show: true,
      },
      emphasis: {
        label: {
          show: true,
          fontWeight: 'bold',
          backgroundColor: 'white',
        },
        // focus:'series',
      },
      data: transformedData[key],
    });
    legendData.push(key);
  }
} else {
  series.push({
    name: metricLabel,
    type: 'bar',
    ...getChartPadding(showLegend, legendOrientation, legendMargin),
    animation: false,
    stack,
    label: {
      show: true,
    },
    emphasis: {
      label: {
        show: true,
        fontWeight: 'bold',
        backgroundColor: 'white',
      },
      // focus:'series',
    },
    data: transformedData,
  });
  legendData = [metricLabel];
}
```

And the finally create the EchartsOption and return all the values:

```ts
const echartOptions: EChartsOption = {
  grid: {
    ...defaultGrid,
  },
  tooltip: {
    ...defaultTooltip,
    trigger: 'item',
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
  },
  legend: {
    ...getLegendProps(legendType, legendOrientation, showLegend),
    data: legendData,
  },
  series: series,
};
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
```

So far we have discussed about how data will be extracted and modified from different components on
superset. Now lets define in which form data will be stored for appropriate querying and
transformation. We define a `QueryFormData` and various other variables in `src/plugin/types.ts` as:

```ts
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
```

So, we have defined all the components required for our chart. Now, we need to combine all these
components together to render our chart. Rename the file `src/HelloWorld.tsx` to
`src/ColumnChart.tsx`. Then we setup our main file `src/ColumnChart.tsx` as:

```ts
import React, { useCallback } from 'react';
import { TransformedProps } from './plugin/types';
import Echart from './components/Echart';
import { EventHandlers } from './types';

export default function ColumnChart({
  height,
  width,
  echartOptions,
  setDataMask,
  labelMap,
  groupby,
  selectedValues,
  formData,
}: TransformedProps) {
  const handleChange = useCallback(
    (values: string[]) => {
      if (!formData.emitFilter) {
        return;
      }

      const groupbyValues = values.map(value => labelMap[value]);

      setDataMask({
        extraFormData: {
          filters:
            values.length === 0
              ? []
              : groupby.map((col, idx) => {
                  const val = groupbyValues.map(v => v[idx]);
                  if (val === null || val === undefined)
                    return {
                      col,
                      op: 'IS NULL',
                    };
                  return {
                    col,
                    op: 'IN',
                    val: val as (string | number | boolean)[],
                  };
                }),
        },
        filterState: {
          value: groupbyValues.length ? groupbyValues : null,
          selectedValues: values.length ? values : null,
        },
      });
    },
    [groupby, labelMap, setDataMask, selectedValues],
  );

  const eventHandlers: EventHandlers = {
    click: props => {
      const { name } = props;
      const values = Object.values(selectedValues);
      if (values.includes(name)) {
        handleChange(values.filter(v => v !== name));
      } else {
        handleChange([...values, name]);
      }
    },
  };

  return (
    <Echart
      height={height}
      width={width}
      echartOptions={echartOptions}
      eventHandlers={eventHandlers}
      selectedValues={selectedValues}
    />
  );
}
```

Finally, we modify the `src/index.ts` as:

```ts
import { Behavior, ChartMetadata, ChartPlugin, t } from '@superset-ui/core';
import buildQuery from './plugin/buildQuery';
import controlPanel from './plugin/controlPanel';
import transformProps from './plugin/transformProps';
import thumbnail from './images/thumbnail.png';
import { ColumnChartProps, FormData } from './plugin/types';

export default class ColumnChartPlugin extends ChartPlugin<FormData, ColumnChartProps> {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./ColumnChart'),
      metadata: new ChartMetadata({
        behaviors: [Behavior.INTERACTIVE_CHART],
        credits: ['https://echarts.apache.org'],
        description: 'Column Chart (Apache ECharts)',
        name: t('Column Chart'),
        thumbnail,
      }),
      transformProps,
    });
  }
}
```

That's it! Save all the changes and create a column chart of type 'Column Chart' in the superset.

Let's start adding additional features to our Column Chart.

### Breakdowns with missing values and multiple breakdowns

We have added the breakdown feature already that performs sub-grouping on groupby labels. If, for
some groupby label, one of the breakdown label's values is missing(not defined on that label), then
the chart won't be rendered properly. While keeping this in mind, we also need to implement multiple
breakdown labels for multiple sub-grouping of groupby labels. All these changes would be made in
`src/plugin/transformProps.ts`.

To start with, we need all the unique groupby labels and assign an index to each label.

```ts
const keys = Object.keys(labelMap);
var seriesLabel: any = {};
keys.forEach((key, index) => {
  seriesLabel[key] = index;
});

const breakdownMap: string[] = [];
if (columns.length) {
  data.forEach(datum => {
    const key: string = parseLabel(columns.map(col => datum[col]));
    if (!breakdownMap.includes(key)) {
      breakdownMap.push(key);
    }
  });
}
```

The function `parseLabel` is for parsing the names of comma-separated labels.

```ts
function parseLabel(value: DataRecordValue[] | string[], sep: string = ', ') {
  var parsedString: string = '';
  value.forEach((label, index) => {
    if (index < 1) parsedString += label;
    else parsedString += sep + label;
  });
  return parsedString;
}
```

To handle breakdown(s), we create an array of size equal to no.of unique groupby labels filled with
`null` and fill it appropriately for each label.

```ts
else {
  var transformData : any = {};
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
```

And finally just a minor change from `for (var key in breakdownMap)` to
`breakdownMap.forEach(key => `.

### Label Customisations

Label customizations would allow us to make some pre-defined changes to labels, like change text
color and bold text. To make such changes, we need to add these features to the UI. First, we create
these label control features in `src/types.ts`

```ts
export type EchartsLabelFormData = {
  showLabel: boolean;
  labelName: string;
  isBold: boolean;
  labelColor: string;
};

export const DEFAULT_LABEL_FORM_DATA: EchartsLabelFormData = {
  showLabel: false,
  labelName: '',
  isBold: false,
  labelColor: 'red',
};
```

Then we import these features in `src/controls.tsx` and specify them:

```ts
import { DEFAULT_LEGEND_FORM_DATA, DEFAULT_LABEL_FORM_DATA } from './types';
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
```

Next, we import the `labelSection` in `src/plugin/controlPanel.tsx`

```ts
import { legendSection, labelSection } from '../controls';
```

And we add these features in the config so that they show up in the UI.

```ts
  ...legendSection,
  ...labelSection,

```

Now that we have created the UI features, we need to update its functionality in
`src/plugin/transformProps.ts`. First, we import `DEFAULT_LABEL_FORM_DATA` and extract the newly
added features:

```ts
import { DEFAULT_LEGEND_FORM_DATA, DEFAULT_LABEL_FORM_DATA } from '../types';
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
  showLegend,
  showLabel,
  labelName,
  isBold,
  labelColor,
  emitFilter,
  showNumber,
}: FormData = {
  ...DEFAULT_LEGEND_FORM_DATA,
  ...DEFAULT_LABEL_FORM_DATA,
  ...DEFAULT_COLUMN_FORM_DATA,
  ...formData,
};
```

To add functionality of these features to the chart, we need to define a formatter function and
apply these as rich text.

```ts
var richLabels: any = {
  formatter: function (value: string) {
    return '{' + parseRichLabel(value) + '|' + value + '}';
  },
  rich: {},
};

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
```

The function `parseRichLabel` used in the formatter function is defined as:

```ts
function parseRichLabel(value: string) {
  const splitArray = value.split(', ');
  return parseLabel(splitArray, '_');
}
```

Finally to render these changes, we need to add the `richLabels` in `echartOptions`:

```ts
yAxis: {
  type: 'category',
  data: keys,
  axisLabel: richLabels,
}

```

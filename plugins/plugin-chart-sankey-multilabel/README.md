## @superset-ui/plugin-chart-sankey-multilabel

[![Version](https://img.shields.io/npm/v/@superset-ui/plugin-chart-sankey-multilabel.svg?style=flat-square)](https://www.npmjs.com/package/@superset-ui/plugin-chart-sankey-multilabel)

This plugin provides Creates a multiple source-target Sankey diagram for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import SankeyMultilabelChartPlugin from '@superset-ui/plugin-chart-sankey-multilabel';

new SankeyMultilabelChartPlugin().configure({ key: 'sankey-multilabel' }).register();
```

Then use it via `SuperChart`. See
[storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-sankey-multilabel)
for more details.

```js
<SuperChart
  chartType="sankey-multilabel"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

### File structure generated

```
├── package.json
├── README.md
├── tsconfig.json
├── src
│   ├── SankeyMultilabel.tsx
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
│   └── index.test.ts
└── types
    └── external.d.ts
```

/* eslint-disable no-underscore-dangle */
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
  ChartDataResponseResult,
  DataRecord,
  DataRecordValue,
  GenericDataType,
  NumberFormatter,
  TimeFormatter,
  TimeseriesDataRecord,
} from '@superset-ui/core';
import { SeriesOption } from 'echarts';
import { NULL_STRING, TIMESERIES_CONSTANTS } from '../constants';

function isDefined<T>(value: T | undefined | null): boolean {
  return value !== undefined && value !== null;
}

export function extractTimeseriesSeries(
  data: TimeseriesDataRecord[],
  opts: { fillNeighborValue?: number } = {},
): SeriesOption[] {
  const { fillNeighborValue } = opts;
  if (data.length === 0) return [];
  const rows: TimeseriesDataRecord[] = data.map(datum => ({
    ...datum,
    __timestamp: datum.__timestamp || datum.__timestamp === 0 ? new Date(datum.__timestamp) : null,
  }));

  return Object.keys(rows[0])
    .filter(key => key !== '__timestamp')
    .map(key => ({
      id: key,
      name: key,
      data: rows.map((row, idx) => {
        const isNextToDefinedValue =
          isDefined(rows[idx - 1]?.[key]) || isDefined(rows[idx + 1]?.[key]);
        return [
          row.__timestamp,
          !isDefined(row[key]) && isNextToDefinedValue && fillNeighborValue !== undefined
            ? fillNeighborValue
            : row[key],
        ];
      }),
    }));
}

export function formatSeriesName(
  name: DataRecordValue | undefined,
  {
    numberFormatter,
    timeFormatter,
    coltype,
  }: {
    numberFormatter?: NumberFormatter;
    timeFormatter?: TimeFormatter;
    coltype?: GenericDataType;
  } = {},
): string {
  if (name === undefined || name === null) {
    return NULL_STRING;
  }
  if (typeof name === 'number') {
    return numberFormatter ? numberFormatter(name) : name.toString();
  }
  if (typeof name === 'boolean') {
    return name.toString();
  }
  if (name instanceof Date || coltype === GenericDataType.TEMPORAL) {
    const d = name instanceof Date ? name : new Date(name);

    return timeFormatter ? timeFormatter(d) : d.toISOString();
  }
  return name;
}

export const getColtypesMapping = ({
  coltypes = [],
  colnames = [],
}: ChartDataResponseResult): Record<string, GenericDataType> =>
  colnames.reduce((accumulator, item, index) => ({ ...accumulator, [item]: coltypes[index] }), {});

export function extractGroupbyLabel({
  datum = {},
  groupby,
  numberFormatter,
  timeFormatter,
  coltypeMapping = {},
}: {
  datum?: DataRecord;
  groupby?: string[] | null;
  numberFormatter?: NumberFormatter;
  timeFormatter?: TimeFormatter;
  coltypeMapping: Record<string, GenericDataType>;
}): string {
  return (groupby || [])
    .map(val =>
      formatSeriesName(datum[val], {
        numberFormatter,
        timeFormatter,
        ...(coltypeMapping[val] && { coltype: coltypeMapping[val] }),
      }),
    )
    .join(', ');
}

export function dedupSeries(series: SeriesOption[]): SeriesOption[] {
  const counter = new Map<string, number>();
  return series.map(row => {
    let { id } = row;
    if (id === undefined) return row;
    id = String(id);
    const count = counter.get(id) || 0;
    const suffix = count > 0 ? ` (${count})` : '';
    counter.set(id, count + 1);
    return {
      ...row,
      id: `${id}${suffix}`,
    };
  });
}

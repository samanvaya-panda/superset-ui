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
import { buildQueryContext, QueryFormData } from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { metric, sort_by_metric } = formData;
  // if()
  return buildQueryContext(formData, baseQueryObject => {
    const queries: any = [];
    const groupbyLabels = formData.groupby || [];
    if (groupbyLabels.length < 2) {
      queries.push({
        ...baseQueryObject,
        ...(sort_by_metric && { orderby: [[metric, false]] }),
      });
    } else {
      for (let i = 0; i < groupbyLabels.length - 1; i++) {
        var tempGroupby = [groupbyLabels[i], groupbyLabels[i + 1]];
        queries.push({
          ...baseQueryObject,
          groupby: tempGroupby,
          ...(sort_by_metric && { orderby: [[metric, false]] }),
        });
      }
    }
    return queries;
  });
}

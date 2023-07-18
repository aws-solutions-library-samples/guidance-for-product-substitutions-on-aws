// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Dynamo } from './dynamo/dynamo-construct';
import { OpenSearch } from './opensearch/opensearch-construct';
import { Api } from './api/api-construct';

export class SubstitutionsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const openSearch = new OpenSearch(this, 'OpenSearch', {});

    const dynamo = new Dynamo(this, 'Dynamo', {
      openSearchDomain: openSearch.domain,
      openSearchRole: openSearch.masterRole,
    });

    const api = new Api(this, 'Api', {
      openSearchDomain: openSearch.domain,
      openSearchRole: openSearch.masterRole,
      productsTable: dynamo.table,
      countTable: dynamo.countTable,
    });

    new CfnOutput(this, 'Request Example', {
      description: 'Replace <PRODUCT_ID> with valid product id value',
      value: JSON.stringify(
        {
          substitutions: api.httpApi.apiEndpoint + '/substitutions?id=<PRODUCT_ID>',
          example: `curl ${api.httpApi.apiEndpoint}/substitutions?id=1 -H Authorization:auth`,
          status: api.httpApi.apiEndpoint + '/status',
          add_product: api.httpApi.apiEndpoint + '/add-product',
        },
        undefined,
        2
      ),
    });
  }
}

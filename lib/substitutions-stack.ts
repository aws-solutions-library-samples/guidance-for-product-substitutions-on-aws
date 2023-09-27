// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput, aws_s3, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Dynamo } from './dynamo/dynamo-construct';
import { OpenSearch } from './opensearch/opensearch-construct';
import { Api } from './api/api-construct';
import { IdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha';
import { Frontend } from './frontend/frontend-construct';

export class SubstitutionsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const identityPool = new IdentityPool(this, 'SubsIdentityPool', {
      allowUnauthenticatedIdentities: true,
    });

    const inputBucket = new aws_s3.Bucket(this, 'InputBucket', {
      cors: [
        {
          allowedMethods: [
            aws_s3.HttpMethods.GET,
            aws_s3.HttpMethods.PUT,
            aws_s3.HttpMethods.POST,
            aws_s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          id: 'myCORSRuleId1',
          maxAge: 3600,
        },
      ],
      lifecycleRules: [{ id: 'DeleteOldInputFiles', enabled: true, expiration: Duration.days(30) }],
      versioned: true,
      encryption: aws_s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: new aws_s3.Bucket(this, 'InputBucketAccessLog', {
        lifecycleRules: [{ id: 'DeleteOldLogs', enabled: true, expiration: Duration.days(30) }],
        versioned: true,
        enforceSSL: true,
        encryption: aws_s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    });
    inputBucket.grantPut(identityPool.unauthenticatedRole);

    new Frontend(this, 'Frontend', {
      identityPoolId: identityPool.identityPoolId,
      bucketName: inputBucket.bucketName,
    });
    return;

    const openSearch = new OpenSearch(this, 'OpenSearch', {});
    const dynamo = new Dynamo(this, 'Dynamo', {
      openSearchDomain: openSearch.domain,
      openSearchRole: openSearch.masterRole,
      inputBucket,
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

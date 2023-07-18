// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import {
  Stack,
  RemovalPolicy,
  aws_lambda,
  aws_opensearchservice,
  triggers,
  aws_iam,
} from 'aws-cdk-lib';

interface OpenSearchProps {}

export class OpenSearch extends Construct {
  domain: aws_opensearchservice.Domain;
  masterRole: aws_iam.Role;

  constructor(scope: Construct, name: string, props: OpenSearchProps) {
    super(scope, name);

    const masterRole = new aws_iam.Role(this, 'AccessRole', {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
        aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonOpenSearchServiceFullAccess'),
      ],
    });

    const domain = new aws_opensearchservice.Domain(this, 'OpensearchDomain', {
      removalPolicy: RemovalPolicy.DESTROY,
      version: aws_opensearchservice.EngineVersion.OPENSEARCH_2_3,
      useUnsignedBasicAuth: true,
      fineGrainedAccessControl: {
        masterUserArn: masterRole.roleArn,
      },
    });

    const indexingLambda = new aws_lambda.DockerImageFunction(this, 'OpenSearchIndexLambda', {
      code: aws_lambda.DockerImageCode.fromImageAsset('lib/opensearch/lambdas/indexing'),
      architecture:
        process.arch === 'arm64' ? aws_lambda.Architecture.ARM_64 : aws_lambda.Architecture.X86_64,
      environment: {
        host: domain.domainEndpoint,
        region: Stack.of(this).region,
      },
      role: masterRole,
    });

    new triggers.Trigger(this, 'OpenSearchIndexTrigger', {
      handler: indexingLambda,
      executeAfter: [domain],
      executeOnHandlerChange: false,
    });

    this.domain = domain;
    this.masterRole = masterRole;
  }
}

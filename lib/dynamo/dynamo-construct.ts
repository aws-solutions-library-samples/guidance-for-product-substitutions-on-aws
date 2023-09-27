// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import {
  RemovalPolicy,
  aws_dynamodb,
  aws_lambda,
  aws_lambda_event_sources,
  aws_opensearchservice,
  aws_iam,
  Duration,
  Stack,
  aws_s3,
} from 'aws-cdk-lib';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

interface DynamoProps {
  openSearchDomain: aws_opensearchservice.Domain;
  openSearchRole: aws_iam.Role;
  inputBucket: aws_s3.Bucket;
}

export class Dynamo extends Construct {
  table: aws_dynamodb.Table;
  countTable: aws_dynamodb.Table;

  constructor(scope: Construct, name: string, props: DynamoProps) {
    super(scope, name);
    const { openSearchDomain, openSearchRole, inputBucket } = props;

    const table = new aws_dynamodb.Table(this, 'ProductsTable', {
      partitionKey: { name: 'id', type: aws_dynamodb.AttributeType.STRING },
      stream: aws_dynamodb.StreamViewType.NEW_IMAGE,
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });
    table.node.addDependency(openSearchDomain);

    const countTable = new aws_dynamodb.Table(this, 'ProductsCountTable', {
      partitionKey: { name: 'type', type: aws_dynamodb.AttributeType.STRING },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    const seedLambda = new aws_lambda.Function(this, 'Seed', {
      code: aws_lambda.Code.fromAsset('lib/dynamo/lambdas/seed'),
      handler: 'index.handler',
      runtime: aws_lambda.Runtime.PYTHON_3_8,
      environment: {
        bucket: inputBucket.bucketName,
        tableName: table.tableName,
        countTableName: countTable.tableName,
      },
      timeout: Duration.minutes(15),
      memorySize: 10000,
    });

    const countLambda = new aws_lambda.Function(this, 'DynamoCounter', {
      code: aws_lambda.Code.fromAsset('lib/dynamo/lambdas/counter'),
      handler: 'index.handler',
      runtime: aws_lambda.Runtime.PYTHON_3_8,
      environment: {
        countTableName: countTable.tableName,
      },
      timeout: Duration.minutes(15),
      memorySize: 10000,
    });

    countLambda.addEventSource(
      new aws_lambda_event_sources.DynamoEventSource(table, {
        startingPosition: aws_lambda.StartingPosition.LATEST,
        batchSize: 50,
      })
    );

    seedLambda.addEventSource(
      new S3EventSource(inputBucket, {
        events: [aws_s3.EventType.OBJECT_CREATED],
      })
    );

    inputBucket.grantRead(seedLambda);
    table.grantReadWriteData(seedLambda);
    countTable.grantReadWriteData(seedLambda);
    countTable.grantReadWriteData(countLambda);

    this.countTable = countTable;

    const dynamoStreamLambda = new aws_lambda.DockerImageFunction(this, 'DynamoStreamLambda', {
      code: aws_lambda.DockerImageCode.fromImageAsset('lib/dynamo/lambdas/stream'),
      architecture:
        process.arch === 'arm64' ? aws_lambda.Architecture.ARM_64 : aws_lambda.Architecture.X86_64,
      timeout: Duration.minutes(15),
      memorySize: 10000,
      environment: {
        host: openSearchDomain.domainEndpoint,
        region: Stack.of(this).region,
      },
      role: openSearchRole,
    });

    dynamoStreamLambda.addEventSource(
      new aws_lambda_event_sources.DynamoEventSource(table, {
        startingPosition: aws_lambda.StartingPosition.LATEST,
        batchSize: 50,
      })
    );
    openSearchDomain.grantReadWrite(dynamoStreamLambda);

    this.table = table;
  }
}

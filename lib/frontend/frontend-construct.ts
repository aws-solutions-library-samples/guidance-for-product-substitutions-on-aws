// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { Construct } from 'constructs';
import {
  Stack,
  aws_s3,
  aws_cloudfront,
  aws_cloudfront_origins,
  RemovalPolicy,
  aws_s3_deployment,
  DockerImage,
  CfnOutput,
} from 'aws-cdk-lib';
import * as childProcess from 'child_process';
import * as fsExtra from 'fs-extra';
import { AmplifyConfig } from '../../ui/types';

interface FrontendProps {
  identityPoolId: string;
  bucketName: string;
  api: { name: string; endpoint: string; region: string };
}

export class Frontend extends Construct {
  constructor(scope: Construct, name: string, props: FrontendProps) {
    super(scope, name);

    const s3AccessLogBucket = new aws_s3.Bucket(this, 'frontS3AccessLogBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
    });

    const uiBucket = new aws_s3.Bucket(this, 'UiBucket', {
      versioned: true,
      encryption: aws_s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: s3AccessLogBucket,
    });

    const accessLogBucket = new aws_s3.Bucket(this, 'frontAccessLogBucket', {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: aws_s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      accessControl: aws_s3.BucketAccessControl.PRIVATE,
      enforceSSL: true,
      versioned: true,
    });

    const distribution = new aws_cloudfront.Distribution(this, 'UiDist', {
      defaultBehavior: {
        origin: new aws_cloudfront_origins.S3Origin(uiBucket),
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      enableLogging: true,
      logBucket: accessLogBucket,
      errorResponses: [
        {
          httpStatus: 403,
          responsePagePath: '/',
          responseHttpStatus: 200,
        },
        {
          httpStatus: 404,
          responsePagePath: '/',
          responseHttpStatus: 200,
        },
      ],
    });

    const config: AmplifyConfig = {
      Auth: { region: Stack.of(this).region, identityPoolId: props.identityPoolId },
      Storage: {
        AWSS3: {
          region: Stack.of(this).region,
          bucket: props.bucketName,
          customPrefix: {
            public: '',
          },
        },
      },
      API: { endpoints: [props.api] },
    };

    const execOptions: childProcess.ExecSyncOptions = { stdio: 'inherit' };
    const webDeployment = new aws_s3_deployment.BucketDeployment(this, 'WebDeployment', {
      destinationBucket: uiBucket,
      distribution,
      sources: [
        aws_s3_deployment.Source.asset('ui', {
          exclude: ['node_modules', 'public/config.json'],
          bundling: {
            image: DockerImage.fromRegistry('alpine'),
            command: ['sh', '-c', 'echo "Docker build not supported. Please install esbuild."'],
            local: {
              tryBundle(outputDir: string) {
                try {
                  childProcess.execSync('esbuild --version', execOptions);
                  childProcess.execSync('cd ui/node_modules || (cd ui && npm ci)', execOptions);
                  childProcess.execSync('cd ui && npm run build', execOptions);
                  fsExtra.copySync('ui/out', outputDir);
                  return true;
                } catch {
                  return false;
                }
              },
            },
          },
        }),
      ],
    });

    const configDeployment = new aws_s3_deployment.BucketDeployment(this, 'ConfigDeployment', {
      destinationBucket: uiBucket,
      distribution,
      prune: false,
      sources: [aws_s3_deployment.Source.jsonData('config.json', config)],
    });
    configDeployment.node.addDependency(webDeployment);

    new CfnOutput(this, 'Endpoint', { value: distribution.distributionDomainName });
    new CfnOutput(this, 'FrontendConfig', { value: JSON.stringify(config) });
  }
}

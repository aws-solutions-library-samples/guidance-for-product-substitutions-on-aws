#!/usr/bin/env node

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SubstitutionsStack } from '../lib/substitutions-stack';
import { CfnGuardValidator } from '@cdklabs/cdk-validator-cfnguard';

const app = new cdk.App({
  policyValidationBeta1: [
    new CfnGuardValidator({
      disabledRules: [
        'ct-s3-pr-2', // https://docs.aws.amazon.com/controltower/latest/userguide/s3-rules.html#ct-s3-pr-2-description
        'ct-s3-pr-4', // https://docs.aws.amazon.com/controltower/latest/userguide/s3-rules.html#ct-s3-pr-4-description
        'ct-lambda-pr-2', // https://docs.aws.amazon.com/controltower/latest/userguide/lambda-rules.html#ct-lambda-pr-2-description
      ],
    }),
  ],
});

new SubstitutionsStack(app, 'SubstitutionsStack', {
  description: 'AWS Product Substitutions (uksb-1tupboc20) (SO9252)',
});

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os

dynamodb = boto3.resource('dynamodb')
count_table = dynamodb.Table(os.environ.get('countTableName'))


def handler(event, context):
    count = 0

    for r, record in enumerate(event['Records']):
        if (record['eventName'] == 'INSERT'):
            count = count + 1
        elif (record['eventName'] == 'REMOVE'):
            count = count - 1

    count_table.update_item(
        Key={
            'type': 'products'
        },
        UpdateExpression='SET #count = #count + :increase',
        ExpressionAttributeNames={
            '#count': 'count'
        },
        ExpressionAttributeValues={
            ':increase': count
        },
    )

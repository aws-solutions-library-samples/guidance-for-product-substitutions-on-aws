# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import csv
import json
import os
from threading import Thread
import boto3
import botocore.response
from decimal import Decimal
import uuid
import sys

multi = True
debug = False
limit = 500 if debug else sys.maxsize

bucket_name = os.environ.get('bucket')
sqs = boto3.client('sqs', region_name="eu-west-1")
queueUrl = os.environ.get('queueUrl')
s3 = boto3.resource('s3')
batch_size = 100000
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('tableName'))
count_table = dynamodb.Table(os.environ.get('countTableName'))


def init_count():
    response = count_table.get_item(
        Key={
            'type': 'products'
        }
    )
    if not 'Item' in response:
        count_table.put_item(
            Item={
                'type': 'products',
                'count': 0
            }
        )


def handler(event, context):
    objs = []
    init_count()

    if 'Records' in event:
        for record in event['Records']:
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']

            if not key.endswith('.jsonl'):
                continue

            obj = s3.Object(bucket, key)
            objs.append(obj)

    # Allow manual triggering
    elif 'keys' in event:
        bucket = bucket_name
        keys = event['keys']

        for key in keys:
            obj = s3.Object(bucket, key)
            objs.append(obj)

    for obj in objs:
        lines = obj.get()['Body'].read().decode('utf-8').split('\n')[:limit]
        n_lines = len(lines)
        threads = []
        batch_id = str(uuid.uuid4())
        item_counts = dict()

        if multi:
            for i in range(0, n_lines, batch_size):
                x = Thread(target=handle_batch, args=(
                    lines, i, i+batch_size, batch_id, item_counts, ))
                threads.append(x)
                x.start()

            for thread in threads:
                thread.join()
        else:
            for i in range(0, n_lines, batch_size):
                handle_batch(lines, i, i+batch_size, batch_id, item_counts)

        total_count = 0
        counts = list(item_counts.values())
        for count in counts:
            total_count = total_count + count


def handle_batch(lines, start, end, batch_id, item_counts):
    batch_lines = lines[start:end]
    count = 0
    print(f'{batch_id} {start} {len(batch_lines)}')

    with table.batch_writer() as writer:
        for line in batch_lines:
            try:
                item = json.loads(line)
                id = item['id']
                try:
                    ddb_item = item
                    if not item.get('price') == None:
                        ddb_item['price'] = Decimal(str(item.get('price')))

                    writer.put_item(Item={
                        **ddb_item,
                        'batchId': batch_id
                    })
                    count = count + 1
                except Exception as e:
                    print(f'could not put item {batch_id} - {id}')
                    print(str(e))
            except:
                print(f'could not read json for "{line}"')

    item_counts[f'{start}'] = count

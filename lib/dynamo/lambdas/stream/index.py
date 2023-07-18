# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import os
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth
import boto3
from sentence_transformers import SentenceTransformer
from threading import Thread
from datetime import datetime
from boto3.dynamodb.types import TypeDeserializer
deserializer = TypeDeserializer()

port = 443
host = os.environ.get('host')
region = os.environ.get('region')
service = 'es'
credentials = boto3.Session().get_credentials()
auth = AWSV4SignerAuth(credentials, region, service)

client = OpenSearch(
    hosts=[{'host': host, 'port': 443}],
    http_auth=auth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    pool_maxsize=20
)

index_name = 'products-index'

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
model.max_seq_length = 200

multi = False


def handler(event, context):
    print('n records:', len(event['Records']))
    threads = []

    if multi:
        for r, record in enumerate(event['Records']):
            x = Thread(target=handle_record, args=(record, r,))
            threads.append(x)
            x.start()

        for thread in threads:
            thread.join()
    else:
        for r, record in enumerate(event['Records']):
            handle_record(record, r)


def handle_record(record, r):
    serialized_item = record['dynamodb']['NewImage']
    item = {k: deserializer.deserialize(v) for k, v in serialized_item.items()}

    start = datetime.now()
    start_time = start.strftime("%H:%M:%S")

    if (not record['eventName'] == 'REMOVE'):
        id = item['id']
        name = item['title']
        description = item.get('description') or ''
        name_description_vector = list(
            model.encode(sentences=name+'\n'+description))
        body = {
            **item,
            'name_description_vector': name_description_vector
        }
        try:
            client.index(index=index_name, body=body, id=id, refresh=True)
            end = datetime.now()
            end_time = end.strftime("%H:%M:%S")
            seconds = (end - start).total_seconds()
            print(f'indexed {id} - {start_time} - {end_time} - {seconds}s')
        except:
            print('index error:')
            print(f'id {id}')
            print(
                f'name_description_vector {len(name_description_vector)} {name_description_vector}')
            raise Exception(f'Could not index {id}')

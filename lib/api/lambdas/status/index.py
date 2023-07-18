# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth

table_name = os.environ.get('tableName')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(table_name)

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

table = dynamodb.Table(os.environ.get('tableName'))


def ddb_count():
    response = table.get_item(
        Key={
            'type': 'products'
        }
    )
    return response['Item']['count']


def handler(event, context):
    os_count_rsp = client.count(
        body=None, index=index_name, params=None, headers=None)
    return {
        'products_in_table': ddb_count(),
        'products_in_opensearch': os_count_rsp['count']
    }

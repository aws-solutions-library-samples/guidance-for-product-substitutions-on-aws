# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import os
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth
import boto3

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

vector_size = 384

index_name = 'products-index'
index_body = {
    'mappings': {
        'properties': {
            # 'name_vector': {
            #     'type': 'knn_vector',
            #     'dimension': vector_size
            # },
            # 'description_vector': {
            #     'type': 'knn_vector',
            #     'dimension': vector_size
            # },
            'name_description_vector': {
                'type': 'knn_vector',
                'dimension': vector_size
            },
            # 'vector_concat_vector': {
            #     'type': 'knn_vector',
            #     'dimension': vector_size*2
            # },
            "categories": {
                "type": "keyword",
                "ignore_above": 256
            },
            "brand": {
                "type": "keyword"
            },
            "allergens": {
                "type": "keyword",
                "ignore_above": 256
            },
            "diet_type": {
                "type": "keyword",
                "ignore_above": 256
            },
        }
    }
}


def handler(event, context):
    if 'Delete' in event and event['Delete'] == True:
        response = client.indices.delete(index_name)
    else:
        response = client.indices.create(index_name, body=index_body)

    return response

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import os
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth
import boto3

port = 443
host = os.environ.get("host")
region = os.environ.get("region")
service = "es"
credentials = boto3.Session().get_credentials()
auth = AWSV4SignerAuth(credentials, region, service)

client = OpenSearch(
    hosts=[{"host": host, "port": 443}],
    http_auth=auth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    pool_maxsize=20,
)

index_name = "products-index"


def handler(event, context):
    queryString = event.get("queryStringParameters", {})
    search = queryString.get("search", "")
    pageFrom = queryString.get("pageFrom", 0)
    size = queryString.get("size", 10)

    body = {"from": pageFrom, "size": size, "query": {"match": {"title": search}}}
    if search == "":
        body["query"] = {"match_all": {}}

    result = client.search(body, index=index_name)

    hits = result["hits"]
    count = hits["total"]["value"]
    osItems = hits["hits"]

    items = []

    for osItem in osItems:
        item = osItem["_source"]
        del item["batchId"]
        del item["name_description_vector"]
        items.append(item)

    return {"items": items, "count": count}

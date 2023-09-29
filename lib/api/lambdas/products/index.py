# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import os

table_name = os.environ.get("tableName")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(table_name)


def handler(event, context):
    scan_kwargs = {"Limit": 15}
    if (
        "queryStringParameters" in event
        and "pagination_key" in event["queryStringParameters"]
    ):
        scan_kwargs["ExclusiveStartKey"] = {
            "id": event["queryStringParameters"]["pagination_key"]
        }

    result = table.scan(**scan_kwargs)
    return {
        "items": result["Items"],
        "pagination_key": result["LastEvaluatedKey"]["id"],
    }

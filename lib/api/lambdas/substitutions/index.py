# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import os
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth
import boto3
import json
from custom_filter_script import custom_filter_script

port = 443
host = os.environ.get('host')
region = os.environ.get('region')
service = 'es'
credentials = boto3.Session().get_credentials()
auth = AWSV4SignerAuth(credentials, region, service)

# client = OpenSearch(
#     hosts=[{'host': host, 'port': port}],
#     http_auth=auth,
#     http_compress=True,
#     use_ssl=True,
#     ssl_assert_hostname=False,
#     ssl_show_warn=False,
# )
client = OpenSearch(
    hosts=[{'host': host, 'port': 443}],
    http_auth=auth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    pool_maxsize=20
)

index_name = 'products-index'


def format_results(result):
    neighboursResult = result['hits']['hits']
    neighbours = []

    for neighbour in neighboursResult:
        neighbour_id = neighbour['_id']
        if id == neighbour_id:
            continue
        neighbour_product = neighbour['_source']
        del neighbour_product['name_description_vector']
        del neighbour_product['batchId']
        neighbours.append(neighbour_product)

    return neighbours


def search(id, product, filters=None, size=None):
    maxNeighbours = 5
    size = int(size) if not size == None else maxNeighbours

    print('filters', json.dumps(filters, indent=2))

    if not filters:
        body = {
            "size": size,
            "query": {
                "script_score": {
                    "query": {
                        "match_all": {}
                    },
                    "script": {
                        "source": "knn_score",
                        "lang": "knn",
                        "params": {
                            "field": 'name_description_vector',
                            "query_value": product['name_description_vector'],
                            "space_type": "cosinesimil"
                        }
                    }
                }
            }
        }

    else:
        filters_exp = dict()

        if not filters.get('price_factor') == None:
            f = filters['price_factor']
            filters_exp.update({
                "range": {"price": {"gte": product['price']/f, "lte": product['price']*f}}
            })

        if not filters.get('category_match_level') == None:
            c = filters['category_match_level']
            cats = product["categories"]
            cats_to_match = cats if c == 0 else cats[:c]
            terms = []

            for cat in cats_to_match:
                terms.append({
                    'term': {'categories': cat}
                })

            filters_exp.update({
                "bool": {"must": terms}
            })

        if not filters.get('diet_type_match_count') == None:
            d = filters['diet_type_match_count']
            diets = product['diet_type']
            d = len(diets) if d == 0 else d

            filters_exp.update({
                "terms_set": {
                    "diet_type": {
                        "terms": diets,
                        "minimum_should_match_script": {
                            "source": f"{d}"
                        }
                    }
                }
            })

        if filters.get('brand_match') == True:
            filters_exp.update({
                "match_phrase": {
                    "brand": product['brand']
                }
            })

        if filters.get('no_new_allergens') == True:
            exp = {
                "script": {
                    "script": {
                        "source": """
                            def subsetTerms = params.subsetTerms;
                            def allergens = doc['allergens'];
                            for (item in allergens) {
                                if (!subsetTerms.contains(item)) {
                                    return false;
                                }
                            }
                            return true;
                        """,
                        "lang": "painless",
                        "params": {
                            "subsetTerms": product['allergens']
                        }
                    }
                }
            }

            if (not filters_exp.get('bool') == None) and (not filters_exp['bool'].get('must') == None):
                filters_exp['bool']['must'].append(exp)

            else:
                filters_exp.update({
                    "bool": {"must": [exp]}
                })

        if filters.get('custom_filter_script') == True:
            if (not filters_exp.get('bool') == None) and (not filters_exp['bool'].get('must') == None):
                filters_exp['bool']['must'].append(
                    custom_filter_script(product))

            else:
                filters_exp.update({
                    "bool": {"must": [custom_filter_script(product)]}
                })

        print(filters_exp)

        body = {
            "size": size,
            "query": {
                "script_score": {
                    "query": {
                        "bool": {
                            "filter": filters_exp
                        }
                    },
                    "script": {
                        "source": "knn_score",
                        "lang": "knn",
                        "params": {
                            "field": 'name_description_vector',
                            "query_value": product['name_description_vector'],
                            "space_type": "cosinesimil"
                        }
                    }
                }
            }
        }

    neighboursQueryResult = client.search(body, index=index_name)
    return format_results(neighboursQueryResult)


def handler(event, context):
    if 'body' in event:
        body = event['body']
        print(body)
        result = client.search(body, index=index_name)
        return format_results(result)

    id = event['queryStringParameters']['id']
    price_factor = event['queryStringParameters'].get('price_factor')
    category_match_level = event['queryStringParameters'].get(
        'category_match_level')
    diet_type_match_count = event['queryStringParameters'].get(
        'diet_type_match_count')
    brand_match = event['queryStringParameters'].get('brand_match')
    no_new_allergens = event['queryStringParameters'].get('no_new_allergens')
    custom_filter_script = event['queryStringParameters'].get(
        'custom_filter_script')
    size = event['queryStringParameters'].get('size')

    print('id', id)
    print('category_match_level', category_match_level)
    print('price_factor', price_factor)
    print('diet_type_match_count', diet_type_match_count)
    print('brand_match', brand_match)
    print('no_new_allergens', no_new_allergens)
    print('custom_filter_script', custom_filter_script)

    productQueryResult = client.get(index_name, id)
    product = productQueryResult['_source']

    filters = {}

    if not price_factor == None:
        filters.update({
            'price_factor': float(price_factor),
        })

    if not category_match_level == None:
        filters.update({
            'category_match_level': int(category_match_level)
        })

    if not diet_type_match_count == None:
        filters.update({
            'diet_type_match_count': int(diet_type_match_count)
        })

    if not brand_match == None:
        filters.update({
            'brand_match': bool(brand_match)
        })

    if not no_new_allergens == None:
        filters.update({
            'no_new_allergens': bool(no_new_allergens)
        })

    if not custom_filter_script == None:
        filters.update({
            'custom_filter_script': bool(custom_filter_script)
        })

    name_description_neighbours = search(id, product, filters, size)

    response = {
        'substitutions': name_description_neighbours
    }

    return response

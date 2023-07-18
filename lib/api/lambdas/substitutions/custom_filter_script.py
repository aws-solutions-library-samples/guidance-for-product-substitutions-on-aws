# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# User-modifiable script for custom pre-filtering.
# Uses the 'Painless' language
# https://www.elastic.co/guide/en/elasticsearch/painless/current/painless-walkthrough.html
def custom_filter_script(query_product):
    script = {
        "script": {
            "script": {
                "source": """
                    return true;
                """,
                "lang": "painless"
            }
        }
    }

    return script


# Example implementation to handle a custom field 'ingredients'
# Returns true if the candidate product contains one or more ingredients found in the query product
def __custom_filter_script_example__(query_product):
    script = {
        "script": {
            "script": {
                "source": """
                    def queryIngredients = params.queryIngredients;
                    def ingredients = doc['ingredients'];
                    for (ingredient in ingredients) {
                        if (queryIngredients.contains(ingredient)) {
                            return true;
                        }
                    }
                    return false;
                """,
                "lang": "painless",
                "params": {
                    "queryIngredients": query_product['ingredients']
                }
            }
        }
    }

    return script

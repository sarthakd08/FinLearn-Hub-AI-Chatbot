import { tool } from "@langchain/core/tools";


export const getCoursesTool = tool(
    async () => {
        /* TODO: Get the offers and discounts from the database via api call */
        return JSON.stringify([{
            "code": "EARLY_BIRDS_DISCOUNT",
            "discount_percentage": "30",
            "description": "This is a discount code for the early birds",
            "valid_from": "2025-01-01",
            "valid_to": "2025-01-01",
            "usage_count": 100,
            "usage_limit": 100,
            "usage_limit_per_user": 1,
            "usage_limit_per_user_per_code": 1,
        }, {
            "code": "DIWALI_DISCOUNT",
            "discount_percentage": "20",
            "description": "This is a discount code for the diwali",
            "valid_from": "2025-01-01",
            "valid_to": "2025-01-01",
            "usage_count": 100,
            "usage_limit": 100,
            "usage_limit_per_user": 1,
        }])

    }, 
    {   
        name: "offers_query_tool",
        description: "Use this tool to query the offers and discounts available for the user",
    }
);
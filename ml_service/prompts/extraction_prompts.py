def get_extraction_prompt(doc_type):
    base_prompt = "You are a data extraction engine. Extract the following fields into JSON format. If a field is missing, return null."

    if doc_type == "PAN Card":
        return f"""{base_prompt}
        Fields to extract:
        - pan_number
        - full_name
        - date_of_birth
        """
    
    elif doc_type == "Aadhaar Card":
        return f"""{base_prompt}
        Fields to extract:
        - aadhaar_number (xxxx-xxxx-xxxx format)
        - full_name
        - address_pincode
        """

    elif doc_type == "7/12 Land Record":
        return f"""{base_prompt}
        Fields to extract:
        - land_owner_names (list)
        - survey_number
        - total_area_hectares
        """

    else:
        return f"""{base_prompt}
        Summarize the key entities found in this document (Dates, Amounts, Names).
        """
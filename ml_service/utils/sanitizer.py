def mask_pii(data):
    """
    Simple function to mask the middle digits of sensitive IDs before logging.
    """
    if "aadhaar_number" in data and data["aadhaar_number"]:
        # Mask middle digits: 1234-XXXX-9012
        val = data["aadhaar_number"]
        if len(val) >= 12:
            data["aadhaar_number"] = val[:4] + "-XXXX-" + val[-4:]
            
    return data
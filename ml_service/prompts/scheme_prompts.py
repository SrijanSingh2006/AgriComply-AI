def get_scheme_discovery_prompt(user_profile):
    role = user_profile.get('role', 'Farmer')
    state = user_profile.get('location', 'India')
    
    return f"""
    Act as a senior financial advisor for {state}, India.
    User Profile: Role={role}.

    Task: Recommend 3 specific Government Schemes and 3 Bank Loans highly relevant to this user.
    
    CRITICAL: Output purely strictly valid JSON. No markdown, no intro text.
    Structure:
    {{
      "schemes": [
        {{
          "name": "Scheme Name",
          "type": "State/Central",
          "description": "One sentence summary",
          "benefit": "e.g. ₹10,000 Subsidy",
          "required_docs": ["List", "Of", "Exact", "Document", "Tags"] 
        }}
      ],
      "loans": [
        {{
          "name": "Loan Name",
          "bank": "Bank Name",
          "interest_rate": "e.g. 7%",
          "description": "One sentence summary",
          "required_docs": ["List", "Of", "Exact", "Document", "Tags"]
        }}
      ]
    }}

    USE ONLY THESE DOCUMENT TAGS FOR 'required_docs':
    [Aadhaar, PAN, LandRecord, BankStatement, ITR-V, Quotation, UdyamRegistration, GST_Certificate, ProjectReport, PassportPhoto]
    
    If a scheme requires a document not in this list, map it to the closest one or omit it.
    """
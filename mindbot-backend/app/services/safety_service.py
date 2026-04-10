def check_content_safety(text: str) -> dict:
    """
    A basic content moderation layer that checks for unsafe keywords 
    or intents before passing the query to the main AI model.
    """
    text_lower = text.lower()
    
    # Define a list of forbidden topics or keywords
    unsafe_keywords = [
        "hack", "bypass", "illegal", "violence", "harm", 
        "steal", "exploit", "malware", "virus", "bomb"
    ]
    
    # Check if any unsafe keyword is in the text
    for word in unsafe_keywords:
        if word in text_lower:
            return {
                "is_safe": False,
                "reason": f"Content flagged for violating safety policy (keyword: {word})."
            }
            
    # If no keywords are found, it's considered safe
    return {
        "is_safe": True,
        "reason": "Content passed safety check."
    }
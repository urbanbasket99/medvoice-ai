import re


def pick_highlight(query: str, *fields: str | None) -> str | None:
    normalized = query.strip().lower()
    if not normalized:
        return next((field for field in fields if field), None)

    for field in fields:
        if field and normalized in field.lower():
            return field
    return next((field for field in fields if field), None)


def highlight_matches(text: str, query: str) -> str:
    if not text or not query.strip():
        return text

    pattern = re.compile(re.escape(query.strip()), re.IGNORECASE)
    return pattern.sub(lambda match: f"<mark>{match.group(0)}</mark>", text)

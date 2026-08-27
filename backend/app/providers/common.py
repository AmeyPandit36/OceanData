import csv
import io
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.models import QueryRequest
from app.providers.base import ProviderError

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"


def parse_erddap_csv(text: str) -> tuple[list[dict[str, str]], dict[str, str]]:
    reader = csv.DictReader(io.StringIO(text))
    rows = list(reader)
    if not reader.fieldnames or not rows:
        raise ProviderError("The provider returned no observations for this request.", status_code=404)
    units = rows.pop(0)
    cleaned = [{key: (value.strip() if value else "") for key, value in row.items()} for row in rows]
    if not cleaned:
        raise ProviderError("The provider returned headers but no observations for this request.", status_code=404)
    return cleaned, units


def store_raw(provider: str, request: QueryRequest, url: str, text: str) -> tuple[str, str, str]:
    request_id = uuid4().hex[:12]
    retrieved_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    path = RAW_DIR / f"{request_id}.json"
    path.write_text(json.dumps({
        "request_id": request_id,
        "provider": provider,
        "retrieved_at": retrieved_at,
        "request": request.model_dump(),
        "provider_url": url,
        "raw_response": text,
    }, indent=2), encoding="utf-8")
    return request_id, retrieved_at, str(path.relative_to(RAW_DIR.parents[1]))


def value_range(rows: list[dict[str, Any]], key: str) -> tuple[Any, Any]:
    values = [row.get(key) for row in rows if row.get(key) is not None]
    return (min(values), max(values)) if values else (None, None)

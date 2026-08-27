from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


ProviderId = Literal["noaa-oisst", "argo"]


class QueryRequest(BaseModel):
    provider: ProviderId
    dataset: str
    parameters: list[str] = Field(min_length=1)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    start_date: str | None = None
    end_date: str | None = None
    platform_number: str | None = None
    cycle_number: int | None = Field(default=None, ge=0)
    limit: int = Field(default=25, ge=1, le=100)

    @model_validator(mode="after")
    def validate_provider_fields(self):
        allowed = {
            "noaa-oisst": {"sst", "anom", "err", "ice"},
            "argo": {"pres", "temp", "psal"},
        }
        unsupported = set(self.parameters) - allowed[self.provider]
        if unsupported:
            raise ValueError(f"Unsupported parameters for {self.provider}: {', '.join(sorted(unsupported))}")
        if self.provider == "noaa-oisst":
            if self.latitude is None or self.longitude is None or not self.start_date:
                raise ValueError("NOAA OISST requires latitude, longitude, and a date")
            try:
                date.fromisoformat(self.start_date)
            except ValueError as exc:
                raise ValueError("NOAA OISST date must use YYYY-MM-DD") from exc
        if self.provider == "argo":
            if not self.platform_number or self.cycle_number is None:
                raise ValueError("ARGO requires a platform number and cycle number")
            if not self.platform_number.isdigit():
                raise ValueError("ARGO platform number must contain digits only")
        return self


class BrowserProviderResponse(BaseModel):
    request: QueryRequest
    provider_url: str
    provider_status: int = Field(ge=200, le=299)
    raw_response: str = Field(min_length=1, max_length=5_000_000)


class QueryResult(BaseModel):
    request_id: str
    provider: str
    dataset: str
    provider_url: str
    provider_status: int
    transport: Literal["backend", "browser"] = "backend"
    status: Literal["success"]
    parameters_sent: dict[str, Any]
    observation_count: int
    variables: list[dict[str, str]]
    time_range: dict[str, str | None]
    spatial_range: dict[str, float | None]
    records: list[dict[str, Any]]
    retrieved_at: str
    raw_response_path: str

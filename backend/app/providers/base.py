from abc import ABC, abstractmethod
from typing import Any

import httpx

from app.models import QueryRequest, QueryResult


class ProviderError(Exception):
    def __init__(self, message: str, *, status_code: int = 502, provider_url: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.provider_url = provider_url


class ProviderConnector(ABC):
    id: str
    name: str

    @abstractmethod
    def get_datasets(self) -> list[dict[str, Any]]: ...

    @abstractmethod
    def get_metadata(self, dataset: str) -> dict[str, Any]: ...

    @abstractmethod
    async def check_availability(self, request: QueryRequest) -> dict[str, Any]: ...

    @abstractmethod
    async def query_data(self, request: QueryRequest) -> QueryResult: ...

    @abstractmethod
    def normalize_data(self, rows: list[dict[str, Any]], request: QueryRequest) -> list[dict[str, Any]]: ...

    @abstractmethod
    def build_url(self, request: QueryRequest) -> str: ...

    @abstractmethod
    def process_response(self, request: QueryRequest, url: str, status: int, text: str) -> QueryResult: ...

    async def get_text(self, url: str) -> tuple[int, str]:
        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(url, headers={"User-Agent": "OceanData/0.1 (+provider feasibility research)"})
                response.raise_for_status()
                return response.status_code, response.text
        except httpx.TimeoutException as exc:
            raise ProviderError("The provider did not respond within 30 seconds.", provider_url=url) from exc
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:300].strip()
            raise ProviderError(
                f"Provider returned HTTP {exc.response.status_code}: {detail}",
                status_code=exc.response.status_code,
                provider_url=str(exc.request.url),
            ) from exc
        except httpx.HTTPError as exc:
            raise ProviderError(f"Could not establish a secure connection to the provider: {exc}", provider_url=url) from exc

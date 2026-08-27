from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models import BrowserProviderResponse, QueryRequest, QueryResult
from app.providers.argo import ArgoConnector
from app.providers.base import ProviderConnector, ProviderError
from app.providers.noaa import NOAAConnector

app = FastAPI(title="OceanData API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.e2b\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

connectors: dict[str, ProviderConnector] = {
    "noaa-oisst": NOAAConnector(),
    "argo": ArgoConnector(),
}


@app.exception_handler(ProviderError)
async def provider_error_handler(_: Request, exc: ProviderError):
    return JSONResponse(
        status_code=exc.status_code if 400 <= exc.status_code < 600 else 502,
        content={"error": "provider_request_failed", "message": str(exc), "provider_url": exc.provider_url},
    )


@app.get("/api/health")
async def health():
    return {"status": "ok", "providers": list(connectors)}


@app.get("/api/providers")
async def providers():
    return [{"id": connector.id, "name": connector.name, "datasets": connector.get_datasets()} for connector in connectors.values()]


def connector_for(request: QueryRequest) -> ProviderConnector:
    connector = connectors.get(request.provider)
    if not connector:
        raise HTTPException(status_code=404, detail="Provider connector not found")
    available_datasets = {item["id"] for item in connector.get_datasets()}
    if request.dataset not in available_datasets:
        raise HTTPException(status_code=400, detail="Dataset is not registered to this provider connector")
    return connector


@app.post("/api/query", response_model=QueryResult)
async def query(request: QueryRequest):
    connector = connector_for(request)
    await connector.check_availability(request)
    return await connector.query_data(request)


@app.post("/api/browser-response", response_model=QueryResult)
async def process_browser_response(payload: BrowserProviderResponse):
    """Process a public provider response fetched by the browser when local server egress is blocked."""
    connector = connector_for(payload.request)
    expected_url = connector.build_url(payload.request)
    if payload.provider_url != expected_url:
        raise HTTPException(status_code=400, detail="Provider URL does not match the connector-generated request")
    result = connector.process_response(
        payload.request,
        payload.provider_url,
        payload.provider_status,
        payload.raw_response,
    )
    result.transport = "browser"
    return result

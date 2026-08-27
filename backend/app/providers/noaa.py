from typing import Any
from urllib.parse import quote

from app.models import QueryRequest, QueryResult
from app.providers.base import ProviderConnector
from app.providers.common import parse_erddap_csv, store_raw, value_range


class NOAAConnector(ProviderConnector):
    id = "noaa-oisst"
    name = "NOAA OISST"
    dataset_id = "ncdcOisst21Agg_LonPM180"
    base_url = "https://coastwatch.pfeg.noaa.gov/erddap/griddap"
    variable_units = {"sst": "degree_C", "anom": "degree_C", "err": "degree_C", "ice": "1"}

    def get_datasets(self) -> list[dict[str, Any]]:
        return [{"id": self.dataset_id, "name": "OISST v2.1 AVHRR-only daily", "parameters": list(self.variable_units)}]

    def get_metadata(self, dataset: str) -> dict[str, Any]:
        return {"spatial_resolution": "0.25°", "temporal_resolution": "daily", "coverage": "global"}

    def build_url(self, request: QueryRequest) -> str:
        date = request.start_date
        latitude = float(request.latitude)
        longitude = float(request.longitude)
        selection = f"[({date}T12:00:00Z)][(0.0)][({latitude})][({longitude})]"
        projections = ",".join(f"{parameter}{selection}" for parameter in request.parameters)
        return f"{self.base_url}/{self.dataset_id}.csv?{quote(projections, safe='[],():.-_')}"

    async def check_availability(self, request: QueryRequest) -> dict[str, Any]:
        url = self.build_url(request)
        status, text = await self.get_text(url)
        rows, _ = parse_erddap_csv(text)
        return {"available": bool(rows), "url": url, "status": status}

    async def query_data(self, request: QueryRequest) -> QueryResult:
        url = self.build_url(request)
        status, text = await self.get_text(url)
        return self.process_response(request, url, status, text)

    def process_response(self, request: QueryRequest, url: str, status: int, text: str) -> QueryResult:
        source_rows, units = parse_erddap_csv(text)
        rows = self.normalize_data(source_rows, request)
        request_id, retrieved_at, raw_path = store_raw(self.id, request, url, text)
        time_min, time_max = value_range(rows, "timestamp")
        lat_min, lat_max = value_range(rows, "latitude")
        lon_min, lon_max = value_range(rows, "longitude")
        return QueryResult(
            request_id=request_id, provider=self.name, dataset=self.dataset_id,
            provider_url=url, provider_status=status, status="success",
            parameters_sent=request.model_dump(exclude_none=True), observation_count=len(rows),
            variables=[{"name": p, "unit": units.get(p) or self.variable_units.get(p, "") } for p in request.parameters],
            time_range={"start": time_min, "end": time_max},
            spatial_range={"min_latitude": lat_min, "max_latitude": lat_max, "min_longitude": lon_min, "max_longitude": lon_max},
            records=rows[:request.limit], retrieved_at=retrieved_at, raw_response_path=raw_path,
        )

    def normalize_data(self, rows: list[dict[str, Any]], request: QueryRequest) -> list[dict[str, Any]]:
        normalized = []
        for row in rows:
            item: dict[str, Any] = {
                "timestamp": row["time"], "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]), "depth": float(row.get("zlev") or 0),
                "provider": self.id, "dataset": self.dataset_id,
            }
            for parameter in request.parameters:
                raw = row.get(parameter, "")
                item[parameter] = None if raw in ("", "NaN") else float(raw)
            normalized.append(item)
        return normalized

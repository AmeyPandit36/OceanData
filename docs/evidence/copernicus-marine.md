# Copernicus Marine — feasibility evidence

Investigation status: **catalog access confirmed; data extraction requires registered credentials and remains unverified in this environment**  
Last verified: **2026-08-27 UTC**

Provider: Copernicus Marine Service  
Dataset: Investigation sample: `GLOBAL_ANALYSISFORECAST_PHY_001_024`, daily temperature dataset `cmems_mod_glo_phy-thetao_anfc_0.083deg_P1D-m_202406`  
Official source: [Copernicus Marine Toolbox overview](https://toolbox-docs.marine.copernicus.eu/en/stable/usage/quickoverview.html), [programmatic access services](https://help.marine.copernicus.eu/en/articles/4794731-which-programmatic-access-services-are-available), and [official STAC record](https://stac.marine.copernicus.eu/metadata/GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy-thetao_anfc_0.083deg_P1D-m_202406/dataset.stac.json)  
Access mechanism: Copernicus Marine Toolbox CLI/Python API (`describe`, `get`, `subset`) backed by cloud object storage; public STAC metadata, plus WMTS visualization and CSW catalogue endpoints.  
Parameters: The sampled global physics product includes temperature, salinity, currents, sea level, mixed-layer depth and sea-ice variables across multiple datasets. The tested metadata record exposes `thetao` (sea-water potential temperature).  
Spatial resolution: Sample product is global at 1/12° (~0.0833°), latitude `-80..90`, longitude `-180..179.9167`, with 50 vertical levels to about 5,500 m. Resolution varies by product.  
Temporal resolution: Sample product includes hourly, 6-hourly, daily and monthly datasets. Tested `thetao` record is daily.  
Historical coverage: Product-specific. The tested forecast dataset metadata reports `2022-06-01` through `2026-09-05`; multi-year products provide longer reanalysis periods.  
Near-real-time status: Yes for analysis/forecast products; the sampled system is updated daily and provides a ten-day forecast.  
Authentication: Public metadata needs no login. Data retrieval through supported Toolbox `get`/`subset` flows requires a free Copernicus Marine account and credentials.  
Cost: **FREE WITH REGISTRATION** for data-service access, subject to the Copernicus Marine licence.  
Rate limits: Official Toolbox documentation states no data-size limit for the service; no numeric request-rate limit was identified in the reviewed documentation. Operational quotas/fair-use behavior still needs validation.  
Supported query types: Dataset description; variables; longitude/latitude bounding box or nearest point; time interval; depth/elevation interval; platform IDs for applicable datasets.  
Output formats: NetCDF and Zarr; Toolbox subset also supports CSV and Parquet where applicable.  
Test query: `GET https://stac.marine.copernicus.eu/metadata/GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy-thetao_anfc_0.083deg_P1D-m_202406/dataset.stac.json`  
Test result: **PARTIAL SUCCESS.** The live public STAC request returned a current feature record with `thetao`, bounds, time range, dimensions, update timestamp, and native NetCDF/time-chunked Zarr assets. A real value subset was not attempted because no operator credentials are present; metadata success is not being reported as data extraction success.  
Limitations: Registration is a connector deployment requirement. Catalogue schemas and product versions can change. The connector should use the maintained Toolbox rather than depending on internal object-store layout, and must surface credential absence as an actionable unavailable state.

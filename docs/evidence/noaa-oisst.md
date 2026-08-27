# NOAA OISST — feasibility evidence

Investigation status: **programmatic extraction confirmed**  
Last verified: **2026-08-27 UTC**

Provider: NOAA National Centers for Environmental Information (NCEI)  
Dataset: Optimum Interpolation Sea Surface Temperature (OISST) v2.1, AVHRR-only, daily  
Official source: [NOAA OISST data access](https://www.ncei.noaa.gov/products/optimum-interpolation-sst) and [NOAA CoastWatch ERDDAP dataset](https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg_LonPM180.html)  
Access mechanism: ERDDAP `griddap` over HTTPS; NOAA also publishes NetCDF via NCEI HTTP/THREDDS/OPeNDAP.  
Parameters: `sst` (sea-surface temperature), `anom` (SST anomaly), `err` (estimated error), `ice` (sea-ice concentration).  
Spatial resolution: Global 0.25° latitude/longitude grid.  
Temporal resolution: Daily.  
Historical coverage: September 1981 to present; the final and preliminary streams have different recency.  
Near-real-time status: Yes. NOAA publishes a preliminary v2.1 stream for recent dates; final values replace preliminary values after processing.  
Authentication: None for public ERDDAP/HTTP access.  
Cost: **FREE / OPEN** under NOAA’s public-data terms.  
Rate limits: No numeric limit was found in the official pages reviewed. Requests must be spatially and temporally bounded to avoid ERDDAP size/time failures.  
Supported query types: Grid index or coordinate constraints for time, depth, latitude, and longitude; point, bounding-box, and time-range subsets can be represented.  
Output formats: CSV, JSON, NetCDF, GeoTIFF and other ERDDAP grid formats; source files are NetCDF.  
Test query: `GET https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg_LonPM180.csv?sst[(2024-01-15T12:00:00Z)][(0.0)][(19.875)][(-70.125)]`  
Test result: **SUCCESS.** HTTP-readable CSV returned one real cell: time `2024-01-15T12:00:00Z`, depth `0.0 m`, latitude `19.875`, longitude `-70.125`, SST `26.86 degree_C`.  
Limitations: OISST is an analyzed gridded product, not an individual in-situ observation feed. Coordinates snap to grid cells. Land cells and missing source coverage may return fill values. Final and preliminary datasets must be handled explicitly rather than silently merged.

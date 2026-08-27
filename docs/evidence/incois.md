# INCOIS — feasibility evidence

Investigation status: **public ERDDAP extraction confirmed; a recently updated 10-day analysis qualifies as low-frequency near-real-time**  
Last verified: **2026-08-27 UTC**  

Provider: Indian National Centre for Ocean Information Services (INCOIS)  
Dataset: Extraction sample: `incois_argo_sst_weekly`; near-real-time candidate: `incois_argo_10day_McCreary` — INCOIS ARGO 10 Day data, Kessler-McCreary methodology  
Official source: [INCOIS ERDDAP REST documentation](https://erddap.incois.gov.in/erddap/rest.html), [weekly dataset metadata](https://erddap.incois.gov.in/erddap/info/incois_argo_sst_weekly/index.html), [10-day dataset metadata](https://erddap.incois.gov.in/erddap/info/incois_argo_10day_McCreary/index.html), and [active-dataset time bounds](https://erddap.incois.gov.in/erddap/tabledap/allDatasets.csv?datasetID,title,institution,minTime,maxTime)  
Access mechanism: Public INCOIS ERDDAP `griddap` over HTTPS; ERDDAP also advertises OPeNDAP and WMS interfaces.  
Parameters: The weekly sample exposes analyzed SST (`ASST`) and error (`ERR`). The 10-day dataset exposes objectively analyzed temperature and salinity, statistical means, standard deviations, RMSE, and observation counts across 24 vertical levels.  
Spatial resolution: Weekly sample: `30..120°E`, `30°S..30°N` at 0.25°. Ten-day product: `30.5..119.5°E`, `29.5°S..29.5°N` at 1°, with 24 levels from 5 to 2,000 m.  
Temporal resolution: Weekly for the extraction sample; approximately 10 days for the near-real-time product.  
Historical coverage: Weekly sample: `2009-01-07` through `2010-12-29`. Ten-day product: `2001-01-10` through `2026-07-30` at verification time.  
Near-real-time status: **YES, with material latency.** `incois_argo_10day_McCreary` and `incois_argo_10d_VAM` both reached `2026-07-30`; the tested product metadata records source processing on `2026-08-17`. On `2026-08-27`, the newest analyzed time was therefore 28 days old and the source file had been processed 10 days earlier. OceanData should classify these as **low-frequency near-real-time**, not real-time, and display the observed latency. The originally tested weekly SST dataset is archived and is not near-real-time.  
Authentication: None for these public ERDDAP datasets. Other INCOIS services may have separate conditions.  
Cost: **FREE / OPEN for the tested ERDDAP datasets**, under the licence text exposed in their metadata.  
Rate limits: No numeric public limit was found in the ERDDAP documentation reviewed. Requests should be tightly subsetted.  
Supported query types: Grid constraints by time, depth, latitude and longitude; point and bounding-box/time subsets are representable. ERDDAP search and metadata endpoints support discovery.  
Output formats: CSV, JSON, NetCDF, OPeNDAP responses, images and other standard ERDDAP formats.  
Test query: `GET https://erddap.incois.gov.in/erddap/griddap/incois_argo_sst_weekly.csv?ASST[(2010-01-06T00:00:00Z)][(0.0)][(60.0)]`  
Test result: **SUCCESS.** The live request returned one real analyzed cell at `2010-01-06T00:00:00Z`, latitude `0.0`, longitude `60.0`, with `ASST = 28.996922`. A second live request to `incois_argo_10day_McCreary` returned `T_ANALYZED = 29.569` at `2026-07-30T00:00:00Z`, depth `5 m`, latitude `0.5`, longitude `60.5`, confirming that the recent endpoint contains extractable data.  
Limitations: The low-frequency near-real-time product has a 28-day data lag in this verification and sparse provenance (`infoUrl` is `???`, `sourceUrl` is local files). Its temperature unit is recorded only as `degs`. It is programmatically usable, but these metadata and latency limitations must remain visible to operators.  

# INCOIS — feasibility evidence

Investigation status: **public ERDDAP extraction confirmed for one archived dataset; broader operational-product suitability remains under investigation**  
Last verified: **2026-08-27 UTC**

Provider: Indian National Centre for Ocean Information Services (INCOIS)  
Dataset: `incois_argo_sst_weekly` — INCOIS Argo SST weekly analysis  
Official source: [INCOIS ERDDAP REST documentation](https://erddap.incois.gov.in/erddap/rest.html) and [dataset metadata](https://erddap.incois.gov.in/erddap/info/incois_argo_sst_weekly/index.html)  
Access mechanism: Public INCOIS ERDDAP `griddap` over HTTPS; ERDDAP also advertises OPeNDAP and WMS interfaces.  
Parameters: Sample dataset exposes analyzed SST (`ASST`) and an error field (`ERR`). Other INCOIS catalogue datasets expose different ocean and forecast parameters and need dataset-by-dataset verification.  
Spatial resolution: Sample dataset covers `30..120°E`, `30°S..30°N` on a 0.25° grid.  
Temporal resolution: Weekly (7-day spacing).  
Historical coverage: Sample dataset covers `2009-01-07` through `2010-12-29` only. Broader provider coverage is dataset-specific.  
Near-real-time status: **No for this tested dataset.** Current operational datasets may exist in the catalogue but are not yet verified.  
Authentication: None for this public ERDDAP dataset. Other INCOIS services may have registration or access conditions and require separate evidence.  
Cost: **FREE / OPEN for the tested ERDDAP dataset**, under the licence text exposed in its metadata.  
Rate limits: No numeric public limit was found in the ERDDAP documentation reviewed. Requests should be tightly subsetted.  
Supported query types: Grid constraints by time, latitude and longitude; point and bounding-box/time subsets are representable. ERDDAP search and metadata endpoints support discovery.  
Output formats: CSV, JSON, NetCDF, OPeNDAP responses, images and other standard ERDDAP formats.  
Test query: `GET https://erddap.incois.gov.in/erddap/griddap/incois_argo_sst_weekly.csv?ASST[(2010-01-06T00:00:00Z)][(0.0)][(60.0)]`  
Test result: **SUCCESS.** The live request returned one real analyzed cell at `2010-01-06T00:00:00Z`, latitude `0.0`, longitude `60.0`, with `ASST = 28.996922`.  
Limitations: The confirmed dataset is archived, narrowly scoped, and is not evidence of a current INCOIS feed. Its metadata is sparse (`infoUrl` is `???`, `sourceUrl` is local files, and the unit attribute for `ASST` is absent). It is unsuitable as the first integrated INCOIS connector until a current, well-described dataset is proven.

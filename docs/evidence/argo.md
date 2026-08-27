# ARGO — feasibility evidence

Investigation status: **programmatic extraction confirmed**  
Last verified: **2026-08-27 UTC**

Provider: Argo Program, via the Coriolis Global Data Assembly Centre (GDAC)  
Dataset: `ArgoFloats` trajectory-profile aggregation  
Official source: [Argo: Data from GDACs](https://argo.ucsd.edu/data/data-from-gdacs/), [Argo file guide](https://argo.ucsd.edu/data/how-to-use-argo-files/), and [Coriolis ERDDAP dataset](https://erddap.ifremer.fr/erddap/info/ArgoFloats/index.html)  
Access mechanism: Public ERDDAP `tabledap` over HTTPS for queryable profiles; official GDAC NetCDF files are also available over HTTP, FTP, and rsync.  
Parameters: Core pressure, temperature, and practical salinity, with raw/adjusted values, errors, QC flags, platform/profile metadata; BGC profile files add approved biogeochemical parameters.  
Spatial resolution: Irregular point profiles from autonomous floats; nominal core-Argo profiles extend through the upper 2,000 m. This is not a fixed grid.  
Temporal resolution: Float-dependent; the typical core mission cycle is approximately 10 days. Each profile includes its measured timestamp.  
Historical coverage: Program observations date from 1999/2000 to present.  
Near-real-time status: Yes. Official Argo guidance states real-time profile files are generally available 12–24 hours after profile completion; delayed-mode QC follows later.  
Authentication: None for public GDAC and public Coriolis ERDDAP data.  
Cost: **FREE / OPEN**, with required acknowledgement/citation guidance.  
Rate limits: No numeric public limit was found in the official documentation reviewed. Wide tabledap requests are inherently large and must be bounded.  
Supported query types: ERDDAP constraints on time, latitude, longitude, pressure/depth, platform, cycle, data mode, parameter and QC variables; GDAC index files support client-side spatial/time discovery.  
Output formats: ERDDAP CSV, JSON, NetCDF and related table formats; canonical GDAC source format is Argo NetCDF. Euro-Argo’s selection tool also offers CSV and NetCDF variants.  
Test query: `GET https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.csv?platform_number,time,latitude,longitude,pres,temp,psal&platform_number="6904213"&cycle_number=103&orderByLimit("5")`  
Test result: **SUCCESS.** Five real depth levels were returned for float `6904213`, cycle `103`, at `2025-02-25T10:48:20Z`, latitude `-11.7763966667`, longitude `10.8530383333`. The first row contained pressure `6.1 dbar`, temperature `28.615 °C`, and salinity `36.027 PSU`.  
Limitations: Profiles have ragged vertical sampling and can expose raw, real-time adjusted, or delayed-mode values. Connector normalization must select adjusted values according to `DATA_MODE`, preserve QC flags, and never treat pressure as geometric depth without an explicit conversion.

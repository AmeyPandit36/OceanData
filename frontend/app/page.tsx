"use client";

import { FormEvent, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, Check, Database, Menu, Server, Waves } from "lucide-react";
import { ReadoutBar, type ReadoutStatus } from "@/components/readout-bar";
import { Button } from "@/components/ui/button";
import { executeQuery, type ProviderId, type QueryResult } from "@/lib/api";

const inputClass = "reading h-11 w-full rounded-md border border-[var(--line-strong)] bg-[var(--abyss)] px-3 text-sm text-[var(--foam)] outline-none transition-colors placeholder:text-[var(--faint)] focus:border-[var(--chart-cyan)] focus:ring-2 focus:ring-[var(--cyan-wash)]";

const providers = [
  { id: "noaa-oisst" as const, number: "01", name: "NOAA OISST", dataset: "OISST v2.1 AVHRR-only daily", detail: "Analyzed global sea-surface temperature · 0.25° grid", tag: "GRID" },
  { id: "argo" as const, number: "02", name: "ARGO", dataset: "Argo Float Measurements", detail: "In-situ vertical temperature and salinity profiles", tag: "PROFILE" },
];

function formatCoordinate(value: number | null, positive: string, negative: string) {
  if (value === null) return "—";
  return `${Math.abs(value).toFixed(3)}°${value >= 0 ? positive : negative}`;
}

function ResultPanel({ result }: { result: QueryResult }) {
  const columns = result.records.length ? Object.keys(result.records[0]) : [];
  const temperatures = result.records.map((record) => typeof record.temp === "number" ? record.temp : null).filter((v): v is number => v !== null);
  const points = temperatures.length > 1 ? temperatures.map((value, index) => {
    const min = Math.min(...temperatures); const max = Math.max(...temperatures); const span = max - min || 1;
    return `${(index / (temperatures.length - 1)) * 100},${84 - ((value - min) / span) * 64}`;
  }).join(" ") : "";

  return (
    <section aria-labelledby="result-title" className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line-strong)] pb-4">
        <div><div className="reading text-[10px] uppercase tracking-[0.18em] text-[var(--chart-cyan)]">Request / {result.request_id}</div><h2 id="result-title" className="display mt-1 text-2xl font-medium">Provider response</h2></div>
        <div className="reading flex items-center gap-2 text-xs text-[var(--chart-cyan)]"><Check className="size-4" /> HTTP {result.provider_status} · {result.observation_count} observation{result.observation_count === 1 ? "" : "s"}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Provider / dataset" value={result.provider} subvalue={result.dataset} />
        <Metric label="Observations" value={String(result.observation_count).padStart(2, "0")} subvalue={`Sample shows ${result.records.length}`} accent />
        <Metric label="Variables" value={result.variables.map((v) => v.name.toUpperCase()).join(" · ")} subvalue={result.variables.map((v) => v.unit || "unit not supplied").join(" · ")} />
        <Metric label="Retrieved" value={new Date(result.retrieved_at).toISOString().slice(11, 19)} subvalue={`${new Date(result.retrieved_at).toISOString().slice(0, 10)} UTC · ${result.transport} transport`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <div className="overflow-hidden rounded-lg border border-[var(--line-strong)] bg-[var(--depth-panel)]/75">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><h3 className="display font-medium">Returned extent</h3><Activity className="size-4 text-[var(--chart-cyan)]" /></div>
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2">
            <Extent label="Time start" value={result.time_range.start || "—"} />
            <Extent label="Time end" value={result.time_range.end || "—"} />
            <Extent label="Latitude" value={`${formatCoordinate(result.spatial_range.min_latitude, "N", "S")} → ${formatCoordinate(result.spatial_range.max_latitude, "N", "S")}`} />
            <Extent label="Longitude" value={`${formatCoordinate(result.spatial_range.min_longitude, "E", "W")} → ${formatCoordinate(result.spatial_range.max_longitude, "E", "W")}`} />
          </div>
        </div>
        <div className="relative min-h-52 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-[var(--abyss)] p-5">
          <div className="instrument-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative"><div className="reading text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Observation trace</div>
            {temperatures.length > 1 ? <div className="mt-6"><svg aria-label="Temperature profile trace" viewBox="0 0 100 90" className="h-28 w-full" preserveAspectRatio="none"><polyline points={points} fill="none" stroke="var(--chart-cyan)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg><div className="reading flex justify-between text-[10px] text-[var(--muted)]"><span>{Math.min(...temperatures).toFixed(3)} °C</span><span>{Math.max(...temperatures).toFixed(3)} °C</span></div></div> : <div className="mt-7"><div className="reading text-5xl font-medium text-[var(--chart-cyan)]">{String(result.records[0]?.sst ?? "—")}</div><div className="reading mt-2 text-xs text-[var(--muted)]">{result.variables[0]?.unit || "unit unavailable"}</div><p className="mt-6 text-sm leading-6 text-[var(--muted)]">One analyzed grid-cell reading returned by the provider.</p></div>}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--line-strong)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--depth-panel)] px-5 py-4"><h3 className="display font-medium">Real record sample</h3><span className="reading text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">Raw retained · {result.raw_response_path}</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-max border-collapse text-left"><thead><tr>{columns.map((column) => <th key={column} className="border-b border-[var(--line)] px-4 py-3 text-[9px] uppercase tracking-[0.16em] text-[var(--faint)]">{column.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{result.records.map((record, i) => <tr key={i} className="border-b border-[var(--line)] last:border-0">{columns.map((column) => <td key={column} className="reading px-4 py-3 text-xs text-[var(--foam)]">{record[column] === null ? "NULL" : String(record[column])}</td>)}</tr>)}</tbody></table></div>
      </div>

      <details className="rounded-lg border border-[var(--line)] bg-[var(--depth-panel)]/50 px-5 py-4"><summary className="cursor-pointer text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-cyan)]">Request parameters sent</summary><pre className="reading mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-[var(--muted)]">{JSON.stringify(result.parameters_sent, null, 2)}</pre><div className="mt-3 break-all border-t border-[var(--line)] pt-3"><span className="text-[9px] uppercase tracking-[0.16em] text-[var(--faint)]">Provider URL</span><div className="reading mt-1 text-xs text-[var(--chart-cyan)]">{decodeURIComponent(result.provider_url)}</div></div></details>
    </section>
  );
}

function Metric({ label, value, subvalue, accent = false }: { label: string; value: string; subvalue: string; accent?: boolean }) {
  return <div className="rounded-lg border border-[var(--line)] bg-[var(--depth-panel)]/70 p-4"><div className="text-[9px] uppercase tracking-[0.16em] text-[var(--faint)]">{label}</div><div className={`reading mt-3 truncate text-lg font-medium ${accent ? "text-[var(--chart-cyan)]" : "text-[var(--foam)]"}`}>{value}</div><div className="reading mt-1 truncate text-[10px] text-[var(--muted)]">{subvalue}</div></div>;
}
function Extent({ label, value }: { label: string; value: string }) { return <div className="bg-[var(--depth-panel)] px-5 py-4"><div className="text-[9px] uppercase tracking-[0.16em] text-[var(--faint)]">{label}</div><div className="reading mt-2 text-xs text-[var(--foam)]">{value}</div></div>; }

export default function Home() {
  const [provider, setProvider] = useState<ProviderId | null>(null);
  const [status, setStatus] = useState<ReadoutStatus>("idle");
  const [latitude, setLatitude] = useState("19.875");
  const [longitude, setLongitude] = useState("-70.125");
  const [date, setDate] = useState("2024-01-15");
  const [platform, setPlatform] = useState("6904213");
  const [cycle, setCycle] = useState("103");
  const [parameters, setParameters] = useState<string[]>(["sst"]);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<{ message: string; providerUrl?: string } | null>(null);

  const definition = providers.find((item) => item.id === provider);
  const readout = useMemo(() => {
    if (!provider) return {};
    if (result) return { position: `${formatCoordinate(result.spatial_range.min_latitude, "N", "S")} / ${formatCoordinate(result.spatial_range.min_longitude, "E", "W")}`, range: result.time_range.start || "—" };
    if (provider === "noaa-oisst") return { position: `${latitude || "—"} / ${longitude || "—"}`, range: date || "—" };
    return { position: `FLOAT ${platform || "—"}`, range: `CYCLE ${cycle || "—"}` };
  }, [provider, result, latitude, longitude, date, platform, cycle]);

  function chooseProvider(id: ProviderId) {
    setProvider(id); setStatus("selecting"); setResult(null); setError(null);
    setParameters(id === "noaa-oisst" ? ["sst"] : ["pres", "temp", "psal"]);
  }
  function edited(setter: (value: string) => void, value: string) { setter(value); setStatus("selecting"); setResult(null); setError(null); }
  function toggleParameter(parameter: string) { setParameters((current) => current.includes(parameter) ? current.filter((item) => item !== parameter) : [...current, parameter]); setStatus("selecting"); setResult(null); setError(null); }

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!provider || !parameters.length) return;
    setStatus("checking"); setError(null); setResult(null);
    const payload = provider === "noaa-oisst" ? { provider, dataset: "ncdcOisst21Agg_LonPM180", parameters, latitude: Number(latitude), longitude: Number(longitude), start_date: date, end_date: date, limit: 25 } : { provider, dataset: "ArgoFloats", parameters, platform_number: platform, cycle_number: Number(cycle), limit: 25 };
    try { const response = await executeQuery(payload); setResult(response); setStatus("success"); }
    catch (reason) { const failure = reason as Error & { providerUrl?: string }; setError({ message: failure.message, providerUrl: failure.providerUrl }); setStatus("failed"); }
  }

  return <main className="relative min-h-screen overflow-hidden"><div aria-hidden="true" className="instrument-grid pointer-events-none absolute inset-0 opacity-25" /><div aria-hidden="true" className="contours pointer-events-none absolute inset-0 opacity-65" />
    <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 sm:px-6 lg:px-10 lg:py-7"><a href="#explorer" className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-cyan)]"><span className="grid size-9 place-items-center rounded-full border border-[var(--chart-cyan)] bg-[var(--cyan-wash)] text-[var(--chart-cyan)]"><Waves className="size-5" /></span><span><span className="display block text-lg font-semibold leading-none tracking-[-0.03em]">OceanData</span><span className="reading mt-1 block text-[9px] uppercase tracking-[0.18em] text-[var(--faint)]">Observation console</span></span></a><nav className="hidden gap-8 text-sm text-[var(--muted)] md:flex"><a className="text-[var(--foam)] underline decoration-[var(--chart-cyan)] decoration-2 underline-offset-8" href="#explorer">Explorer</a><a href="#providers">Providers</a><a href="#results">Request log</a></nav><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button><div className="reading hidden items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] md:flex"><span className="size-1.5 rounded-full bg-[var(--chart-cyan)]" /> 2 verified connectors</div></header>
    <ReadoutBar status={status} provider={definition?.name} dataset={definition?.dataset} position={readout.position} range={readout.range} />
    <div id="explorer" className="relative z-10 mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-14">
      <section className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-14"><div><div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--chart-cyan)]"><span className="h-px w-8 bg-[var(--chart-cyan)]" /> Source explorer</div><h1 className="display text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl">Build a request.<br/><span className="text-[var(--muted)]">Prove the response.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-[var(--muted)]">Every execution contacts the selected authority. Empty and failed responses stay visible; successful raw payloads are retained separately.</p><div className="mt-8 flex items-center gap-3 border-t border-[var(--line)] pt-5"><Server className="size-4 text-[var(--chart-cyan)]"/><span className="reading text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">FastAPI · ERDDAP · CSV</span></div></div>
        <div id="providers"><div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--faint)]">01 / Select authoritative source</div><div className="grid gap-3 sm:grid-cols-2">{providers.map((item) => <button type="button" key={item.id} onClick={() => chooseProvider(item.id)} aria-pressed={provider === item.id} className={`group rounded-lg border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-cyan)] ${provider === item.id ? "border-[var(--chart-cyan)] bg-[var(--cyan-wash)]" : "border-[var(--line-strong)] bg-[var(--depth-panel)]/65 hover:border-[var(--chart-cyan)]"}`}><div className="flex items-center justify-between"><span className="reading text-[10px] text-[var(--chart-cyan)]">{item.number}</span><span className="reading text-[9px] tracking-[0.16em] text-[var(--faint)]">{item.tag}</span></div><div className="display mt-8 text-xl font-medium">{item.name}</div><div className="mt-1 text-sm text-[var(--muted)]">{item.dataset}</div><div className="mt-4 border-t border-[var(--line)] pt-3 text-xs leading-5 text-[var(--faint)]">{item.detail}</div></button>)}</div>
          {!provider ? <div className="mt-4 rounded-lg border border-dashed border-[var(--line-strong)] p-6 text-center"><Database className="mx-auto size-5 text-[var(--faint)]"/><p className="mt-3 text-sm text-[var(--muted)]">Choose a verified source to configure a real request.</p></div> : <form onSubmit={submit} className="mt-4 rounded-lg border border-[var(--line-strong)] bg-[var(--depth-panel)]/75 p-5 sm:p-6"><div className="flex items-center justify-between border-b border-[var(--line)] pb-4"><div><div className="text-[9px] uppercase tracking-[0.16em] text-[var(--faint)]">02 / Configure query</div><h2 className="display mt-1 text-lg font-medium">{definition?.dataset}</h2></div><span className="reading text-[9px] text-[var(--chart-cyan)]">VERIFIED</span></div>
            {provider === "noaa-oisst" ? <div className="mt-5 grid gap-4 sm:grid-cols-3"><Field label="Latitude"><input required type="number" step="0.001" min="-89.875" max="89.875" className={inputClass} value={latitude} onChange={(e) => edited(setLatitude, e.target.value)} /></Field><Field label="Longitude"><input required type="number" step="0.001" min="-180" max="180" className={inputClass} value={longitude} onChange={(e) => edited(setLongitude, e.target.value)} /></Field><Field label="Observation date"><input required type="date" className={inputClass} value={date} onChange={(e) => edited(setDate, e.target.value)} /></Field></div> : <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Float / WMO number"><input required inputMode="numeric" className={inputClass} value={platform} onChange={(e) => edited(setPlatform, e.target.value)} /></Field><Field label="Cycle number"><input required type="number" min="0" className={inputClass} value={cycle} onChange={(e) => edited(setCycle, e.target.value)} /></Field></div>}
            <div className="mt-5"><div className="mb-2 text-[9px] uppercase tracking-[0.16em] text-[var(--faint)]">Parameters</div><div className="flex flex-wrap gap-2">{(provider === "noaa-oisst" ? ["sst", "anom", "err", "ice"] : ["pres", "temp", "psal"]).map((parameter) => <button type="button" key={parameter} onClick={() => toggleParameter(parameter)} className={`reading rounded-md border px-3 py-2 text-xs uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-cyan)] ${parameters.includes(parameter) ? "border-[var(--chart-cyan)] bg-[var(--cyan-wash)] text-[var(--chart-cyan)]" : "border-[var(--line)] text-[var(--muted)]"}`}>{parameters.includes(parameter) && <Check className="mr-1 inline size-3"/>}{parameter}</button>)}</div></div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5"><div className="text-xs text-[var(--faint)]">Availability is checked before extraction.</div><Button type="submit" disabled={status === "checking" || parameters.length === 0}>{status === "checking" ? <><Activity className="size-4 animate-pulse"/>Contacting provider</> : <>Check & extract <ArrowRight className="size-4"/></>}</Button></div></form>}
        </div></section>
      {error && <section role="alert" className="mt-8 rounded-lg border border-[var(--coral-alert)] bg-[var(--coral-wash)] p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--coral-alert)]"/><div><h2 className="display font-medium text-[var(--coral-alert)]">Provider request unavailable</h2><p className="mt-2 text-sm leading-6 text-[var(--foam)]">{error.message}</p><p className="mt-2 text-xs text-[var(--muted)]">Confirm the provider is reachable, then retry. Your query remains in the readout.</p>{error.providerUrl && <div className="reading mt-3 break-all text-[10px] text-[var(--faint)]">{decodeURIComponent(error.providerUrl)}</div>}</div></div></section>}
      <div id="results">{result && <ResultPanel result={result}/>}</div>
    </div>
  </main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-2 block text-[9px] uppercase tracking-[0.16em] text-[var(--faint)]">{label}</span>{children}</label>; }

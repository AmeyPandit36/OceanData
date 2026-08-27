"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Radio } from "lucide-react";

export type ReadoutStatus = "idle" | "selecting" | "checking" | "success" | "failed";

interface ReadoutBarProps {
  status: ReadoutStatus;
  provider?: string;
  dataset?: string;
  position?: string;
  range?: string;
}

const statusConfig = {
  idle: { label: "IDLE", detail: "Awaiting provider", tone: "text-[var(--muted)]", Icon: Radio },
  selecting: { label: "SELECTING", detail: "Build the query", tone: "text-[var(--signal-amber)]", Icon: Radio },
  checking: { label: "CHECKING", detail: "Contacting source", tone: "text-[var(--signal-amber)]", Icon: LoaderCircle },
  success: { label: "AVAILABLE", detail: "Source responded", tone: "text-[var(--chart-cyan)]", Icon: CheckCircle2 },
  failed: { label: "UNAVAILABLE", detail: "Review request", tone: "text-[var(--coral-alert)]", Icon: AlertCircle },
} as const;

export function ReadoutBar({ status, provider, dataset, position, range }: ReadoutBarProps) {
  const config = statusConfig[status];
  const Icon = config.Icon;
  const fields = [
    { label: "Provider", value: provider || "—" },
    { label: "Dataset", value: dataset || "—" },
    { label: "Lat / Lon", value: position || "— / —" },
    { label: "Range", value: range || "— → —" },
  ];

  return (
    <section aria-label="Current query readout" aria-live="polite" className="sticky top-0 z-30 border-y border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--abyss)_94%,transparent)] shadow-[0_16px_48px_color-mix(in_srgb,var(--abyss)_70%,transparent)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y divide-[var(--line)] px-4 sm:px-6 lg:grid-cols-[1fr_1.35fr_1fr_1.35fr_1fr] lg:divide-y-0 lg:px-10">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0 px-3 py-3 first:pl-0 sm:px-5 lg:py-4">
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">{field.label}</div>
            <div className="reading truncate text-xs text-[var(--foam)] sm:text-sm">{field.value}</div>
          </div>
        ))}
        <div className="col-span-2 flex items-center gap-3 px-3 py-3 sm:px-5 lg:col-span-1 lg:py-4 lg:pr-0">
          <Icon aria-hidden="true" className={`size-4 shrink-0 ${config.tone} ${status === "checking" ? "animate-spin motion-reduce:animate-none" : ""}`} />
          <div className="min-w-0">
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--faint)]">Status</div>
            <div className={`reading truncate text-xs font-medium sm:text-sm ${config.tone}`}>{config.label} <span className="hidden font-normal text-[var(--faint)] xl:inline">/ {config.detail}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

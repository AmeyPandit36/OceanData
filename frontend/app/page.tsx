"use client";

import { useState } from "react";
import { Activity, ArrowRight, Braces, Database, Menu, Waves } from "lucide-react";
import { ReadoutBar, type ReadoutStatus } from "@/components/readout-bar";
import { Button } from "@/components/ui/button";

const states: ReadoutStatus[] = ["idle", "selecting", "checking", "success", "failed"];

const workflow = [
  { n: "01", title: "Choose a source", body: "Start with an authoritative provider and one of its verified datasets." },
  { n: "02", title: "Define the window", body: "Resolve a place, confirm coordinates, parameters, and time range." },
  { n: "03", title: "Verify & extract", body: "Test availability before retrieving and preserving the real response." },
];

export default function Home() {
  const [status, setStatus] = useState<ReadoutStatus>("idle");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="instrument-grid pointer-events-none absolute inset-0 opacity-35" />
      <div aria-hidden="true" className="contours pointer-events-none absolute inset-0 opacity-80" />

      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 sm:px-6 lg:px-10 lg:py-7">
        <a href="#main-content" className="group flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--chart-cyan)]">
          <span className="grid size-9 place-items-center rounded-full border border-[var(--chart-cyan)] bg-[var(--cyan-wash)] text-[var(--chart-cyan)]"><Waves className="size-5" aria-hidden="true" /></span>
          <span><span className="display block text-lg font-semibold leading-none tracking-[-0.03em]">OceanData</span><span className="reading mt-1 block text-[9px] uppercase tracking-[0.18em] text-[var(--faint)]">Observation console</span></span>
        </a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
          <a className="text-[var(--foam)] underline decoration-[var(--chart-cyan)] decoration-2 underline-offset-8" href="#explorer">Explorer</a>
          <a className="transition-colors hover:text-[var(--foam)]" href="#providers">Providers</a>
          <a className="transition-colors hover:text-[var(--foam)]" href="#runs">Request log</a>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button>
        <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] md:flex"><span className="size-1.5 rounded-full bg-[var(--signal-amber)]" /> Feasibility phase</div>
      </header>

      <ReadoutBar status={status} />

      <div id="main-content" className="relative z-10 mx-auto max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 lg:px-10 lg:pb-24 lg:pt-16">
        <section id="explorer" className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)] lg:gap-16">
          <div>
            <div className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--chart-cyan)]"><span className="h-px w-8 bg-[var(--chart-cyan)]" /> Data source explorer</div>
            <h1 className="display max-w-3xl text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-7xl">Trace ocean data<br /><span className="text-[var(--muted)]">to the source.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">Build a precise request, verify that observations exist, and preserve what the provider actually returns—success or failure.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button disabled>Begin query <ArrowRight className="size-4" /></Button>
              <span className="text-xs text-[var(--faint)]">Provider connections are under verification.</span>
            </div>
          </div>

          <aside className="self-end rounded-lg border border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--depth-panel)_88%,transparent)] p-1 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="rounded-md border border-[var(--line)] bg-[var(--abyss)]/50 p-5 sm:p-6">
              <div className="flex items-center justify-between"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Readout state preview</div><Activity className="size-4 text-[var(--chart-cyan)]" /></div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Preview system states without claiming a live provider response.</p>
              <div className="mt-5 grid grid-cols-2 gap-2" role="group" aria-label="Preview readout status">
                {states.map((item) => <Button key={item} size="sm" variant={status === item ? "default" : "outline"} className="reading justify-start uppercase" onClick={() => setStatus(item)} aria-pressed={status === item}>{item}</Button>)}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-16 border-t border-[var(--line-strong)] pt-8 lg:mt-24 lg:pt-10" aria-labelledby="workflow-title">
          <div className="mb-7 flex items-end justify-between"><div><div className="reading text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Method / 001</div><h2 id="workflow-title" className="display mt-2 text-2xl font-medium tracking-[-0.025em]">A request you can audit</h2></div><Braces className="hidden size-5 text-[var(--faint)] sm:block" /></div>
          <div className="grid border-y border-[var(--line)] md:grid-cols-3 md:divide-x md:divide-[var(--line)]">
            {workflow.map((item) => <article key={item.n} className="border-b border-[var(--line)] py-6 last:border-0 md:border-0 md:px-7 md:first:pl-0 md:last:pr-0"><div className="reading text-xs text-[var(--chart-cyan)]">{item.n}</div><h3 className="display mt-5 text-lg font-medium">{item.title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">{item.body}</p></article>)}
          </div>
        </section>

        <section id="providers" className="mt-10 grid gap-4 rounded-lg border border-dashed border-[var(--line-strong)] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
          <span className="grid size-10 place-items-center rounded-md bg-[var(--cyan-wash)] text-[var(--chart-cyan)]"><Database className="size-5" /></span>
          <div><h2 className="display font-medium">No provider selected</h2><p className="mt-1 text-sm text-[var(--muted)]">Verified datasets will appear here when feasibility checks are complete.</p></div>
          <div className="reading text-[10px] uppercase tracking-[0.16em] text-[var(--signal-amber)]">Investigation active</div>
        </section>
      </div>
    </main>
  );
}

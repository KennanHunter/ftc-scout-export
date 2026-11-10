"use client";

import { useCallback, useRef, useState } from "react";
import type {
  FullRecord,
  SeasonKey,
  StreamEvent,
  StreamPhase,
} from "@/app/_export/types";

export type FailedBatch = { index: number; skip: number; take: number };

export type StreamState = {
  uuid: string | null;
  season: SeasonKey;
  records: FullRecord[];
  completed: number;
  total: number;
  successes: number;
  errors: number;
  done: boolean;
  failedBatches: FailedBatch[];
  fatalError: string | null;
  phase: { phase: StreamPhase; label: string } | null;
};

const parseLines = (buffer: string) => {
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  return { lines: lines.filter((l) => l.trim().length > 0), rest };
};

async function readStream(
  resp: Response,
  onEvent: (ev: StreamEvent) => void,
  signal: AbortSignal
) {
  if (!resp.body) throw new Error("no body");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    if (signal.aborted) {
      await reader.cancel();
      return;
    }
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { lines, rest } = parseLines(buffer);
    buffer = rest;
    for (const line of lines) {
      try {
        const ev = JSON.parse(line) as StreamEvent;
        onEvent(ev);
      } catch {}
    }
  }
  buffer += decoder.decode();
  const { lines } = parseLines(buffer + "\n");
  for (const line of lines) {
    try {
      onEvent(JSON.parse(line) as StreamEvent);
    } catch {}
  }
}

export function useExportStream(initial: {
  season: SeasonKey;
  uuid: string | null;
  seedRecords?: FullRecord[];
  seedDone?: boolean;
  totalBatchesHint?: number;
}) {
  const [state, setState] = useState<StreamState>(() => ({
    uuid: initial.uuid,
    season: initial.season,
    records: initial.seedRecords ?? [],
    completed: 0,
    total: initial.totalBatchesHint ?? 0,
    successes: 0,
    errors: 0,
    done: Boolean(initial.seedDone),
    failedBatches: [],
    fatalError: null,
    phase: null,
  }));
  const abortRef = useRef<AbortController | null>(null);

  const handleEvent = useCallback((ev: StreamEvent) => {
    setState((prev) => {
      switch (ev.type) {
        case "phase":
          return { ...prev, phase: { phase: ev.phase, label: ev.label } };
        case "meta":
          return {
            ...prev,
            uuid: ev.uuid,
            season: ev.season,
            total: ev.totalBatches,
            done: false,
          };
        case "rows":
          return { ...prev, records: [...prev.records, ...ev.rows] };
        case "progress":
          return { ...prev, completed: ev.completed, total: ev.total };
        case "error":
          if (ev.batchIndex < 0) {
            return { ...prev, fatalError: ev.message };
          }
          return {
            ...prev,
            failedBatches: [
              ...prev.failedBatches,
              { index: ev.batchIndex, skip: ev.skip, take: ev.take },
            ],
          };
        case "done":
          return {
            ...prev,
            done: true,
            successes: prev.successes + ev.successes,
            errors: ev.errors,
          };
      }
      return prev;
    });
  }, []);

  const start = useCallback(
    async (body: { season: SeasonKey; totalTeams: number; uuid?: string }) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setState({
        uuid: body.uuid ?? null,
        season: body.season,
        records: [],
        completed: 0,
        total: 0,
        successes: 0,
        errors: 0,
        done: false,
        failedBatches: [],
        fatalError: null,
        phase: null,
      });
      try {
        const resp = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        await readStream(resp, handleEvent, ctrl.signal);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState((p) => ({
          ...p,
          fatalError: err instanceof Error ? err.message : String(err),
          done: true,
        }));
      }
    },
    [handleEvent]
  );

  const retry = useCallback(async () => {
    const snapshot = state;
    if (!snapshot.uuid || snapshot.failedBatches.length === 0) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const batchesToRetry = snapshot.failedBatches;
    setState((p) => ({
      ...p,
      failedBatches: [],
      completed: 0,
      total: batchesToRetry.length,
      done: false,
      errors: 0,
    }));
    try {
      const resp = await fetch(
        `/api/export/${encodeURIComponent(snapshot.uuid)}/retry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            season: snapshot.season,
            batches: batchesToRetry,
            existingRecords: snapshot.records,
            expectedTotalBatches: snapshot.total,
          }),
          signal: ctrl.signal,
        }
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      await readStream(resp, handleEvent, ctrl.signal);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((p) => ({
        ...p,
        fatalError: err instanceof Error ? err.message : String(err),
        done: true,
      }));
    }
  }, [state, handleEvent]);

  return { state, start, retry };
}

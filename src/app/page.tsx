"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SEASONS = {
  "2026": { label: "2026-2027 BIOBUZZ" },
  "2025": { label: "2025-2026 DECODE" },
} as const;

type SeasonKey = keyof typeof SEASONS;

export default function Home() {
  const router = useRouter();
  const [totalTeams, setTotalTeams] = useState(6000);
  const [season, setSeason] = useState<SeasonKey>("2026");
  const [starting, setStarting] = useState(false);

  const handleStart = () => {
    if (starting) return;
    setStarting(true);
    const uuid = crypto.randomUUID();
    router.push(
      `/${uuid}/view?live=1&season=${season}&totalTeams=${totalTeams}`
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 grid place-items-center">
      <main className="bg-neutral-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-neutral-800">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">FTC Scout Export</h1>
          <p className="text-neutral-400 text-sm">
            Stream team rankings into a live table
          </p>
        </div>

        <div className="mb-5">
          <label htmlFor="season" className="block text-sm font-medium text-neutral-300 mb-2">
            Season
          </label>
          <select
            id="season"
            value={season}
            onChange={(e) => setSeason(e.target.value as SeasonKey)}
            disabled={starting}
            className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          >
            {Object.entries(SEASONS).map(([k, { label }]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label
            htmlFor="totalTeams"
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            Total number of team-event entries
          </label>
          <input
            id="totalTeams"
            type="number"
            value={totalTeams ? totalTeams : ""}
            onChange={(e) => setTotalTeams(Number(e.target.value))}
            disabled={starting}
            min={1}
            max={20000}
            className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
            Each team-event combination counts as one entry. Setting this higher
            than needed won&apos;t break anything but may slow things down.
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50"
        >
          {starting ? "Starting…" : "Start export"}
        </button>

        <div className="mt-6 text-center text-xs text-neutral-500">
          <p>
            Programmed by{" "}
            <a
              href="https://github.com/kennanhunter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Kennan Hunter
            </a>{" "}
            for{" "}
            <a
              href="https://funroboticsnetwork.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              FUN Robotics Network
            </a>
          </p>
          <p className="mt-2">
            <a
              href="https://github.com/KennanHunter/ftc-scout-export"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

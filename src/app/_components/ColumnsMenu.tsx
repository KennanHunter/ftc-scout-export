"use client";

import { useEffect, useRef } from "react";

export type ColumnsMenuProps = {
  headers: readonly string[];
  visibility: Record<string, boolean>;
  onToggle: (header: string, visible: boolean) => void;
  onAll: (visible: boolean) => void;
  labelFor?: (header: string) => string;
};

export default function ColumnsMenu({
  headers,
  visibility,
  onToggle,
  onAll,
  labelFor,
}: ColumnsMenuProps) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDocClick = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const hiddenCount = headers.filter((h) => visibility[h] === false).length;

  return (
    <details ref={ref} className="relative">
      <summary className="list-none cursor-pointer h-7 px-2 rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs text-neutral-200 select-none inline-flex items-center">
        Columns{hiddenCount > 0 ? ` (${headers.length - hiddenCount}/${headers.length})` : ""} ▾
      </summary>
      <div className="absolute right-0 mt-1 z-20 w-64 max-h-80 overflow-auto rounded-md border border-neutral-800 bg-neutral-900 shadow-xl p-2">
        <div className="flex justify-between gap-2 mb-2 pb-2 border-b border-neutral-800">
          <button
            onClick={() => onAll(true)}
            className="text-[11px] text-indigo-300 hover:text-indigo-200 underline"
          >
            Show all
          </button>
          <button
            onClick={() => onAll(false)}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 underline"
          >
            Hide all
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {headers.map((h) => {
            const visible = visibility[h] !== false;
            return (
              <li key={h}>
                <label className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-neutral-800 cursor-pointer text-xs text-neutral-200">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => onToggle(h, e.target.checked)}
                    className="accent-indigo-500"
                  />
                  <span className="font-mono truncate">
                    {labelFor ? labelFor(h) : h}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}

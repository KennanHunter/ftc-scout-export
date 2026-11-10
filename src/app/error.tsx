"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-200">
      <div className="max-w-md p-6 bg-neutral-900 rounded-xl border border-neutral-800">
        <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-neutral-400 mb-4 break-words">
          {error.message}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

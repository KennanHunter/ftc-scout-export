export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-200">
      <div className="max-w-md p-6 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
        <h1 className="text-xl font-semibold mb-2">Export not found</h1>
        <p className="text-sm text-neutral-400">
          This export doesn&apos;t exist or has expired. Start a new one from the
          home page.
        </p>
        <a
          href="/"
          className="mt-4 inline-block px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

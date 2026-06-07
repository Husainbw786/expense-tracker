export default function Loading() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "75vh" }}>
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
    </div>
  );
}

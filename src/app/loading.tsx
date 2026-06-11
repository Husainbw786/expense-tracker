export default function Loading() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "75vh" }}>
      <div className="flex flex-col items-center gap-4">
        <span
          className="h-9 w-9 animate-spin rounded-full border-2 border-rose-border"
          style={{ borderTopColor: "var(--rose)" }}
        />
        <span className="ts-eyebrow">Loading</span>
      </div>
    </div>
  );
}

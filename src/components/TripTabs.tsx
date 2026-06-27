import Link from "next/link";

/* Segmented control at the top of trip screens: Summary · Expenses · On trip */
export default function TripTabs({
  tripId,
  active,
}: {
  tripId: number;
  active: "summary" | "expenses" | "ontrip";
}) {
  const base = `/trips/${tripId}`;
  const tabs: { key: typeof active; label: string; href: string }[] = [
    { key: "summary", label: "Summary", href: base },
    { key: "expenses", label: "Expenses", href: `${base}/expenses` },
    { key: "ontrip", label: "On trip", href: `${base}/members` },
  ];
  return (
    <div className="ts-tabs">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`ts-tab ${active === t.key ? "is-active" : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripSummary, getTripExpensesWithDetails } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { requireTripAccess } from "@/lib/auth";
import TripTabs from "@/components/TripTabs";
import DeleteTripButton from "@/components/DeleteTripButton";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* net → colored tag */
function NetTag({ net }: { net: number }) {
  const settled = Math.abs(net) < 0.01;
  if (settled) return <span className="text-[0.78rem] font-semibold text-ink-2">even</span>;
  const gets = net > 0;
  const color = gets ? "var(--green)" : "var(--rose-ink)";
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[0.7rem] font-semibold" style={{ color }}>
        {gets ? "gets" : "owes"}
      </span>
      <span className="ts-money text-[1rem]" style={{ color }}>
        {formatMoney(Math.abs(net))}
      </span>
    </span>
  );
}

export default async function TripSummary({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tripId = Number(id);
  const { role } = await requireTripAccess(tripId, "viewer");
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const s = await getTripSummary(tripId);
  const expenses = await getTripExpensesWithDetails(tripId);

  // spending by category
  const byCat = new Map<string, number>();
  for (const e of expenses) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount);
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  const maxNet = Math.max(0.01, ...s.familyBalances.map((f) => Math.abs(f.net)));

  return (
    <main className="px-5 pb-32">
      {/* Header */}
      <div className="pt-3">
        <Link href="/" className="ts-textlink inline-flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          All trips
        </Link>
        <h1 className="ts-display mt-2.5 text-[1.85rem]">{trip.name}</h1>
        <p className="ts-meta mt-1">{fmtDate(trip.startDate) ?? "No date set"}</p>
      </div>

      <div className="mt-4">
        <TripTabs tripId={tripId} active="summary" />
      </div>

      {s.memberCount === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Empty trip</p>
          <p className="ts-h2 mt-3">No one on this trip yet</p>
          <p className="ts-micro mt-2 mb-6">Add who&apos;s coming along.</p>
          <Link href={`/trips/${tripId}/members`} className="btn-primary">
            Add people to trip
          </Link>
        </div>
      ) : (
        <div className="pt-5">
          {/* Stat tiles */}
          <div className="flex gap-2.5">
            <div className="ts-stat flex-[1.4]">
              <p className="ts-money text-[1.45rem] leading-none">{formatMoney(s.totalSpent)}</p>
              <p className="ts-meta mt-1.5">Total</p>
            </div>
            <div className="ts-stat flex-1">
              <p className="ts-money text-[1.45rem] leading-none">{s.memberCount}</p>
              <p className="ts-meta mt-1.5">People</p>
            </div>
            <div className="ts-stat flex-1">
              <p className="ts-money text-[1.45rem] leading-none">{s.expenseCount}</p>
              <p className="ts-meta mt-1.5">Expenses</p>
            </div>
          </div>

          {/* Where the money went */}
          {s.totalSpent > 0 && (
            <section className="mt-7">
              <p className="mb-3 text-[0.94rem] font-semibold text-ink">Where the money went</p>
              <div className="flex flex-col gap-2.5">
                {cats.map(([cat, amt]) => {
                  const pct = Math.round((amt / s.totalSpent) * 100);
                  return (
                    <div key={cat} className="card p-4">
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <span className="text-[0.92rem] font-semibold text-ink">{cat}</span>
                        <span className="ts-money text-[0.95rem]">{formatMoney(amt)}</span>
                      </div>
                      <div className="ts-track">
                        <div className="ts-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <p className="ts-meta mt-2">{pct}% of spending</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Family balances */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.94rem] font-semibold text-ink">Family balances</p>
              <span className="ts-meta text-ink-3">tap for detail</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {s.familyBalances.map((f) => {
                const settled = Math.abs(f.net) < 0.01;
                const w = Math.round((Math.abs(f.net) / maxNet) * 100);
                const color = f.net > 0 ? "var(--green)" : "var(--rose-ink)";
                return (
                  <details key={f.id} className="card group p-4">
                    <summary className="flex cursor-pointer list-none flex-col gap-0 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-[0.94rem] font-semibold leading-tight text-ink">
                          {f.name}
                        </span>
                        <NetTag net={f.net} />
                      </span>
                      <span className="my-2.5 block">
                        <span className="ts-track block">
                          <span
                            className="ts-fill block"
                            style={{ width: settled ? "0%" : `${w}%`, background: color }}
                          ></span>
                        </span>
                      </span>
                      <span className="ts-meta">
                        {f.memberCount} {f.memberCount === 1 ? "person" : "people"} · paid{" "}
                        {formatMoney(f.paid)} · share {formatMoney(f.share)}
                      </span>
                    </summary>
                    <div className="mt-3 border-t border-hairline pt-3">
                      {f.members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-4 py-1.5">
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-[0.9rem] font-medium text-ink">{m.name}</span>
                            <span className="ts-meta">
                              paid {formatMoney(m.paid)} · share {formatMoney(m.share)}
                            </span>
                          </span>
                          <NetTag net={m.net} />
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>

          {/* Who pays whom */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.94rem] font-semibold text-ink">Who pays whom</p>
              <span className="ts-meta text-ink-3">
                {s.settlement.length} {s.settlement.length === 1 ? "transfer" : "transfers"}
              </span>
            </div>
            {s.settlement.length === 0 ? (
              <p className="ts-micro rounded-[14px] border border-hairline bg-surface-card px-4 py-4">
                {s.expenseCount === 0
                  ? "No expenses yet — add one to see the settlement."
                  : "All settled — everyone is even."}
              </p>
            ) : (
              <div className="card overflow-hidden">
                {s.settlement.map((t, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                      i < s.settlement.length - 1 ? "border-b border-hairline" : ""
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-[0.88rem] font-semibold text-ink">{t.fromName}</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M5 12h14M13 6l6 6-6 6"></path>
                      </svg>
                      <span className="text-[0.88rem] font-medium text-ink-2">{t.toName}</span>
                    </span>
                    <span className="ts-money shrink-0 text-[0.98rem]">{formatMoney(t.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <Link href={`/trips/${tripId}/activity`} className="btn-ghost flex-1">
                Activity
              </Link>
              {role === "owner" && (
                <Link href={`/trips/${tripId}/collaborators`} className="btn-ghost flex-1">
                  Share &amp; invite
                </Link>
              )}
            </div>
            <div className="flex gap-2.5">
              <a href={`/api/trips/${tripId}/bill/simple`} className="btn-ghost flex-1">
                Bill
              </a>
              <a href={`/api/trips/${tripId}/bill/detailed`} className="btn-ghost flex-1">
                Detailed bill
              </a>
            </div>
            {role === "owner" && (
              <div className="pt-1 text-center">
                <DeleteTripButton tripId={tripId} />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

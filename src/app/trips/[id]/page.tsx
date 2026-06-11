import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip, getTripSummary, getTripExpensesWithDetails } from "@/lib/data";
import { formatMoney } from "@/lib/calc";
import { requireTripAccess } from "@/lib/auth";
import DeleteTripButton from "@/components/DeleteTripButton";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
}

/* net → colored tag */
function NetTag({ net }: { net: number }) {
  const settled = Math.abs(net) < 0.01;
  if (settled)
    return <span className="text-[0.66rem] uppercase tracking-[0.16em] text-ink-2">even</span>;
  const gets = net > 0;
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span
        className={`text-[0.66rem] font-semibold uppercase tracking-[0.16em] ${
          gets ? "text-green" : "text-rose-ink"
        }`}
      >
        {gets ? "gets" : "owes"}
      </span>
      <span className={`ts-money text-[0.84rem] ${gets ? "text-green" : "text-rose-ink"}`}>
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
  const maxCat = cats.length ? cats[0][1] : 1;

  const maxNet = Math.max(0.01, ...s.familyBalances.map((f) => Math.abs(f.net)));

  return (
    <main className="px-6 pb-28">
      {/* ── Header ── */}
      <div className="pt-7">
        <Link href="/" className="ts-textlink ts-textlink--rose inline-flex items-center gap-1.5">
          ← All trips
        </Link>
        <h1 className="ts-display mt-3.5">{trip.name}</h1>
        <p className="ts-micro mt-2">{fmtDate(trip.startDate) ?? "NO DATE SET"}</p>

        {s.memberCount > 0 && (
          <div className="mt-6 grid grid-cols-[1.4fr_1fr_1fr] border-y border-hairline">
            <div className="py-4 pr-2">
              <p className="ts-money text-[1.55rem] leading-none">{formatMoney(s.totalSpent)}</p>
              <p className="ts-eyebrow mt-2">Total</p>
            </div>
            <div className="border-l border-hairline py-4 pl-4">
              <p className="ts-money text-[1.55rem] leading-none">{s.memberCount}</p>
              <p className="ts-eyebrow mt-2">People</p>
            </div>
            <div className="border-l border-hairline py-4 pl-4">
              <p className="ts-money text-[1.55rem] leading-none">{s.expenseCount}</p>
              <p className="ts-eyebrow mt-2">Expenses</p>
            </div>
          </div>
        )}

        {/* quiet actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 pb-1">
          <Link href={`/trips/${tripId}/activity`} className="ts-textlink">
            Activity
          </Link>
          <span className="text-border-strong">·</span>
          {role === "owner" && (
            <>
              <Link href={`/trips/${tripId}/collaborators`} className="ts-textlink">
                Share &amp; invite
              </Link>
              <span className="text-border-strong">·</span>
            </>
          )}
          <a href={`/api/trips/${tripId}/bill/simple`} className="ts-textlink">
            Bill
          </a>
          <span className="text-border-strong">·</span>
          <a href={`/api/trips/${tripId}/bill/detailed`} className="ts-textlink">
            Detailed bill
          </a>
        </div>
        {role === "owner" && (
          <div className="pt-2">
            <DeleteTripButton tripId={tripId} />
          </div>
        )}
      </div>

      {s.memberCount === 0 ? (
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="ts-eyebrow ts-eyebrow--accent">Empty trip</p>
          <p className="ts-h2 mt-3">No one on this trip yet</p>
          <p className="ts-micro mt-2 mb-6">Add who&apos;s coming along.</p>
          <Link href={`/trips/${tripId}/members`} className="btn-ghost">
            Add people to trip
          </Link>
        </div>
      ) : (
        <div className="pt-6">
          {/* ── 1. Where the money went ── */}
          {s.totalSpent > 0 && (
            <section>
              <div className="ts-ledgerhead">
                <p className="ts-eyebrow ts-eyebrow--accent">Where the money went</p>
                <span className="ts-meta">{s.expenseCount} expenses</span>
              </div>
              <div className="flex flex-col gap-4 pt-5 pb-1">
                {cats.map(([cat, amt]) => (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-4">
                      <span className="text-[0.84rem] tracking-[0.04em] text-ink">{cat}</span>
                      <span className="flex items-baseline gap-2.5">
                        <span className="ts-meta">
                          {Math.round((amt / s.totalSpent) * 100)}%
                        </span>
                        <span className="ts-money text-[0.84rem]">{formatMoney(amt)}</span>
                      </span>
                    </div>
                    <div className="ts-track">
                      <div className="ts-fill" style={{ width: `${(amt / maxCat) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 2. Family balances — diverging bars, tap to expand ── */}
          <section className="mt-10">
            <div className="ts-ledgerhead">
              <p className="ts-eyebrow ts-eyebrow--accent">Family balances</p>
              <span className="ts-meta">tap a family for detail</span>
            </div>
            <div>
              {s.familyBalances.map((f) => {
                const settled = Math.abs(f.net) < 0.01;
                const w = (Math.abs(f.net) / maxNet) * 100;
                return (
                  <details key={f.id} className="group border-b border-hairline">
                    <summary className="flex cursor-pointer list-none flex-col gap-2 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="text-[0.9rem] tracking-[0.03em] text-ink group-hover:text-rose">
                          {f.name}
                        </span>
                        <NetTag net={f.net} />
                      </span>
                      <span className="flex h-[9px]">
                        <span className="relative flex-1 border border-r-0 border-hairline bg-surface-inset">
                          {!settled && f.net < 0 && (
                            <span
                              className="absolute inset-y-0 right-0 bg-rose"
                              style={{ width: `${w}%` }}
                            ></span>
                          )}
                        </span>
                        <span className="relative flex-1 border border-hairline border-l-ink bg-surface-inset">
                          {!settled && f.net > 0 && (
                            <span
                              className="absolute inset-y-0 left-0 bg-green"
                              style={{ width: `${w}%` }}
                            ></span>
                          )}
                        </span>
                      </span>
                      <span className="ts-meta">
                        {f.memberCount} {f.memberCount === 1 ? "PERSON" : "PEOPLE"} · PAID{" "}
                        {formatMoney(f.paid)} · SHARE {formatMoney(f.share)}
                      </span>
                    </summary>
                    <div className="pb-4">
                      {f.members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-4 py-1.5">
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-[0.9rem] tracking-[0.03em] text-ink">
                              {m.name}
                            </span>
                            <span className="ts-meta">
                              PAID {formatMoney(m.paid)} · SHARE {formatMoney(m.share)}
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

          {/* ── 3. Who pays whom ── */}
          <section className="mt-10">
            <div className="ts-ledgerhead">
              <p className="ts-eyebrow ts-eyebrow--accent">The bottom line</p>
              <span className="ts-meta">
                {s.settlement.length} {s.settlement.length === 1 ? "transfer" : "transfers"}
              </span>
            </div>
            <h2 className="ts-h2 mt-3.5 mb-1.5">
              Who pays <em>whom</em>
            </h2>
            {s.settlement.length === 0 ? (
              <p className="ts-micro border-b border-hairline py-4">
                {s.expenseCount === 0
                  ? "No expenses yet — add one to see the settlement."
                  : "All settled — everyone is even."}
              </p>
            ) : (
              <div>
                {s.settlement.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-b border-hairline py-3.5"
                  >
                    <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-2">
                      <span className="whitespace-nowrap text-[0.92rem] font-light tracking-[0.03em] text-ink">
                        {t.fromName}
                      </span>
                      <span className="text-[0.9rem] text-rose">→</span>
                      <span className="whitespace-nowrap text-[0.92rem] font-semibold tracking-[0.03em] text-ink">
                        {t.toName}
                      </span>
                    </span>
                    <span className="ts-money shrink-0 text-[1.08rem]">
                      {formatMoney(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
